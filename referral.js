/* Public referral attribution only. No cookies, storage, payouts or identity claims. */
(() => {
  const raw = new URLSearchParams(location.search).get('ref') || '';
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) return;
  const hosts = new Set(['an2b.com', 'www.an2b.com', 'hirenorman.com', 'www.hirenorman.com', 'covenantsystems.ai', 'www.covenantsystems.ai']);
  function decorate() {
    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.href, location.href);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      if (url.origin !== location.origin && !hosts.has(url.hostname)) continue;
      if (/^\/(api|admin|interview-prepared)(?:[/.]|$)/.test(url.pathname)) continue;
      if (url.searchParams.get('ref') === code) continue;
      url.searchParams.set('ref', code);
      link.href = url.href;
    }
  }
  decorate();
  const observer = new MutationObserver(decorate);
  observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['href']});
  window.addEventListener('pagehide', () => observer.disconnect());
  window.addEventListener('pageshow', event => { if(event.persisted) { decorate(); observer.observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['href']}); } });
})();
