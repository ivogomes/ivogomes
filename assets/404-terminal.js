(function () {
  var el = document.getElementById('e404-terminal');
  if (!el) return;
  var msg = 'ERROR 404: RESOURCE_NOT_FOUND\nAttempting reroute........... failed.\nSuggestion: return to the homepage.';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = msg;
    return;
  }
  var i = 0;
  function tick() {
    el.textContent = msg.slice(0, ++i);
    if (i < msg.length) setTimeout(tick, 38);
  }
  setTimeout(tick, 900);
})();
