const ArtistStudio = (() => {
  /**
   * ======================
   * STATE - Penyimpanan announcement per-artist
   * ======================
   * Setiap artist punya announcement sendiri-sendiri (tidak dicampur)
   * Structure: { 'Fourtwnty': [...], 'Nadhif Basalamah': [...], ... }
   */
  // Load persisted announcements via CacheAdapter if available (demo of partitioning/persistence)
  let artistAnnouncements = (window.CacheAdapter && CacheAdapter.loadAll()) || {
    'Fourtwnty': [],
    'Nadhif Basalamah': []
  };
  
  let currentArtist = 'Fourtwnty'; // Track artist yang sedang ditampilkan
  let activeFilter = "all";

  /**
   * ======================
   * UTILITIES - Fungsi helper
   * ======================
   */

  function now() {
    return new Date();
  }

  function formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function timeAgo(date) {
    if (!date) return "";
    const diff = Math.floor((now() - new Date(date)) / 60000);
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
    return `${Math.floor(diff / 1440)} hari lalu`;
  }

  function computeStatus(a) {
    if (a.status === "draft") return "draft";

    const start = a.startDate ? new Date(a.startDate) : null;
    const end = a.endDate ? new Date(a.endDate) : null;

    if (start && now() < start) return "pending";
    if (end && now() > end) return "expired";

    return "published";
  }

  /**
   * ======================
   * RENDER - Tampilkan announcement di Studio
   * ======================
   */

  function renderAnnouncement(a) {
    const status = computeStatus(a);

    return `
      <article class="announcement-item ${status}">
        <header class="announcement-header">
          <span class="status ${status}">
            ${status === "published" ? "Published" :
              status === "pending" ? "Scheduled" :
              status === "expired" ? "Expired" : "Draft"}
          </span>

          ${
            a.endDate
              ? `<span class="announcement-meta">
                  <i class="fa-regular fa-clock"></i>
                  Aktif hingga ${formatDate(a.endDate)}
                </span>`
              : ""
          }
        </header>

        <p class="announcement-content">${a.content}</p>

        <footer class="announcement-footer">
          ${
            status === "published"
              ? `<span class="announcement-metric">
                  <i class="fa-regular fa-eye"></i>
                  ${(a.views||0).toLocaleString()} tayangan
                </span>`
              : `<span class="announcement-metric muted">
                  Belum ditayangkan
                </span>`
          }

          <span class="announcement-date">
            ${timeAgo(a.createdAt)}
          </span>
        </footer>
      </article>
    `;
  }

  function renderList() {
    const container = document.querySelector(".announcement-list");
    if (!container) return;
    const t0 = (window.performance && performance.now) ? performance.now() : Date.now();

    container.innerHTML = "";

      // Get announcement untuk artist yang sedang ditampilkan di studio
      const announcements = getAnnouncementsForArtist(currentArtist);

    // Filter announcement berdasarkan filter aktif
    const visible = announcements
      .map(a => ({ ...a, status: computeStatus(a) }))
      .filter(a => {
        if (activeFilter === "all") return true;
        return a.status === activeFilter;
      });

    // Jika tidak ada announcement pada kategori ini
    if (visible.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Belum ada pengumuman pada kategori ini.
        </div>
      `;
      return;
    }

    // Render semua announcement
    // sanitize content when rendering
    const html = visible.map(a => {
      // ensure content is escaped
      if (window.Sanitizer && Sanitizer.escapeHtml) {
        a.content = Sanitizer.escapeHtml(a.content);
      }
      return renderAnnouncement(a);
    }).join("");

    container.innerHTML = html;

    const t1 = (window.performance && performance.now) ? performance.now() : Date.now();
    const latency = Math.round(t1 - t0);
    if (window.FeatureFlags ? FeatureFlags.isEnabled('enableTelemetry') : true) {
      if (window.Telemetry && Telemetry.track) Telemetry.track('feed.render', { artist: currentArtist, items: visible.length, latency });
    }
  }

  /**
   * ======================
   * FILTER SYSTEM
   * ======================
   */

  function bindFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        // Hapus active dari semua button
        document
          .querySelectorAll(".filter-btn")
          .forEach(b => b.classList.remove("active"));

        // Tambah active ke button yang diklik
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        
        // Re-render dengan filter baru
        renderList();
      });
    });
  }

  /**
   * ======================
   * PUBLIC API
   * ======================
   */

  /**
   * Set artist yang sedang ditampilkan di page
   * Digunakan untuk tracking ketika user membuka artist page
   */
  function setCurrentArtist(artistName) {
    if (!artistAnnouncements[artistName]) {
      artistAnnouncements[artistName] = []; // Inisialisasi jika belum ada
    }
    currentArtist = artistName;
  }

  /**
   * Tambah pengumuman baru untuk Fourtwnty (kita)
   * Dipanggil dari AnnouncementModal saat artis membuat pengumuman
   */
  function addAnnouncement({
    content,
    image = null,
    mode = "publish",
    startDate = null,
    endDate = null
  }) {
    // Tambah ke announcement artist yang sedang aktif
    const announcementData = {
      id: Date.now(),
      content,
      startDate,
      endDate,
      status: mode === "draft" ? "draft" : "published",
      views: 0,
      createdAt: now()
    };

    // insert at head for newest-first ordering
    const list = getAnnouncementsForArtist(currentArtist);
    list.unshift(announcementData);
    saveAnnouncementsForArtist(currentArtist, list);

    // Re-render announcement list
    renderList();
    
    // Update notification badge
    updateNotificationBadge();
  }

  /**
   * Get announcement yang published untuk artist tertentu
   * Digunakan untuk menampilkan di modal viewer
   */
  function getPublishedAnnouncements(artistName) {
    const announcements = getAnnouncementsForArtist(artistName);
    return announcements.filter(a => computeStatus(a) === "published");
  }

  /**
   * ======================
   * Partitioning helpers (NFR-07 demo)
   * - getAnnouncementsForArtist: read partition/key
   * - saveAnnouncementsForArtist: persist partition + optional CacheAdapter
   * - fanoutToFollowers: stub demo for chunked fanout (no-op in client)
   * ======================
   */

  function getAnnouncementsForArtist(artistName) {
    return artistAnnouncements[artistName] || [];
  }

  function saveAnnouncementsForArtist(artistName, announcements) {
    artistAnnouncements[artistName] = announcements;
    // persist to CacheAdapter to simulate durable partition
    if (window.CacheAdapter && CacheAdapter.save) {
      try { CacheAdapter.save(artistName, announcements); } catch (e) { console.warn('CacheAdapter.save failed', e); }
    }
  }

  function fanoutToFollowers(artistName, announcement) {
    // Demo-only: show how fanout chunking could be instrumented.
    // Real system: push messages to broker (Kafka), workers deliver to notification service.
    // respect telemetry feature flag
    const telemetryEnabled = window.FeatureFlags ? FeatureFlags.isEnabled('enableTelemetry') : true;
    if (!telemetryEnabled || !window.Telemetry || !Telemetry.track) return;

    Telemetry.track('fanout.started', { artistName, id: announcement.id });

    const CHUNK_SIZE = 1000; // example chunk size
    const followerEstimate = announcement.followerEstimate || 0;
    const chunks = Math.max(1, Math.ceil(followerEstimate / CHUNK_SIZE));

    Telemetry.track('fanout.chunks', { artistName, chunks });

    // client/demo: we simply log chunk plan
    for (let i = 0; i < chunks; i++) {
      // in production, produce message for chunk i to broker
      Telemetry.track('fanout.chunk', { artistName, chunkIndex: i, id: announcement.id });
    }

    Telemetry.track('fanout.completed', { artistName, id: announcement.id });
  }

  /**
   * Update badge notifikasi di Artist Page
   * Badge HANYA muncul di halaman Fourtwnty (kita) jika ada belum dibaca
   * 
   * PENTING: Gunakan function getUnreadCountForArtist() dari modal.js
   */
  function updateNotificationBadge() {
    const badge = document.querySelector(".notification-badge");
    
    // Get published announcement untuk artist yang sedang aktif
    const published = getPublishedAnnouncements(currentArtist);
    
    if (!badge || published.length === 0) {
      if (badge) badge.style.display = "none";
      return;
    }

    // Gunakan function dari modal.js untuk cek unread count
    const unreadCount = getUnreadCountForArtist(currentArtist, published);

    console.log(`🔔 Badge update: ${currentArtist} - Published: ${published.length}, Unread: ${unreadCount}`);

    // Hanya tampilkan badge jika ada yang belum dibaca
    if (unreadCount > 0) {
      badge.style.display = "inline-block"; // ← Muncul
      console.log(`✓ Badge MUNCUL (${unreadCount} unread)`);
    } else {
      badge.style.display = "none"; // ← Hilang
      console.log(`✗ Badge HILANG (semua sudah dibaca)`);
    }
  }

  /**
   * Inisialisasi Studio saat dibuka
   */
  function init() {
    bindFilters();
    renderList();
    updateNotificationBadge();
  }

  return {
    init,
    addAnnouncement,
    getPublishedAnnouncements,
    updateNotificationBadge,
    setCurrentArtist
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  ArtistStudio.init();
  ArtistStudio.updateNotificationBadge();
});
