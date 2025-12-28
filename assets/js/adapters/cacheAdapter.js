const CacheAdapter = (() => {
  // Simple CacheAdapter that persists announcements per-artist to localStorage
  const STORAGE_KEY = 'artistAnnouncements_v1';
  // TTL for cached partitions in ms (default 24 hours)
  const DEFAULT_TTL = 24 * 60 * 60 * 1000;

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      const now = Date.now();
      const unwrapped = {};
      Object.keys(payload).forEach(k => {
        const meta = payload[k];
        if (!meta || !meta.ts || !meta.items) return;
        const ttl = meta.ttl || DEFAULT_TTL;
        if (now - meta.ts > ttl) {
          // expired - skip
          return;
        }
        unwrapped[k] = meta.items;
      });
      return unwrapped;
    } catch (e) {
      console.warn('CacheAdapter.loadAll failed', e);
      return null;
    }
  }

  function saveAll(map) {
    try {
      // wrap each artist entry with metadata
      const now = Date.now();
      const wrapped = {};
      Object.keys(map).forEach(k => {
        wrapped[k] = { ts: now, ttl: DEFAULT_TTL, items: map[k] };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapped));
    } catch (e) {
      console.warn('CacheAdapter.saveAll failed', e);
    }
  }

  function get(artistName) {
    const all = loadAll();
    return (all && all[artistName]) ? all[artistName] : null;
  }

  function save(artistName, announcements, opts = {}) {
    const all = loadAll() || {};
    all[artistName] = announcements;
    // persist with per-artist TTL if provided
    try {
      const now = Date.now();
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      raw[artistName] = { ts: now, ttl: opts.ttl || DEFAULT_TTL, items: announcements };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch (e) {
      // fallback to generic saveAll wrapper
      saveAll(all);
    }
  }

  return {
    STORAGE_KEY,
    loadAll,
    saveAll,
    get,
    save
  };
})();

// keep global alias for legacy usage
window.CacheAdapter = window.CacheAdapter || CacheAdapter;
