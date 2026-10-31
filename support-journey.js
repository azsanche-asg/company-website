/* Make direct links to native disclosures useful without replacing native behaviour. */
(() => {
  function reveal(hash) {
    if (!hash || hash === '#') return;
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return; }
    if (!target) return;
    let current = target;
    let opened = false;
    while (current) {
      if (current.tagName === 'DETAILS' && !current.open) {
        current.open = true;
        opened = true;
      }
      current = current.parentElement;
    }
    if (opened) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) reveal(url.hash);
  });
  window.addEventListener('hashchange', () => reveal(location.hash));
  reveal(location.hash);
})();
