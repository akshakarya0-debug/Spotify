/**
 * ANNOUNCEMENT VIEWER MODAL - Artist Page
 * - Announcement per artist
 * - Read/unread tracking per artist
 * - Notification badge auto update (FIXED)
 */

/* =========================
   READ STATE (PER ARTIST)
========================= */
let readAnnouncementsByArtist = (function () {
  try {
    const raw = localStorage.getItem("readAnnouncementsByArtist_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.keys(parsed).forEach(
        k => (parsed[k] = new Set(parsed[k]))
      );
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load read state", e);
  }
  return {};
})();

let currentFilter = "unread";

/* =========================
   MODAL OPEN / CLOSE
========================= */
function openAnnouncementViewerModal() {
  const modal = document.getElementById("announcementViewerModal");
  if (!modal) return;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  currentFilter = "unread";
  setActiveTab(0);

  renderAnnouncements();
  updateAnnouncementBadgeForCurrentArtist();
}

function closeAnnouncementViewerModal() {
  const modal = document.getElementById("announcementViewerModal");
  if (!modal) return;

  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

/* =========================
   READ STATE HELPERS
========================= */
function getReadAnnouncementsForArtist(artistName) {
  if (!readAnnouncementsByArtist[artistName]) {
    readAnnouncementsByArtist[artistName] = new Set();
  }
  return readAnnouncementsByArtist[artistName];
}

function persistReadState() {
  try {
    const plain = {};
    Object.keys(readAnnouncementsByArtist).forEach(
      k => (plain[k] = Array.from(readAnnouncementsByArtist[k]))
    );
    localStorage.setItem(
      "readAnnouncementsByArtist_v1",
      JSON.stringify(plain)
    );
  } catch (e) {
    console.warn("Persist read state failed", e);
  }
}

/* =========================
   MARK AS READ (FIXED)
========================= */
function markAsRead(id) {
  const artistNameEl = document.getElementById("artistName");
  if (!artistNameEl) return;

  const artistName = artistNameEl.textContent.trim();
  const idNumber = Number(id);

  const readSet = getReadAnnouncementsForArtist(artistName);
  if (readSet.has(idNumber)) return;

  readSet.add(idNumber);
  persistReadState();

  updateAnnouncementBadgeForCurrentArtist();
  renderAnnouncements();
}

/* =========================
   TAB HANDLERS
========================= */
function showUnread() {
  currentFilter = "unread";
  setActiveTab(0);
  renderAnnouncements();
}

function showRead() {
  currentFilter = "read";
  setActiveTab(1);
  renderAnnouncements();
}

function setActiveTab(index) {
  document
    .querySelectorAll(".announcement-tabs .tab")
    .forEach((t, i) => t.classList.toggle("active", i === index));
}

/* =========================
   RENDER ANNOUNCEMENTS
========================= */
function renderAnnouncements() {
  const container = document.getElementById("announcementContainer");
  const artistNameEl = document.getElementById("artistName");

  if (!container || !artistNameEl) return;

  const artistName = artistNameEl.textContent.trim();
  const published =
    ArtistStudio.getPublishedAnnouncements(artistName) || [];

  if (published.length === 0) {
    container.innerHTML = `
      <div style="color:var(--spotify-light-gray);font-size:14px;">
        Tidak ada pengumuman dari ${artistName}.
      </div>
    `;
    return;
  }

  const readSet = getReadAnnouncementsForArtist(artistName);

  const filtered = published.filter(a =>
    currentFilter === "unread"
      ? !readSet.has(a.id)
      : readSet.has(a.id)
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="color:var(--spotify-light-gray);font-size:14px;">
        ${
          currentFilter === "unread"
            ? "Tidak ada pengumuman belum dibaca"
            : "Tidak ada pengumuman yang sudah dibaca"
        }
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      a => `
    <div class="announcement-card ${
      readSet.has(a.id) ? "read" : ""
    }" onclick="markAsRead(${a.id})">

      <div class="announcement-header-card">
        <div class="announcement-meta">
          <span>
            <i class="fa-solid fa-calendar-days"></i>
            ${new Date(a.createdAt).toLocaleDateString("id-ID")}
          </span>
        </div>
      </div>

      <h4 class="announcement-title">${a.content}</h4>

      <div class="announcement-footer">
        <span>
          <i class="fa-regular fa-eye"></i>
          ${(a.views || 0).toLocaleString()} views
        </span>
      </div>
    </div>
  `
    )
    .join("");
}

/* =========================
   BADGE HANDLER (FINAL FIX)
========================= */
function updateAnnouncementBadgeForCurrentArtist() {
  const badge = document.querySelector(".notification-badge");
  const artistNameEl = document.getElementById("artistName");

  if (!badge || !artistNameEl) return;

  const artistName = artistNameEl.textContent.trim();
  const published =
    ArtistStudio.getPublishedAnnouncements(artistName) || [];

  const unreadCount = getUnreadCountForArtist(
    artistName,
    published
  );

  if (unreadCount > 0) {
    badge.style.display = "inline-flex";
    badge.textContent = unreadCount;
  } else {
    badge.style.display = "none";
  }
}

/* =========================
   PUBLIC HELPER (FOR STUDIO)
========================= */
function getUnreadCountForArtist(artistName, published = []) {
  if (!published || published.length === 0) return 0;

  const readSet =
    readAnnouncementsByArtist[artistName] || new Set();

  return published.filter(a => !readSet.has(a.id)).length;
}
