// Health UI: polls Health.check() and updates a top banner/status dot
(function(){
  const POLL_INTERVAL = 10000; // 10s

  function createIndicator() {
    const container = document.createElement('div');
    container.id = 'healthIndicator';
    container.className = 'health-indicator';
    container.innerHTML = `
      <span class="health-dot"></span>
      <span class="health-text">Checking system health...</span>
    `;

    // append to top-nav right side if available, otherwise body top
    const nav = document.querySelector('.top-nav .nav-right');
    if (nav) {
      nav.appendChild(container);
    } else {
      document.body.insertBefore(container, document.body.firstChild);
    }

    return container;
  }

  function updateUI(el, status) {
    const dot = el.querySelector('.health-dot');
    const text = el.querySelector('.health-text');

    if (!dot || !text) return;

    if (!status) {
      dot.style.background = 'gray';
      text.textContent = 'Health: unknown';
      return;
    }

    const ok = status.status === 'ok' && Object.values(status.components).every(Boolean);
    dot.style.background = ok ? 'var(--spotify-green)' : '#ffcd3c';
    text.textContent = ok ? 'System OK' : 'Degraded';
    // add tooltip with details
    el.title = JSON.stringify(status.components);
  }

  function poll(el) {
    try {
      const status = (window.Health && Health.check) ? Health.check() : null;
      updateUI(el, status);
      // telemetry can be toggled via FeatureFlags for easier maintenance
      if (window.FeatureFlags ? FeatureFlags.isEnabled('enableTelemetry') : true) {
        if (window.Telemetry && Telemetry.track) Telemetry.track('health.poll', { status });
      }
    } catch (e) {
      console.warn('health poll failed', e);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const el = createIndicator();
    poll(el);
    setInterval(() => poll(el), POLL_INTERVAL);

    // online/offline hooks
    window.addEventListener('offline', () => {
      updateUI(el, { status: 'offline', components: {} });
      if (window.FeatureFlags ? FeatureFlags.isEnabled('enableTelemetry') : true) {
        if (window.Telemetry && Telemetry.track) Telemetry.track('network.offline', {});
      }
    });

    window.addEventListener('online', () => {
      if (window.FeatureFlags ? FeatureFlags.isEnabled('enableTelemetry') : true) {
        if (window.Telemetry && Telemetry.track) Telemetry.track('network.online', {});
      }
      poll(el);
    });
  });
})();
