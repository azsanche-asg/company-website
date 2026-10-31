// Keep the scope available through native disclosure controls and direct links.
(() => {
  function openScope() {
    const scope = document.getElementById('guarantee-scope');
    if (scope) scope.open = true;
  }
  document.querySelectorAll('a[href="#guarantee-scope"]').forEach(link => {
    link.addEventListener('click', openScope);
  });
  function revealFragment() {
    if (window.location.hash === '#guarantee-scope') openScope();
  }
  window.addEventListener('hashchange', revealFragment);
  revealFragment();
})();
