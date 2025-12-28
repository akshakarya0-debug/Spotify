// Feature Flags UI: small panel in top-nav to toggle runtime flags
(function(){
  function createButton() {
    const btn = document.createElement('button');
    btn.className = 'flags-button';
    btn.textContent = 'Flags';
    btn.type = 'button';
    return btn;
  }

  function createPanel() {
    const panel = document.createElement('div');
    panel.className = 'flags-panel hidden';

    const title = document.createElement('div');
    title.className = 'flags-panel-title';
    title.textContent = 'Feature Flags';
    panel.appendChild(title);

    const list = document.createElement('div');
    list.className = 'flags-list';

    const flags = FeatureFlags ? FeatureFlags.all() : {};
    const entries = Object.keys(flags).length ? Object.keys(flags) : ['enableModeration','enableTelemetry','enableHealthUI'];

    entries.forEach(name => {
      const row = document.createElement('label');
      row.className = 'flags-row';

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = FeatureFlags ? FeatureFlags.isEnabled(name) : false;
      chk.dataset.flag = name;

      const span = document.createElement('span');
      span.textContent = name;
      span.className = 'flags-label';

      chk.addEventListener('change', (e) => {
        const flagName = e.target.dataset.flag;
        const val = e.target.checked;
        if (window.FeatureFlags && FeatureFlags.setFlag) {
          FeatureFlags.setFlag(flagName, val);
        }
        if (window.Telemetry && Telemetry.track && (window.FeatureFlags ? FeatureFlags.isEnabled('enableTelemetry') : true)) {
          Telemetry.track('featureFlag.toggled', { flag: flagName, value: val });
        }
      });

      row.appendChild(chk);
      row.appendChild(span);
      list.appendChild(row);
    });

    panel.appendChild(list);

    const hint = document.createElement('div');
    hint.className = 'flags-hint';
    hint.textContent = 'Toggles persist in localStorage.';
    panel.appendChild(hint);

    return panel;
  }

  function togglePanel(panel) {
    panel.classList.toggle('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.top-nav .nav-right');
    if (!nav) return;

    const btn = createButton();
    const panel = createPanel();

    btn.addEventListener('click', () => togglePanel(panel));

    // insert before Artist Studio button if present
    const studioBtn = document.getElementById('studioBtn');
    if (studioBtn) nav.insertBefore(btn, studioBtn);
    else nav.appendChild(btn);

    nav.appendChild(panel);

    // click outside to close
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        if (!panel.classList.contains('hidden')) panel.classList.add('hidden');
      }
    });
  });
})();
