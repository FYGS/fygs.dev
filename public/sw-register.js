// Registers the service worker. Served as a same-origin file (not inline) so the
// Content-Security-Policy does not need 'unsafe-inline' for it.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    var registerSW = function () {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(function (reg) {
          // Check for updates periodically
          reg.update();
          setInterval(function () {
            reg.update();
          }, 60 * 60 * 1000);
        })
        .catch(function () {});
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(registerSW);
    } else {
      setTimeout(registerSW, 1000);
    }
  });
}
