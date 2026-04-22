// Project sub-page — single layout, direction-flavored typography

function ProjectPage({ project, direction = "editorial", allProjects = [], onBack, onNavigate }) {
  const idx = allProjects.findIndex(p => p.id === project.id);
  const [lightboxIdx, setLightboxIdx] = React.useState(null);
  const shots = project.shots || [];
  const lightboxRef = React.useRef(null);
  const lightboxOpen = lightboxIdx !== null;

  React.useEffect(() => {
    if (!lightboxOpen || !lightboxRef.current) return;
    const btn = lightboxRef.current.querySelector("button");
    if (btn) btn.focus();
  }, [lightboxOpen]);

  React.useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setLightboxIdx(null); return; }
      if (e.key === "ArrowRight") setLightboxIdx(i => i < shots.length - 1 ? i + 1 : i);
      if (e.key === "ArrowLeft")  setLightboxIdx(i => i > 0 ? i - 1 : i);
      if (e.key === "Tab") {
        const el = lightboxRef.current;
        if (!el) return;
        const focusable = [...el.querySelectorAll("button:not([disabled])")];
        if (focusable.length < 2) return;
        if (e.shiftKey && document.activeElement === focusable[0]) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, shots.length]);
  const prev = idx > 0 ? allProjects[idx - 1] : null;
  const next = idx < allProjects.length - 1 ? allProjects[idx + 1] : null;

  const isEditorial = direction === "editorial";
  const isMono = direction === "mono";
  const isSans = !isEditorial;

  const titleClass = `pp-title${isSans ? " pp-title--sans" : ""}`;
  const blurbClass = `pp-blurb${isMono ? " pp-blurb--mono" : isSans ? " pp-blurb--sans" : ""}`;
  const sectionHClass = `pp-section-h${isSans ? " pp-section-h--sans" : ""}`;
  const sectionPClass = `pp-section-p${isMono ? " pp-section-p--mono" : isSans ? " pp-section-p--sans" : ""}`;
  const paginationTitleClass = `pp-pagination-title${isSans ? " pp-pagination-title--sans" : ""}`;

  return (
    <main className={`pp-wrap${isMono ? " pp-wrap--mono" : ""}`}>
      <nav aria-label="Page navigation" className="pp-nav">
        <a href="#/" onClick={(e) => { e.preventDefault(); onBack && onBack(); }} className="pp-nav-back">
          <span className="pp-nav-back-arrow">←</span> Back to portfolio
        </a>
        <span>{project.company} · {project.year}</span>
      </nav>

      <window.ProjectTile project={project} size="hero" />

      <header className="pp-header">
        <div>
          <p className="pp-tag">{project.tag}</p>
          <h1 className={titleClass}>{project.title}</h1>
          <p className={blurbClass}>{project.blurb}</p>
        </div>
        <dl className="pp-meta">
          <div className="pp-meta-group">
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div className="pp-meta-group">
            <dt>When</dt>
            <dd>{project.year}</dd>
          </div>
          <div className="pp-meta-group">
            <dt>At</dt>
            <dd>{project.company}</dd>
          </div>
        </dl>
      </header>

      {shots.length > 0 && (
        <section className="pp-shots">
          <h2 className="pp-shots-label">
            {isMono ? "// screenshots" : "Screenshots"}
          </h2>
          <div className={`pp-shots-grid${shots.length < 3 ? " pp-shots-grid--pair" : ""}`}>
            {shots.map((s, i) => (
              <button key={i} className="pp-shot-btn" onClick={() => setLightboxIdx(i)} aria-label={`View ${s.label} full size`}>
                <window.ProjectShot project={project} shot={s} thumb={true} />
              </button>
            ))}
          </div>
        </section>
      )}

      {lightboxIdx !== null && (
        <div className="pp-lightbox" role="dialog" aria-modal="true" aria-label={shots[lightboxIdx]?.label} onClick={() => setLightboxIdx(null)}>
          <div className="pp-lightbox-inner" ref={lightboxRef} onClick={(e) => e.stopPropagation()}>
            <button className="pp-lightbox-close" onClick={() => setLightboxIdx(null)} aria-label="Close">✕</button>
            <window.ProjectShot project={project} shot={shots[lightboxIdx]} showNote={true} style={{width: "100%", aspectRatio: "16/10"}} />
            {shots.length > 1 && (
              <div className="pp-lightbox-nav">
                <button className="pp-lightbox-nav-btn" onClick={() => setLightboxIdx(i => i > 0 ? i - 1 : i)} disabled={lightboxIdx === 0} aria-label="Previous">←</button>
                <span className="pp-lightbox-counter">{lightboxIdx + 1} / {shots.length}</span>
                <button className="pp-lightbox-nav-btn" onClick={() => setLightboxIdx(i => i < shots.length - 1 ? i + 1 : i)} disabled={lightboxIdx === shots.length - 1} aria-label="Next">→</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pp-narrative">
        {project.sections.map((s, i) => (
          <section key={i} className="pp-section">
            <h2 className={sectionHClass}>
              {isMono ? `// ${s.h.toLowerCase()}` : s.h}
            </h2>
            <p className={sectionPClass} dangerouslySetInnerHTML={{__html: s.p}} />
          </section>
        ))}
      </div>

      <nav className="pp-pagination">
        <div>
          {prev && (
            <a href={`#/project/${prev.id}`}
              onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(prev.id); }}
              className="pp-pagination-link">
              <div className="pp-pagination-label">← Previous</div>
              <div className={paginationTitleClass}>{prev.title}</div>
            </a>
          )}
        </div>
        <div className="pp-pagination-next">
          {next && (
            <a href={`#/project/${next.id}`}
              onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(next.id); }}
              className="pp-pagination-link">
              <div className="pp-pagination-label">Next →</div>
              <div className={paginationTitleClass}>{next.title}</div>
            </a>
          )}
        </div>
      </nav>
    </main>
  );
}

window.ProjectPage = ProjectPage;
