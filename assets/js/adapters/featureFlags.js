const FeatureFlags = (() => {
  // Simple feature flagging for local dev: stored in localStorage for persistence.
  const STORAGE_KEY = 'featureFlags_v1';

  // default flags
  const defaults = {
    enableModeration: true,
    enableTelemetry: true,
    enableHealthUI: true
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      return Object.assign({}, defaults, JSON.parse(raw));
    } catch (e) {
      console.warn('FeatureFlags.load failed', e);
      return { ...defaults };
    }
  }

  function save(flags) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch (e) {
      console.warn('FeatureFlags.save failed', e);
    }
  }

  let flags = load();

  function isEnabled(name) {
    return !!flags[name];
  }

  function setFlag(name, value) {
    flags[name] = !!value;
    save(flags);
  }

  function all() {
    return { ...flags };
  }

  return { isEnabled, setFlag, all };
})();

window.FeatureFlags = window.FeatureFlags || FeatureFlags;
