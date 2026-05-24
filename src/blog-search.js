(function () {
  var input = document.querySelector('.blog-search');
  var posts = document.querySelectorAll('.blog-post');
  var empty = document.querySelector('.blog-search-empty');

  if (!input || !posts.length || !empty) return;

  function filter() {
    var q = input.value.trim().toLowerCase();
    var visible = 0;
    for (var i = 0; i < posts.length; i++) {
      var titleEl = posts[i].querySelector('.blog-post-title');
      if (!titleEl) continue;
      var match = !q || titleEl.textContent.toLowerCase().indexOf(q) !== -1;
      posts[i].hidden = !match;
      if (match) visible++;
    }
    empty.hidden = visible > 0;
  }

  input.addEventListener('input', filter);
})();
