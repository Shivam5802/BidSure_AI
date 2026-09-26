export function scrollToHash(hash: string): void {
  if (typeof window === 'undefined') return;

  if (!hash || hash === '#' || hash === '#top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    return;
  }

  const cleanId = hash.replace(/^#/, '');
  const el = document.getElementById(cleanId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    // Use replaceState instead of pushState so the browser's Back button does not get trapped
    window.history.replaceState(null, '', `#${cleanId}`);
  }
}
