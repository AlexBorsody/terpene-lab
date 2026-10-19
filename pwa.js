/* Installation, offline status and automatic release updates. */
(() => {
  const embedded = document.documentElement.classList.contains('lab-embedded');
  if (!('serviceWorker' in navigator)) return;
  let reloading = false;
  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const update = document.getElementById('pwa-update');
    if (update) update.hidden = true;
    // A first install need not reload. Updates refresh every open
    // tab to avoid continuing to browse a mixture of old and new assets.
    if (hadController && !reloading) { reloading = true; location.reload(); }
    hadController = true;
  });
  // Storefront frames do not install a worker, but may inherit one from a
  // standalone visit. Keep those frames current too.
  if (embedded) {
    const checkExisting = () => navigator.serviceWorker.getRegistration('./').then(r => r?.update()).catch(() => {});
    checkExisting();
    window.addEventListener('online', checkExisting);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkExisting(); });
    setInterval(checkExisting, 60 * 1000);
    return;
  }
  const status = document.getElementById('pwa-status');
  const install = document.getElementById('pwa-install');
  const update = document.getElementById('pwa-update');
  let prompt;
  let registration;
  const render = () => {
    status.textContent = navigator.onLine ? '' : 'You’re offline.';
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    prompt = event;
    install.hidden = window.matchMedia('(display-mode: standalone)').matches;
  });
  install.addEventListener('click', async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    prompt = null;
    install.hidden = true;
  });
  window.addEventListener('appinstalled', () => { install.hidden = true; });
  update.addEventListener('click', () => {
    if (registration?.waiting) {
      update.disabled = true;
      update.textContent = 'Updating…';
      registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
    }
  });
  const check = () => registration?.update().catch(() => {});
  window.addEventListener('online', () => { render(); check(); });
  window.addEventListener('offline', render);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  window.addEventListener('load', async () => {
    render();
    try {
      registration = await navigator.serviceWorker.getRegistration('./');
      if (!registration || navigator.onLine) {
        registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      }
      const offer = () => {
        update.hidden = true;
        // Also activate workers left waiting by an older app version.
        registration.waiting?.postMessage({ type: 'ACTIVATE_UPDATE' });
      };
      offer();
      const observeInstalling = () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => { if (worker.state === 'installed' || worker.state === 'activated') offer(); });
      };
      registration.addEventListener('updatefound', observeInstalling);
      // register() or another tab may have already fired updatefound.
      observeInstalling();
      await navigator.serviceWorker.ready;
      render();
      setInterval(check, 60 * 1000);
    } catch (error) {
      render();
      console.warn('Lab offline setup:', error);
    }
  });
})();
