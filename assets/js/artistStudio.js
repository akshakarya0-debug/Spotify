const ArtistStudio = (() => {
  /* ======================
     STATE
  ====================== */

  let announcements = [];
  let activeFilter = "all";

  /* ======================
     UTILITIES
  ====================== */

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

    if (start && now() < start) return "scheduled";
    if (end && now() > end) return "expired";

    return "published";
  }

  /* ======================
     RENDER
  ====================== */

  function renderAnnouncement(a) {
    const status = computeStatus(a);

    return `
      <article class="announcement-item ${status}">
        <header class="announcement-header">
          <span class="status ${status}">
            ${status === "published" ? "Published" :
              status === "scheduled" ? "Scheduled" :
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
                  ${a.views.toLocaleString()} tayangan
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

    container.innerHTML = "";

    const visible = announcements
      .map(a => ({ ...a, status: computeStatus(a) }))
      .filter(a => {
        if (activeFilter === "all") return true;
        return a.status === activeFilter;
      });

    if (visible.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Belum ada pengumuman pada kategori ini.
        </div>
      `;
      return;
    }

    container.innerHTML = visible.map(renderAnnouncement).join("");
  }

  /* ======================
     FILTER
  ====================== */

  function bindFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-btn")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        renderList();
      });
    });
  }

  /* ======================
     PUBLIC API
  ====================== */

  function addAnnouncement({
    content,
    image = null,
    mode = "publish",
    startDate = null,
    endDate = null
  }) {
    announcements.unshift({
      id: Date.now(),
      content,
      startDate,
      endDate,
      status: mode === "draft" ? "draft" : "published",
      views: 0,
      createdAt: now()
    });

    renderList();
  }

  function init() {
    bindFilters();
    renderList();
  }

  return {
    init,
    addAnnouncement
  };
})();

document.addEventListener("DOMContentLoaded", ArtistStudio.init);
