(() => {
  const PAGE_SIZE = 200;
  const DEFAULT_LANG = 'en';

  const langNamer = (() => {
    try {
      return new Intl.DisplayNames(['en'], {
        type: 'language',
        languageDisplay: 'standard',
        fallback: 'code',
      });
    } catch (e) {
      return null;
    }
  })();

  function langName(code) {
    if (!langNamer) return '';
    try {
      const name = langNamer.of(code);
      if (!name || name.toLowerCase() === code.toLowerCase()) return '';
      return name;
    } catch (e) {
      return '';
    }
  }

  function langLabel(code) {
    const name = langName(code);
    return name ? `${code.toUpperCase()} — ${name}` : code.toUpperCase();
  }

  const state = {
    xmlDoc: null,
    tus: [],            // array of {tuEl, tuvByLang:{lang: {tuvEl, segEl, originalText}}}
    languages: [],      // ordered list of all detected languages, EN first
    defaultLang: DEFAULT_LANG,
    compareLang: '',    // '' = show all languages
    filteredTuIdx: [],
    selected: new Set(), // tu indices selected for bulk actions
    filterModified: false,
    filterMissing: false,
    filterPlaceholder: false,
    deletedCount: 0,
    panelTu: null,
    page: 0,
    search: '',
    fileName: 'edited.tmx',
    isDirty: false,
  };

  function markDirty() { state.isDirty = true; }
  function markSaved() { state.isDirty = false; }

  window.addEventListener('beforeunload', (e) => {
    if (state.isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  window.addEventListener('resize', () => requestAnimationFrame(updateStickyOffsets));

  const $ = (id) => document.getElementById(id);
  const fileInput = $('file-input');
  const searchInput = $('search-input');
  const replaceBtn = $('replace-btn');
  const exportBtn = $('export-btn');
  const tbody = $('tbody');
  const theadRow = $('thead-row');
  const tableWrap = $('table-wrap');
  const emptyEl = $('empty');
  const statusEl = $('status');
  const paginationEl = $('pagination');
  const prevBtn = $('prev-page');
  const nextBtn = $('next-page');
  const pageInfo = $('page-info');
  const defaultLangSelect = $('default-lang-select');
  const compareLangSelect = $('compare-lang-select');
  const primaryControls = $('primary-controls');
  const secondaryControls = $('secondary-controls');
  const replaceDialog = $('replace-dialog');
  const dialogLangList = $('dialog-lang-list');
  const dialogSearchPreview = $('dialog-search-preview');
  const dialogReplaceInput = $('dialog-replace-input');
  const dialogMatchCase = $('dialog-match-case');
  const dialogMatchCount = $('dialog-match-count');
  const deleteBtn = $('delete-btn');
  const deleteCountEl = $('delete-count');
  const deleteDialog = $('delete-dialog');
  const deleteDialogCount = $('delete-dialog-count');
  const manageLangsBtn = $('manage-langs-btn');
  const manageLangsDialog = $('manage-langs-dialog');
  const langManageList = $('lang-manage-list');
  const langAddInput = $('lang-add-input');
  const addRowBtn = $('add-row-btn');
  const createNewBtn = $('create-new-btn');
  const undoBtn = $('undo-btn');
  const redoBtn = $('redo-btn');
  const tuPanel = $('tu-panel');
  const tuPanelTitle = $('tu-panel-title');
  const tuNotesList = $('tu-notes-list');
  const tuPropsList = $('tu-props-list');
  const tuAttrsEl = $('tu-attrs');

  const history = { undo: [], redo: [], max: 200 };
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const undoShortcut = isMac ? '⌘Z' : 'Ctrl+Z';
  const redoShortcut = isMac ? '⇧⌘Z' : 'Ctrl+Shift+Z';

  function pushCommand(label, undoFn, redoFn) {
    history.undo.push({ label, undo: undoFn, redo: redoFn });
    if (history.undo.length > history.max) history.undo.shift();
    history.redo.length = 0;
    refreshUndoUI();
    markDirty();
  }

  function performUndo() {
    const cmd = history.undo.pop();
    if (!cmd) return;
    cmd.undo();
    history.redo.push(cmd);
    refreshUndoUI();
    showToast(`Undid: ${cmd.label}`);
  }

  function performRedo() {
    const cmd = history.redo.pop();
    if (!cmd) return;
    cmd.redo();
    history.undo.push(cmd);
    refreshUndoUI();
    showToast(`Redid: ${cmd.label}`);
  }

  function refreshUndoUI() {
    undoBtn.disabled = history.undo.length === 0;
    redoBtn.disabled = history.redo.length === 0;
    const lastUndo = history.undo[history.undo.length - 1];
    const lastRedo = history.redo[history.redo.length - 1];
    undoBtn.title = lastUndo ? `Undo: ${lastUndo.label} (${undoShortcut})` : `Nothing to undo (${undoShortcut})`;
    redoBtn.title = lastRedo ? `Redo: ${lastRedo.label} (${redoShortcut})` : `Nothing to redo (${redoShortcut})`;
  }

  function clearHistory() {
    history.undo.length = 0;
    history.redo.length = 0;
    refreshUndoUI();
  }
  const toastEl = $('toast');
  let toastTimer = null;

  function showToast(message) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 3200);
  }

  fileInput.addEventListener('change', onFileSelected);
  searchInput.addEventListener('input', onSearch);
  replaceBtn.addEventListener('click', openReplaceDialog);
  exportBtn.addEventListener('click', onExport);
  prevBtn.addEventListener('click', () => { state.page--; render(); });
  nextBtn.addEventListener('click', () => { state.page++; render(); });
  defaultLangSelect.addEventListener('change', onDefaultLangChange);
  compareLangSelect.addEventListener('change', onCompareLangChange);
  $('dialog-cancel').addEventListener('click', () => replaceDialog.close());
  $('dialog-confirm').addEventListener('click', performReplace);
  $('dialog-select-all').addEventListener('click', () => { setAllLangChecked(true); refreshDialogMatchCount(); });
  $('dialog-clear').addEventListener('click', () => { setAllLangChecked(false); refreshDialogMatchCount(); });
  dialogMatchCase.addEventListener('change', refreshDialogMatchCount);
  dialogLangList.addEventListener('change', refreshDialogMatchCount);
  deleteBtn.addEventListener('click', openDeleteDialog);
  $('delete-cancel').addEventListener('click', () => deleteDialog.close());
  $('delete-confirm').addEventListener('click', performDelete);
  manageLangsBtn.addEventListener('click', openManageLangsDialog);
  $('manage-langs-close').addEventListener('click', () => manageLangsDialog.close());
  $('lang-add-btn').addEventListener('click', onAddLanguage);
  langAddInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onAddLanguage(); }
  });
  addRowBtn.addEventListener('click', addRow);
  createNewBtn.addEventListener('click', createNewFile);
  undoBtn.addEventListener('click', performUndo);
  redoBtn.addEventListener('click', performRedo);
  $('tu-panel-close').addEventListener('click', closeTuPanel);
  $('tu-notes-add').addEventListener('click', addNote);
  $('tu-props-add').addEventListener('click', addProp);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.panelTu && !document.querySelector('dialog[open]')) {
      const inPanel = e.target.closest && e.target.closest('#tu-panel');
      if (inPanel) { e.preventDefault(); closeTuPanel(); return; }
    }
    const meta = e.metaKey || e.ctrlKey;
    if (!meta || e.altKey) return;
    const t = e.target;
    if (t && t.matches && t.matches('input, textarea, [contenteditable=true]')) return;
    const key = e.key.toLowerCase();
    if (key === 'z' && !e.shiftKey) { e.preventDefault(); performUndo(); }
    else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); performRedo(); }
  });
  statusEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-filter-modified]')) {
      state.filterModified = !state.filterModified;
    } else if (e.target.closest('[data-filter-missing]')) {
      state.filterMissing = !state.filterMissing;
    } else if (e.target.closest('[data-filter-placeholder]')) {
      state.filterPlaceholder = !state.filterPlaceholder;
    } else {
      return;
    }
    state.page = 0;
    applyFilter();
    render();
  });

  function onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    state.fileName = file.name.replace(/\.tmx$/i, '') + '-edited.tmx';
    const reader = new FileReader();
    reader.onload = (ev) => parseTMX(ev.target.result);
    reader.readAsText(file);
  }

  function parseTMX(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      alert('Failed to parse TMX file: ' + errorNode.textContent);
      return;
    }
    state.xmlDoc = doc;
    state.tus = [];
    const langSet = new Set();
    const tuEls = doc.querySelectorAll('tu');
    tuEls.forEach((tuEl) => {
      const tuvByLang = {};
      tuEl.querySelectorAll('tuv').forEach((tuvEl) => {
        const segEl = tuvEl.querySelector('seg');
        if (!segEl) return;
        const lang = (tuvEl.getAttribute('xml:lang') || tuvEl.getAttribute('lang') || '').toLowerCase();
        if (!lang) return;
        langSet.add(lang);
        tuvByLang[lang] = {
          tuvEl,
          segEl,
          originalText: segEl.textContent,
        };
      });
      state.tus.push({ tuEl, tuvByLang });
    });

    const sorted = [...langSet].sort();
    state.languages = sorted.includes(DEFAULT_LANG)
      ? [DEFAULT_LANG, ...sorted.filter((l) => l !== DEFAULT_LANG)]
      : sorted;

    enterEditorView();
  }

  function createNewFile() {
    const xmlString = `<?xml version="1.0" encoding="utf-8"?>
<tmx version="1.4">
  <header creationtool="TMX Editor" creationtoolversion="1.0" datatype="PlainText" segtype="block" adminlang="en" srclang="en" o-tmf="custom"/>
  <body></body>
</tmx>`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    state.xmlDoc = doc;
    state.tus = [];
    state.languages = [DEFAULT_LANG];
    state.fileName = 'new-translation-memory.tmx';
    enterEditorView();
    openManageLangsDialog();
  }

  function enterEditorView() {
    state.page = 0;
    state.search = '';
    state.selected.clear();
    state.filterModified = false;
    state.filterMissing = false;
    state.filterPlaceholder = false;
    state.deletedCount = 0;
    closeTuPanel();
    searchInput.value = '';
    dialogReplaceInput.value = '';
    primaryControls.hidden = false;
    secondaryControls.hidden = false;
    emptyEl.hidden = true;
    tableWrap.hidden = false;
    clearHistory();
    markSaved();

    if (!state.languages.includes(state.defaultLang)) {
      state.defaultLang = state.languages.includes(DEFAULT_LANG)
        ? DEFAULT_LANG
        : (state.languages[0] || DEFAULT_LANG);
    }
    state.compareLang = '';

    populateLangSelects();
    renderHeader();
    applyFilter();
    render();
  }

  function addRow() {
    if (state.languages.length === 0) {
      showToast('Add a language first via Languages…');
      return;
    }
    const tuEl = state.xmlDoc.createElement('tu');
    tuEl.setAttribute('srclang', state.defaultLang);
    const body = state.xmlDoc.querySelector('body') || state.xmlDoc.documentElement;
    body.appendChild(tuEl);
    const newTu = { tuEl, tuvByLang: {} };
    state.tus.push(newTu);
    const newIdx = state.tus.length - 1;

    pushCommand(
      'Add row',
      () => {
        const idx = state.tus.indexOf(newTu);
        if (idx >= 0) state.tus.splice(idx, 1);
        if (newTu.tuEl.parentNode) newTu.tuEl.parentNode.removeChild(newTu.tuEl);
        applyFilter();
        render();
      },
      () => {
        state.tus.push(newTu);
        const bd = state.xmlDoc.querySelector('body') || state.xmlDoc.documentElement;
        bd.appendChild(newTu.tuEl);
        applyFilter();
        render();
      }
    );

    state.search = '';
    searchInput.value = '';
    state.filterModified = false;
    applyFilter();

    const filteredPos = state.filteredTuIdx.indexOf(newIdx);
    if (filteredPos >= 0) {
      state.page = Math.floor(filteredPos / PAGE_SIZE);
    }
    render();

    requestAnimationFrame(() => {
      const td = document.querySelector(
        `td.seg[data-tu-idx="${newIdx}"][data-lang="${state.defaultLang}"]`
      );
      if (td) {
        td.scrollIntoView({ behavior: 'smooth', block: 'center' });
        td.focus();
      }
    });

    showToast('New row added.');
  }

  function tuHasModified(tu) {
    for (const tuv of Object.values(tu.tuvByLang)) {
      if (tuv.segEl.textContent !== tuv.originalText) return true;
    }
    return false;
  }

  function tuMissingTranslation(tu) {
    const checkLangs = state.compareLang ? [state.compareLang] : state.languages;
    for (const lang of checkLangs) {
      const tuv = tu.tuvByLang[lang];
      if (!tuv || !tuv.segEl.textContent.trim()) return true;
    }
    return false;
  }

  const PLACEHOLDER_RE = /%(?:\d+\$)?[sdifgouxXeEcp@%]|\{[a-zA-Z0-9_.]*\}|\$\{[a-zA-Z0-9_.]+\}/g;

  function extractPlaceholders(text) {
    return text.match(PLACEHOLDER_RE) || [];
  }

  function sameMultiset(a, b) {
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    return sa.every((v, i) => v === sb[i]);
  }

  function tuHasPlaceholderIssue(tu) {
    const checkLangs = state.compareLang
      ? [state.defaultLang, state.compareLang]
      : state.languages;
    const sets = [];
    for (const lang of checkLangs) {
      const tuv = tu.tuvByLang[lang];
      if (!tuv) continue;
      const text = tuv.segEl.textContent;
      if (!text.trim()) continue;
      sets.push(extractPlaceholders(text));
    }
    if (sets.length < 2) return false;
    const ref = sets[0];
    for (let i = 1; i < sets.length; i++) {
      if (!sameMultiset(ref, sets[i])) return true;
    }
    return false;
  }

  function applyFilter() {
    const q = state.search.trim().toLowerCase();
    const langs = visibleLanguages();
    const rows = [];
    state.tus.forEach((tu, tuIdx) => {
      if (state.filterModified && !tuHasModified(tu)) return;
      if (state.filterMissing && !tuMissingTranslation(tu)) return;
      if (state.filterPlaceholder && !tuHasPlaceholderIssue(tu)) return;
      if (!q) {
        rows.push(tuIdx);
        return;
      }
      for (const lang of langs) {
        const tuv = tu.tuvByLang[lang];
        if (tuv && tuv.segEl.textContent.toLowerCase().includes(q)) {
          rows.push(tuIdx);
          return;
        }
      }
    });
    state.filteredTuIdx = rows;
    if (state.page * PAGE_SIZE >= rows.length) state.page = 0;
  }

  function onSearch(e) {
    state.search = e.target.value;
    state.page = 0;
    applyFilter();
    render();
  }

  function onDefaultLangChange(e) {
    state.defaultLang = e.target.value;
    if (state.compareLang === state.defaultLang) state.compareLang = '';
    populateCompareSelect();
    applyFilter();
    renderHeader();
    render();
  }

  function onCompareLangChange(e) {
    state.compareLang = e.target.value;
    applyFilter();
    renderHeader();
    render();
  }

  function visibleLanguages() {
    if (state.compareLang) {
      return [state.defaultLang, state.compareLang];
    }
    return [state.defaultLang, ...state.languages.filter((l) => l !== state.defaultLang)];
  }

  function populateLangSelects() {
    defaultLangSelect.replaceChildren(
      ...state.languages.map((lang) => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang.toUpperCase();
        if (lang === state.defaultLang) opt.selected = true;
        return opt;
      })
    );
    populateCompareSelect();
  }

  function populateCompareSelect() {
    const opts = [];
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'All languages';
    if (state.compareLang === '') none.selected = true;
    opts.push(none);
    state.languages
      .filter((l) => l !== state.defaultLang)
      .forEach((lang) => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang.toUpperCase();
        if (lang === state.compareLang) opt.selected = true;
        opts.push(opt);
      });
    compareLangSelect.replaceChildren(...opts);
  }

  function openReplaceDialog() {
    const search = state.search;
    if (!search) {
      alert('Enter a search term first.');
      return;
    }
    dialogSearchPreview.textContent = search;
    const visible = new Set(visibleLanguages());
    const items = state.languages.map((lang) => {
      const label = document.createElement('label');
      label.className = 'lang-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = lang;
      cb.checked = visible.has(lang);
      const code = document.createElement('span');
      code.className = 'lang-item-code';
      code.textContent = lang.toUpperCase();
      label.appendChild(cb);
      label.appendChild(code);
      const name = langName(lang);
      if (name) {
        const nameEl = document.createElement('span');
        nameEl.className = 'lang-item-name';
        nameEl.textContent = name;
        label.appendChild(nameEl);
      }
      return label;
    });
    dialogLangList.replaceChildren(...items);
    refreshDialogMatchCount();
    replaceDialog.showModal();
    dialogReplaceInput.focus();
    dialogReplaceInput.select();
  }

  function refreshDialogMatchCount() {
    const search = state.search;
    if (!search) {
      dialogMatchCount.textContent = '';
      return;
    }
    const matchCase = dialogMatchCase.checked;
    const selected = new Set(
      [...dialogLangList.querySelectorAll('input[type=checkbox]:checked')].map((cb) => cb.value)
    );
    let n = 0;
    if (selected.size > 0) {
      const needle = matchCase ? search : search.toLowerCase();
      state.tus.forEach((tu) => {
        selected.forEach((lang) => {
          const tuv = tu.tuvByLang[lang];
          if (!tuv) return;
          const text = tuv.segEl.textContent;
          const hay = matchCase ? text : text.toLowerCase();
          if (hay.includes(needle)) n++;
        });
      });
    }
    dialogMatchCount.innerHTML = `<strong>${n}</strong> matching segment${n === 1 ? '' : 's'}`;
  }

  function setAllLangChecked(value) {
    dialogLangList.querySelectorAll('input[type=checkbox]').forEach((cb) => { cb.checked = value; });
  }

  function performReplace() {
    const search = state.search;
    const replacement = dialogReplaceInput.value;
    const matchCase = dialogMatchCase.checked;
    const selected = [...dialogLangList.querySelectorAll('input[type=checkbox]:checked')].map((cb) => cb.value);
    if (selected.length === 0) {
      alert('Select at least one language.');
      return;
    }
    const changes = [];
    const re = new RegExp(escapeRegex(search), matchCase ? 'g' : 'gi');
    state.tus.forEach((tu) => {
      selected.forEach((lang) => {
        const tuv = tu.tuvByLang[lang];
        if (!tuv) return;
        const text = tuv.segEl.textContent;
        if (matchCase ? !text.includes(search) : !text.toLowerCase().includes(search.toLowerCase())) return;
        const newText = text.replace(re, replacement);
        if (newText !== text) {
          tuv.segEl.textContent = newText;
          changes.push({ tuv, oldText: text, newText });
        }
      });
    });
    const count = changes.length;
    replaceDialog.close();
    applyFilter();
    render();
    showToast(`Replaced in ${count} segment${count === 1 ? '' : 's'}.`);
    if (count > 0) {
      pushCommand(
        `Replace in ${count} segment${count === 1 ? '' : 's'}`,
        () => {
          changes.forEach(({ tuv, oldText }) => { tuv.segEl.textContent = oldText; });
          applyFilter();
          render();
        },
        () => {
          changes.forEach(({ tuv, newText }) => { tuv.segEl.textContent = newText; });
          applyFilter();
          render();
        }
      );
    }
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function openDeleteDialog() {
    const n = state.selected.size;
    if (n === 0) return;
    deleteDialogCount.textContent = `${n} translation unit${n === 1 ? '' : 's'}`;
    deleteDialog.showModal();
  }

  function performDelete() {
    const orderedDesc = [...state.selected].sort((a, b) => b - a);
    const captured = orderedDesc.map((idx) => ({
      tu: state.tus[idx],
      index: idx,
      prevSibling: state.tus[idx].tuEl.previousSibling,
    }));
    orderedDesc.forEach((idx) => {
      const tu = state.tus[idx];
      if (tu.tuEl.parentNode) tu.tuEl.parentNode.removeChild(tu.tuEl);
      state.tus.splice(idx, 1);
    });
    const removed = orderedDesc.length;
    state.deletedCount += removed;
    state.selected.clear();
    deleteDialog.close();
    applyFilter();
    render();
    showToast(`Deleted ${removed} translation unit${removed === 1 ? '' : 's'}.`);

    pushCommand(
      `Delete ${removed} row${removed === 1 ? '' : 's'}`,
      () => {
        const asc = [...captured].sort((a, b) => a.index - b.index);
        const body = state.xmlDoc.querySelector('body') || state.xmlDoc.documentElement;
        asc.forEach(({ tu, index, prevSibling }) => {
          state.tus.splice(index, 0, tu);
          if (prevSibling && prevSibling.parentNode === body) {
            if (prevSibling.nextSibling) body.insertBefore(tu.tuEl, prevSibling.nextSibling);
            else body.appendChild(tu.tuEl);
          } else {
            if (body.firstChild) body.insertBefore(tu.tuEl, body.firstChild);
            else body.appendChild(tu.tuEl);
          }
        });
        state.deletedCount -= removed;
        applyFilter();
        render();
      },
      () => {
        const desc = [...captured].sort((a, b) => b.index - a.index);
        desc.forEach(({ tu }) => {
          const idx = state.tus.indexOf(tu);
          if (idx >= 0) state.tus.splice(idx, 1);
          if (tu.tuEl.parentNode) tu.tuEl.parentNode.removeChild(tu.tuEl);
        });
        state.deletedCount += removed;
        applyFilter();
        render();
      }
    );
  }

  function openManageLangsDialog() {
    langAddInput.value = '';
    renderLangManageList();
    manageLangsDialog.showModal();
  }

  function renderLangManageList() {
    const items = state.languages.map((lang) => {
      const li = document.createElement('li');
      li.className = 'lang-manage-row';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'lang-code-input';
      input.value = lang;
      input.dataset.origCode = lang;
      input.addEventListener('blur', onLangCodeBlur);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') { input.value = input.dataset.origCode; input.blur(); }
      });
      li.appendChild(input);

      const nameEl = document.createElement('span');
      nameEl.className = 'lang-manage-name';
      const name = langName(lang);
      if (name) {
        nameEl.textContent = name;
      } else {
        nameEl.textContent = 'Unknown code';
        nameEl.classList.add('is-empty');
      }
      li.appendChild(nameEl);

      const count = document.createElement('span');
      count.className = 'lang-count';
      const n = countTuvsForLang(lang);
      count.textContent = `${n} segment${n === 1 ? '' : 's'}`;
      li.appendChild(count);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'lang-delete';
      del.dataset.code = lang;
      del.textContent = 'Remove';
      del.addEventListener('click', onLangDeleteClick);
      li.appendChild(del);

      return li;
    });
    langManageList.replaceChildren(...items);
  }

  function countTuvsForLang(lang) {
    let n = 0;
    state.tus.forEach((tu) => { if (tu.tuvByLang[lang]) n++; });
    return n;
  }

  function normalizeLangCode(code) {
    return code.trim().toLowerCase();
  }

  function onLangCodeBlur(e) {
    const input = e.target;
    const original = input.dataset.origCode;
    const newCode = normalizeLangCode(input.value);
    if (newCode === original) {
      input.value = original;
      return;
    }
    if (!newCode) {
      showToast('Language code cannot be empty.');
      input.value = original;
      return;
    }
    if (state.languages.includes(newCode)) {
      showToast(`Language "${newCode.toUpperCase()}" already exists.`);
      input.value = original;
      return;
    }
    renameLanguage(original, newCode);
    showToast(`Renamed ${original.toUpperCase()} to ${newCode.toUpperCase()}.`);
    renderLangManageList();
  }

  function onLangDeleteClick(e) {
    const btn = e.currentTarget;
    const code = btn.dataset.code;
    if (!btn.classList.contains('is-confirming')) {
      btn.classList.add('is-confirming');
      btn.textContent = 'Click to confirm';
      btn._confirmTimer = setTimeout(() => {
        btn.classList.remove('is-confirming');
        btn.textContent = 'Remove';
        btn._confirmTimer = null;
      }, 4000);
      return;
    }
    clearTimeout(btn._confirmTimer);
    const segments = countTuvsForLang(code);
    removeLanguage(code);
    showToast(`Removed ${code.toUpperCase()} (${segments} segment${segments === 1 ? '' : 's'}).`);
    renderLangManageList();
  }

  function onAddLanguage() {
    const code = normalizeLangCode(langAddInput.value);
    if (!code) {
      showToast('Enter a language code.');
      return;
    }
    if (state.languages.includes(code)) {
      showToast(`Language "${code.toUpperCase()}" already exists.`);
      return;
    }
    addLanguage(code);
    showToast(`Added ${code.toUpperCase()}. Click empty cells to add translations.`);
    langAddInput.value = '';
    renderLangManageList();
  }

  function sortLanguages(langs) {
    const unique = [...new Set(langs)].sort();
    if (unique.includes(state.defaultLang)) {
      return [state.defaultLang, ...unique.filter((l) => l !== state.defaultLang)];
    }
    if (unique.includes(DEFAULT_LANG)) {
      return [DEFAULT_LANG, ...unique.filter((l) => l !== DEFAULT_LANG)];
    }
    return unique;
  }

  function addLanguage(code) {
    const prevLanguages = [...state.languages];
    state.languages = sortLanguages([...state.languages, code]);
    populateLangSelects();
    renderHeader();
    render();
    pushCommand(
      `Add language ${code.toUpperCase()}`,
      () => {
        state.languages = prevLanguages.slice();
        populateLangSelects();
        renderHeader();
        applyFilter();
        render();
        if (manageLangsDialog.open) renderLangManageList();
      },
      () => {
        state.languages = sortLanguages([...prevLanguages, code]);
        populateLangSelects();
        renderHeader();
        applyFilter();
        render();
        if (manageLangsDialog.open) renderLangManageList();
      }
    );
  }

  function renameLanguage(oldCode, newCode) {
    const renamed = [];
    state.tus.forEach((tu) => {
      const tuv = tu.tuvByLang[oldCode];
      if (!tuv) return;
      tuv.tuvEl.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang', newCode);
      delete tu.tuvByLang[oldCode];
      tu.tuvByLang[newCode] = tuv;
      renamed.push({ tu, tuv });
    });
    const prevDefault = state.defaultLang;
    const prevCompare = state.compareLang;
    const prevLanguages = [...state.languages];
    if (state.defaultLang === oldCode) state.defaultLang = newCode;
    if (state.compareLang === oldCode) state.compareLang = newCode;
    state.languages = sortLanguages(state.languages.map((l) => (l === oldCode ? newCode : l)));
    populateLangSelects();
    renderHeader();
    applyFilter();
    render();
    pushCommand(
      `Rename ${oldCode.toUpperCase()} → ${newCode.toUpperCase()}`,
      () => {
        renamed.forEach(({ tu, tuv }) => {
          tuv.tuvEl.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang', oldCode);
          delete tu.tuvByLang[newCode];
          tu.tuvByLang[oldCode] = tuv;
        });
        state.defaultLang = prevDefault;
        state.compareLang = prevCompare;
        state.languages = prevLanguages.slice();
        populateLangSelects();
        renderHeader();
        applyFilter();
        render();
        if (manageLangsDialog.open) renderLangManageList();
      },
      () => {
        renamed.forEach(({ tu, tuv }) => {
          tuv.tuvEl.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang', newCode);
          delete tu.tuvByLang[oldCode];
          tu.tuvByLang[newCode] = tuv;
        });
        if (prevDefault === oldCode) state.defaultLang = newCode;
        if (prevCompare === oldCode) state.compareLang = newCode;
        state.languages = sortLanguages(prevLanguages.map((l) => (l === oldCode ? newCode : l)));
        populateLangSelects();
        renderHeader();
        applyFilter();
        render();
        if (manageLangsDialog.open) renderLangManageList();
      }
    );
  }

  function removeLanguage(code) {
    const removedTuvs = [];
    state.tus.forEach((tu) => {
      const tuv = tu.tuvByLang[code];
      if (!tuv) return;
      const prevSibling = tuv.tuvEl.previousSibling;
      if (tuv.tuvEl.parentNode) tuv.tuvEl.parentNode.removeChild(tuv.tuvEl);
      delete tu.tuvByLang[code];
      removedTuvs.push({ tu, tuv, prevSibling });
    });
    const removed = removedTuvs.length;
    const prevDefault = state.defaultLang;
    const prevCompare = state.compareLang;
    const prevLanguages = [...state.languages];
    state.deletedCount += removed;
    state.languages = state.languages.filter((l) => l !== code);
    let newDefault = state.defaultLang;
    let newCompare = state.compareLang;
    if (state.defaultLang === code) {
      newDefault = state.languages.includes(DEFAULT_LANG)
        ? DEFAULT_LANG
        : (state.languages[0] || '');
      state.defaultLang = newDefault;
    }
    if (state.compareLang === code) {
      newCompare = '';
      state.compareLang = '';
    }
    populateLangSelects();
    renderHeader();
    applyFilter();
    render();
    pushCommand(
      `Remove language ${code.toUpperCase()}`,
      () => {
        removedTuvs.forEach(({ tu, tuv, prevSibling }) => {
          tu.tuvByLang[code] = tuv;
          if (prevSibling && prevSibling.parentNode === tu.tuEl) {
            if (prevSibling.nextSibling) tu.tuEl.insertBefore(tuv.tuvEl, prevSibling.nextSibling);
            else tu.tuEl.appendChild(tuv.tuvEl);
          } else {
            tu.tuEl.appendChild(tuv.tuvEl);
          }
        });
        state.deletedCount -= removed;
        state.languages = prevLanguages.slice();
        state.defaultLang = prevDefault;
        state.compareLang = prevCompare;
        populateLangSelects();
        renderHeader();
        applyFilter();
        render();
        if (manageLangsDialog.open) renderLangManageList();
      },
      () => {
        removedTuvs.forEach(({ tu, tuv }) => {
          if (tuv.tuvEl.parentNode) tuv.tuvEl.parentNode.removeChild(tuv.tuvEl);
          delete tu.tuvByLang[code];
        });
        state.deletedCount += removed;
        state.languages = prevLanguages.filter((l) => l !== code);
        state.defaultLang = newDefault;
        state.compareLang = newCompare;
        populateLangSelects();
        renderHeader();
        applyFilter();
        render();
        if (manageLangsDialog.open) renderLangManageList();
      }
    );
  }

  function renderHeader() {
    const headFrag = document.createDocumentFragment();
    const thSel = document.createElement('th');
    thSel.className = 'select';
    const headCb = document.createElement('input');
    headCb.type = 'checkbox';
    headCb.id = 'header-checkbox';
    headCb.title = 'Select all visible';
    headCb.addEventListener('change', onHeaderCheckboxToggle);
    thSel.appendChild(headCb);
    headFrag.appendChild(thSel);

    const thIdx = document.createElement('th');
    thIdx.className = 'idx';
    thIdx.textContent = '#';
    headFrag.appendChild(thIdx);
    visibleLanguages().forEach((lang, i) => {
      const th = document.createElement('th');
      th.className = 'th-lang';
      if (i === 0) th.classList.add('lang-default');
      const code = document.createElement('span');
      code.className = 'th-lang-code';
      code.textContent = lang.toUpperCase();
      th.appendChild(code);
      const name = langName(lang);
      if (name) {
        const nameEl = document.createElement('span');
        nameEl.className = 'th-lang-name';
        nameEl.textContent = name;
        th.appendChild(nameEl);
      }
      headFrag.appendChild(th);
    });
    theadRow.replaceChildren(headFrag);
    requestAnimationFrame(updateStickyOffsets);
  }

  function updateStickyOffsets() {
    const selectTh = theadRow.querySelector('th.select');
    const idxTh = theadRow.querySelector('th.idx');
    const langTh = theadRow.querySelector('th.lang-default');
    const table = theadRow.closest('table');
    if (!table || !selectTh) return;
    const selectW = selectTh.getBoundingClientRect().width;
    if (idxTh) {
      table.style.setProperty('--sticky-idx-left', `${selectW}px`);
      const idxW = idxTh.getBoundingClientRect().width;
      if (langTh) {
        table.style.setProperty('--sticky-lang-left', `${selectW + idxW}px`);
      }
    }
  }

  function refreshHeaderCheckbox() {
    const headCb = document.getElementById('header-checkbox');
    if (!headCb) return;
    const total = state.filteredTuIdx.length;
    if (total === 0) {
      headCb.checked = false;
      headCb.indeterminate = false;
      return;
    }
    const selectedInFiltered = state.filteredTuIdx.reduce(
      (n, tuIdx) => n + (state.selected.has(tuIdx) ? 1 : 0),
      0
    );
    headCb.checked = selectedInFiltered === total;
    headCb.indeterminate = selectedInFiltered > 0 && selectedInFiltered < total;
  }

  function onHeaderCheckboxToggle(e) {
    if (e.target.checked) {
      state.filteredTuIdx.forEach((tuIdx) => state.selected.add(tuIdx));
    } else {
      state.filteredTuIdx.forEach((tuIdx) => state.selected.delete(tuIdx));
    }
    render();
    refreshDeleteButton();
  }

  function onRowCheckboxToggle(e) {
    const tuIdx = +e.target.dataset.tuIdx;
    if (e.target.checked) state.selected.add(tuIdx);
    else state.selected.delete(tuIdx);
    e.target.closest('tr').classList.toggle('row-selected', e.target.checked);
    refreshHeaderCheckbox();
    refreshDeleteButton();
  }

  function refreshDeleteButton() {
    const n = state.selected.size;
    deleteCountEl.textContent = n > 0 ? String(n) : '';
    deleteBtn.hidden = n === 0;
  }

  function render() {
    const total = state.filteredTuIdx.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (state.page >= totalPages) state.page = totalPages - 1;
    const start = state.page * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, total);
    const slice = state.filteredTuIdx.slice(start, end);

    const frag = document.createDocumentFragment();
    const searchLower = state.search.trim().toLowerCase();
    const colCount = 2 + visibleLanguages().length;

    if (slice.length === 0) {
      const tr = document.createElement('tr');
      tr.className = 'empty-row';
      const td = document.createElement('td');
      td.colSpan = colCount;
      td.className = 'empty-row-cell';
      const title = document.createElement('strong');
      const desc = document.createElement('span');
      if (state.tus.length === 0) {
        title.textContent = 'No translation units yet';
        desc.innerHTML = 'Click <em>+ New row</em> to add your first.';
      } else if (state.filterModified) {
        title.textContent = 'No modified rows';
        desc.textContent = 'Edit a cell, or clear the modified filter to see all rows.';
      } else if (state.filterMissing) {
        title.textContent = 'No missing translations';
        desc.textContent = state.compareLang
          ? `Every row has a ${state.compareLang.toUpperCase()} translation.`
          : 'Every row has a translation in every language.';
      } else if (state.filterPlaceholder) {
        title.textContent = 'No placeholder issues';
        desc.textContent = 'Placeholders like %s, {0}, and ${var} match across languages.';
      } else if (state.search) {
        title.textContent = 'No matches';
        desc.textContent = 'Try a different search term or clear it to see all rows.';
      } else {
        title.textContent = 'Nothing to show';
        desc.textContent = 'Clear active filters to see all rows.';
      }
      td.appendChild(title);
      td.appendChild(desc);
      tr.appendChild(td);
      frag.appendChild(tr);
    }

    slice.forEach((tuIdx) => {
      const tu = state.tus[tuIdx];
      const tr = document.createElement('tr');
      const isSelected = state.selected.has(tuIdx);
      if (isSelected) tr.classList.add('row-selected');

      const selTd = document.createElement('td');
      selTd.className = 'select';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.tuIdx = tuIdx;
      cb.checked = isSelected;
      cb.addEventListener('change', onRowCheckboxToggle);
      selTd.appendChild(cb);
      tr.appendChild(selTd);

      const idxTd = document.createElement('td');
      idxTd.className = 'idx';
      idxTd.textContent = tuIdx + 1;
      idxTd.title = 'Open details';
      idxTd.addEventListener('click', () => openTuPanel(tu));
      tr.appendChild(idxTd);

      visibleLanguages().forEach((lang, i) => {
        const tuv = tu.tuvByLang[lang];
        const segTd = document.createElement('td');
        segTd.className = 'seg';
        if (i === 0) segTd.classList.add('lang-default');
        segTd.contentEditable = 'true';
        segTd.spellcheck = false;
        segTd.dataset.tuIdx = tuIdx;
        segTd.dataset.lang = lang;
        segTd.addEventListener('focus', onCellFocus);
        segTd.addEventListener('blur', onCellBlur);
        if (!tuv) {
          segTd.classList.add('empty-cell');
        } else {
          const currentText = tuv.segEl.textContent;
          if (searchLower) {
            segTd.innerHTML = highlight(currentText, state.search);
          } else {
            segTd.textContent = currentText;
          }
          if (currentText !== tuv.originalText) segTd.classList.add('modified');
        }
        tr.appendChild(segTd);
      });

      frag.appendChild(tr);
    });

    tbody.replaceChildren(frag);

    if (total > PAGE_SIZE) {
      paginationEl.hidden = false;
      prevBtn.disabled = state.page === 0;
      nextBtn.disabled = state.page >= totalPages - 1;
      pageInfo.textContent = `Page ${state.page + 1} / ${totalPages}`;
    } else {
      paginationEl.hidden = true;
    }

    refreshHeaderCheckbox();
    refreshDeleteButton();
    updateStatus();
    syncTuPanel();
    requestAnimationFrame(updateStickyOffsets);
  }

  function onCellFocus(e) {
    const td = e.target;
    const { tuIdx, lang } = td.dataset;
    const tuv = state.tus[+tuIdx].tuvByLang[lang];
    td.textContent = tuv ? tuv.segEl.textContent : '';
  }

  function onCellBlur(e) {
    const td = e.target;
    const { tuIdx, lang } = td.dataset;
    const tu = state.tus[+tuIdx];
    let tuv = tu.tuvByLang[lang];
    const newText = td.textContent;
    const prevExisted = !!tuv;
    const prevText = tuv ? tuv.segEl.textContent : '';

    if (!prevExisted && newText === '') {
      td.classList.add('empty-cell');
      td.classList.remove('modified');
      return;
    }
    if (prevExisted && newText === prevText) {
      const searchLower = state.search.trim().toLowerCase();
      if (searchLower) td.innerHTML = highlight(newText, state.search);
      return;
    }

    let tuvRef;
    if (!tuv) {
      tuvRef = createTuv(tu, lang, newText);
      tu.tuvByLang[lang] = tuvRef;
      td.classList.remove('empty-cell');
      td.classList.add('modified');
    } else {
      tuvRef = tuv;
      tuv.segEl.textContent = newText;
      if (newText !== tuv.originalText) td.classList.add('modified');
      else td.classList.remove('modified');
    }

    pushCommand(
      'Edit cell',
      () => {
        if (prevExisted) {
          tuvRef.segEl.textContent = prevText;
        } else {
          if (tuvRef.tuvEl.parentNode) tuvRef.tuvEl.parentNode.removeChild(tuvRef.tuvEl);
          delete tu.tuvByLang[lang];
        }
        applyFilter();
        render();
      },
      () => {
        if (prevExisted) {
          tuvRef.segEl.textContent = newText;
        } else {
          tu.tuEl.appendChild(tuvRef.tuvEl);
          tu.tuvByLang[lang] = tuvRef;
        }
        applyFilter();
        render();
      }
    );

    const searchLower = state.search.trim().toLowerCase();
    if (searchLower) {
      td.innerHTML = highlight(newText, state.search);
    }
    updateStatus();
  }

  function createTuv(tu, lang, text) {
    const doc = state.xmlDoc;
    const tuvEl = doc.createElement('tuv');
    tuvEl.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang', lang);
    const segEl = doc.createElement('seg');
    segEl.textContent = text;
    tuvEl.appendChild(segEl);
    tu.tuEl.appendChild(tuvEl);
    return { tuvEl, segEl, originalText: '' };
  }

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const queryEscaped = escapeHtml(query);
    const re = new RegExp('(' + escapeRegex(queryEscaped) + ')', 'gi');
    return escaped.replace(re, '<mark>$1</mark>');
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function updateStatus() {
    const total = state.filteredTuIdx.length;
    const tuCount = state.tus.length;
    const modified = countModified();
    const missing = countMissing();
    let s = `<strong>${tuCount}</strong> translation units · <strong>${total}</strong> visible`;
    if (modified > 0 || state.filterModified) {
      const cls = state.filterModified ? 'modified-chip is-active' : 'modified-chip';
      const suffix = state.filterModified ? ' · clear' : '';
      s += ` · <button type="button" class="${cls}" data-filter-modified><strong>${modified}</strong> modified${suffix}</button>`;
    }
    if (missing > 0 || state.filterMissing) {
      const cls = state.filterMissing ? 'missing-chip is-active' : 'missing-chip';
      const suffix = state.filterMissing ? ' · clear' : '';
      const label = state.compareLang
        ? `missing ${state.compareLang.toUpperCase()}`
        : 'missing';
      s += ` · <button type="button" class="${cls}" data-filter-missing><strong>${missing}</strong> ${label}${suffix}</button>`;
    }
    const placeholderIssues = countPlaceholderIssues();
    if (placeholderIssues > 0 || state.filterPlaceholder) {
      const cls = state.filterPlaceholder ? 'missing-chip is-active' : 'missing-chip';
      const suffix = state.filterPlaceholder ? ' · clear' : '';
      s += ` · <button type="button" class="${cls}" data-filter-placeholder title="Rows where placeholders like %s, {0}, or \${var} don’t match between languages"><strong>${placeholderIssues}</strong> placeholder issue${placeholderIssues === 1 ? '' : 's'}${suffix}</button>`;
    }
    if (state.deletedCount > 0) {
      s += ` · <strong>${state.deletedCount}</strong> deleted`;
    }
    statusEl.innerHTML = s;
  }

  function countMissing() {
    let n = 0;
    state.tus.forEach((tu) => { if (tuMissingTranslation(tu)) n++; });
    return n;
  }

  function countPlaceholderIssues() {
    let n = 0;
    state.tus.forEach((tu) => { if (tuHasPlaceholderIssue(tu)) n++; });
    return n;
  }

  function countModified() {
    let n = 0;
    state.tus.forEach((tu) => {
      Object.values(tu.tuvByLang).forEach((tuv) => {
        if (tuv.segEl.textContent !== tuv.originalText) n++;
      });
    });
    return n;
  }

  function onExport() {
    if (!state.xmlDoc) return;
    const serializer = new XMLSerializer();
    let xml = serializer.serializeToString(state.xmlDoc);
    if (!xml.startsWith('<?xml')) {
      xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xml;
    }
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    markSaved();
  }

  function openTuPanel(tu) {
    state.panelTu = tu;
    renderTuPanel();
    tuPanel.hidden = false;
  }

  function closeTuPanel() {
    state.panelTu = null;
    tuPanel.hidden = true;
  }

  function syncTuPanel() {
    if (!state.panelTu) return;
    const idx = state.tus.indexOf(state.panelTu);
    if (idx < 0) { closeTuPanel(); return; }
    tuPanelTitle.textContent = `TU #${idx + 1}`;
  }

  function tuChildrenByTag(tuEl, tag) {
    return [...tuEl.children].filter((c) => c.tagName.toLowerCase() === tag);
  }

  function insertBeforeFirstTuv(tu, el) {
    const firstTuv = tu.tuEl.querySelector(':scope > tuv');
    if (firstTuv) tu.tuEl.insertBefore(el, firstTuv);
    else tu.tuEl.appendChild(el);
  }

  function renderTuPanel() {
    const tu = state.panelTu;
    if (!tu) return;
    const idx = state.tus.indexOf(tu);
    if (idx < 0) { closeTuPanel(); return; }
    tuPanelTitle.textContent = `TU #${idx + 1}`;

    const notes = tuChildrenByTag(tu.tuEl, 'note');
    if (notes.length === 0) {
      const hint = document.createElement('li');
      hint.className = 'tu-empty-hint';
      hint.textContent = 'No notes yet.';
      tuNotesList.replaceChildren(hint);
    } else {
      tuNotesList.replaceChildren(...notes.map((noteEl) => renderNoteRow(tu, noteEl)));
    }

    const props = tuChildrenByTag(tu.tuEl, 'prop');
    if (props.length === 0) {
      const hint = document.createElement('li');
      hint.className = 'tu-empty-hint';
      hint.textContent = 'No properties yet.';
      tuPropsList.replaceChildren(hint);
    } else {
      tuPropsList.replaceChildren(...props.map((propEl) => renderPropRow(tu, propEl)));
    }

    renderTuAttrs(tu);
  }

  function renderTuAttrs(tu) {
    const attrNames = ['tuid', 'srclang', 'datatype', 'segtype', 'creationdate', 'changedate', 'creationid', 'changeid', 'usagecount', 'lastusagedate'];
    const frag = document.createDocumentFragment();
    let any = false;
    attrNames.forEach((name) => {
      const val = tu.tuEl.getAttribute(name);
      if (!val) return;
      any = true;
      const dt = document.createElement('dt');
      dt.textContent = name;
      const dd = document.createElement('dd');
      dd.textContent = val;
      frag.appendChild(dt);
      frag.appendChild(dd);
    });
    if (!any) {
      const empty = document.createElement('p');
      empty.className = 'tu-attrs-empty';
      empty.textContent = 'No TU attributes set.';
      tuAttrsEl.replaceChildren(empty);
    } else {
      tuAttrsEl.replaceChildren(frag);
    }
  }

  function renderNoteRow(tu, noteEl) {
    const li = document.createElement('li');
    li.className = 'tu-note-item';
    const ta = document.createElement('textarea');
    ta.value = noteEl.textContent;
    ta.placeholder = 'Note text…';
    ta.addEventListener('blur', () => {
      const oldText = noteEl.textContent;
      const newText = ta.value;
      if (oldText === newText) return;
      noteEl.textContent = newText;
      pushCommand(
        'Edit note',
        () => { noteEl.textContent = oldText; if (state.panelTu === tu) renderTuPanel(); },
        () => { noteEl.textContent = newText; if (state.panelTu === tu) renderTuPanel(); }
      );
    });
    li.appendChild(ta);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'tu-row-remove';
    remove.textContent = 'Remove';
    remove.style.justifySelf = 'end';
    remove.addEventListener('click', () => removeNote(tu, noteEl));
    li.appendChild(remove);
    return li;
  }

  function renderPropRow(tu, propEl) {
    const li = document.createElement('li');
    li.className = 'tu-prop-item';

    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.value = propEl.getAttribute('type') || '';
    typeInput.placeholder = 'type';
    typeInput.dataset.field = 'type';
    typeInput.addEventListener('blur', () => {
      const oldVal = propEl.getAttribute('type') || '';
      const newVal = typeInput.value.trim();
      if (oldVal === newVal) return;
      if (newVal) propEl.setAttribute('type', newVal); else propEl.removeAttribute('type');
      pushCommand(
        'Edit property type',
        () => {
          if (oldVal) propEl.setAttribute('type', oldVal); else propEl.removeAttribute('type');
          if (state.panelTu === tu) renderTuPanel();
        },
        () => {
          if (newVal) propEl.setAttribute('type', newVal); else propEl.removeAttribute('type');
          if (state.panelTu === tu) renderTuPanel();
        }
      );
    });
    li.appendChild(typeInput);

    const valInput = document.createElement('input');
    valInput.type = 'text';
    valInput.value = propEl.textContent;
    valInput.placeholder = 'value';
    valInput.dataset.field = 'value';
    valInput.addEventListener('blur', () => {
      const oldVal = propEl.textContent;
      const newVal = valInput.value;
      if (oldVal === newVal) return;
      propEl.textContent = newVal;
      pushCommand(
        'Edit property value',
        () => { propEl.textContent = oldVal; if (state.panelTu === tu) renderTuPanel(); },
        () => { propEl.textContent = newVal; if (state.panelTu === tu) renderTuPanel(); }
      );
    });
    li.appendChild(valInput);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'tu-row-remove';
    remove.textContent = '×';
    remove.title = 'Remove property';
    remove.addEventListener('click', () => removeProp(tu, propEl));
    li.appendChild(remove);
    return li;
  }

  function addNote() {
    if (!state.panelTu) return;
    const tu = state.panelTu;
    const noteEl = state.xmlDoc.createElement('note');
    insertBeforeFirstTuv(tu, noteEl);
    renderTuPanel();
    requestAnimationFrame(() => {
      const last = tuNotesList.querySelector('.tu-note-item:last-child textarea');
      if (last) last.focus();
    });
    pushCommand(
      'Add note',
      () => {
        if (noteEl.parentNode) noteEl.parentNode.removeChild(noteEl);
        if (state.panelTu === tu) renderTuPanel();
      },
      () => {
        insertBeforeFirstTuv(tu, noteEl);
        if (state.panelTu === tu) renderTuPanel();
      }
    );
  }

  function removeNote(tu, noteEl) {
    const prevSibling = noteEl.previousSibling;
    if (noteEl.parentNode) noteEl.parentNode.removeChild(noteEl);
    if (state.panelTu === tu) renderTuPanel();
    pushCommand(
      'Remove note',
      () => {
        if (prevSibling && prevSibling.parentNode === tu.tuEl) {
          if (prevSibling.nextSibling) tu.tuEl.insertBefore(noteEl, prevSibling.nextSibling);
          else tu.tuEl.appendChild(noteEl);
        } else {
          insertBeforeFirstTuv(tu, noteEl);
        }
        if (state.panelTu === tu) renderTuPanel();
      },
      () => {
        if (noteEl.parentNode) noteEl.parentNode.removeChild(noteEl);
        if (state.panelTu === tu) renderTuPanel();
      }
    );
  }

  function addProp() {
    if (!state.panelTu) return;
    const tu = state.panelTu;
    const propEl = state.xmlDoc.createElement('prop');
    propEl.setAttribute('type', '');
    insertBeforeFirstTuv(tu, propEl);
    renderTuPanel();
    requestAnimationFrame(() => {
      const last = tuPropsList.querySelector('.tu-prop-item:last-child input[data-field="type"]');
      if (last) last.focus();
    });
    pushCommand(
      'Add property',
      () => {
        if (propEl.parentNode) propEl.parentNode.removeChild(propEl);
        if (state.panelTu === tu) renderTuPanel();
      },
      () => {
        insertBeforeFirstTuv(tu, propEl);
        if (state.panelTu === tu) renderTuPanel();
      }
    );
  }

  function removeProp(tu, propEl) {
    const prevSibling = propEl.previousSibling;
    if (propEl.parentNode) propEl.parentNode.removeChild(propEl);
    if (state.panelTu === tu) renderTuPanel();
    pushCommand(
      'Remove property',
      () => {
        if (prevSibling && prevSibling.parentNode === tu.tuEl) {
          if (prevSibling.nextSibling) tu.tuEl.insertBefore(propEl, prevSibling.nextSibling);
          else tu.tuEl.appendChild(propEl);
        } else {
          insertBeforeFirstTuv(tu, propEl);
        }
        if (state.panelTu === tu) renderTuPanel();
      },
      () => {
        if (propEl.parentNode) propEl.parentNode.removeChild(propEl);
        if (state.panelTu === tu) renderTuPanel();
      }
    );
  }
})();
