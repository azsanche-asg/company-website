/* Preserve links shared before the September 2026 redesign. */
(() => {
  const destinations = {
    how: 'platform.html#evidence',
    product: 'platform.html',
    'product-title': 'platform.html',
    guarantees: 'platform.html#faq',
    modules: 'solutions.html',
    faq: 'platform.html#faq',
    team: 'company.html#founders'
  };
  function resolveLegacyLink() {
    let fragment;
    try { fragment = decodeURIComponent(window.location.hash.slice(1)); }
    catch { return; }
    if (!Object.hasOwn(destinations, fragment)) return;
    const destination = new URL(destinations[fragment], window.location.href);
    destination.search = window.location.search;
    window.location.replace(destination.href);
  }
  resolveLegacyLink();
  window.addEventListener('hashchange', resolveLegacyLink);
})();
