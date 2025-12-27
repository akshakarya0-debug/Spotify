// Simple wrapper around localStorage for this prototype
const Storage = (() => {
  const KEY = "spotify_prototype_announcements_v1";

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Storage.load failed:", e);
      return null;
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  return { KEY, load, save, clear };
})();
