const Telemetry = (() => {
  // Very small Telemetry shim that records metrics to window.__metrics and console.
  window.__metrics = window.__metrics || [];

  function track(event, payload) {
    const item = { event, payload, ts: new Date().toISOString() };
    window.__metrics.push(item);
    // keep console output but in real system send to APM/metrics backend
    console.log('Telemetry.track', item);
  }

  function getAll() { return window.__metrics; }

  return { track, getAll };
})();

window.Telemetry = window.Telemetry || Telemetry;
