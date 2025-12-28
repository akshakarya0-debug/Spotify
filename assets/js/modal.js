/**
 * ANNOUNCEMENT VIEWER MODAL - Artist Page
 * Modal ini menampilkan pengumuman yang dibuat setiap artist
 * Setiap artist punya data announcement terpisah (tidak dicampur)
 * Setiap artist juga punya read status tracking terpisah
 * 
 * ALUR:
 * Artis buat pengumuman di Artist Studio → Disimpan untuk artist itu
 * User buka Artist Page (Fourtwnty/Nadhif/etc) → Klik tombol "Pengumuman"
 * → Tampilkan announcement untuk artist yang sedang dibuka
 * → Read/unread tracking terpisah per-artist
 * → Badge update berdasarkan artist yang sedang dibuka
 */

// Track read announcement per-artist
// Structure: { 'Fourtwnty': Set[id1, id2], 'Nadhif Basalamah': Set[id3, id4] }
// try to load persisted read state from localStorage (survive reloads)
let readAnnouncementsByArtist = (function(){
  try {
    const raw = localStorage.getItem('readAnnouncementsByArtist_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      // convert arrays to Sets
      Object.keys(parsed).forEach(k => parsed[k] = new Set(parsed[k]));
      return parsed;
    }
  } catch(e){ console.warn('Failed to load readAnnouncementsByArtist', e); }
  return {};
})();

let currentFilter = "unread";

/**
 * Buka modal viewer untuk membaca announcement
 * Modal menampilkan announcement untuk artist yang sedang dibuka
 */
function openAnnouncementViewerModal() {
  const modal = document.getElementById("announcementViewerModal");
  if (!modal) return;
  
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Reset tab ke "Belum dibaca"
  currentFilter = "unread";
  setActiveTab(0);

  // Render pengumuman
  renderAnnouncements();
}

/**
 * Tutup modal viewer
 */
function closeAnnouncementViewerModal() {
  const modal = document.getElementById("announcementViewerModal");
  if (!modal) return;
  
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

/**
 * Get read announcements Set untuk artist tertentu
 * Jika belum ada, buat Set baru
 */
function getReadAnnouncementsForArtist(artistName) {
  if (!readAnnouncementsByArtist[artistName]) {
    readAnnouncementsByArtist[artistName] = new Set();
  }
  return readAnnouncementsByArtist[artistName];
}

/**
 * Tandai pengumuman sebagai sudah dibaca
 * Tracking per-artist
 */
function markAsRead(id) {
  // Get artist name dari DOM
  const artistNameEl = document.getElementById("artistName");
  if (!artistNameEl) return;
  
  const artistName = artistNameEl.textContent;

  // Convert id ke number (mendukung number atau numeric-string)
  const idNumber = Number(id);

  // Tambah ke read set untuk artist ini
  const readSet = getReadAnnouncementsForArtist(artistName);
  readSet.add(idNumber);

  // persist to localStorage (arrays only)
  try {
    const plain = {};
    Object.keys(readAnnouncementsByArtist).forEach(k => {
      plain[k] = Array.from(readAnnouncementsByArtist[k]);
    });
    localStorage.setItem('readAnnouncementsByArtist_v1', JSON.stringify(plain));
  } catch (e) {
    console.warn('Failed to persist readAnnouncementsByArtist', e);
  }
  console.log(`✓ Mark as read: ${artistName} - ID ${idNumber}`, readSet);

  // Update notification badge (langsung ke ArtistStudio)
  if (window.ArtistStudio && window.ArtistStudio.updateNotificationBadge) {
    ArtistStudio.updateNotificationBadge();
  }

  // Re-render modal
  renderAnnouncements();
}

/**
 * Tampilkan tab "Belum Dibaca"
 */
function showUnread() {
  currentFilter = "unread";
  setActiveTab(0);
  renderAnnouncements();
}

/**
 * Tampilkan tab "Sudah Dibaca"
 */
function showRead() {
  currentFilter = "read";
  setActiveTab(1);
  renderAnnouncements();
}

/**
 * Set tab mana yang active
 */
function setActiveTab(index) {
  document.querySelectorAll(".announcement-tabs .tab")
    .forEach((t, i) => t.classList.toggle("active", i === index));
}

/**
 * Render announcement dalam modal
 * Menampilkan announcement untuk artist yang sedang dibuka (currentArtist)
 * Filter berdasarkan read/unread status
 * 
 * PENTING: Data per-artist terpisah, tidak dicampur
 */
function renderAnnouncements() {
  const container = document.getElementById("announcementContainer");
  
  // Get artistName dari DOM (dari halaman artist yang sedang dibuka)
  const artistNameEl = document.getElementById("artistName");
  if (!artistNameEl) return;
  
  const artistName = artistNameEl.textContent;

  // Get announcement untuk artist yang sedang dibuka (terpisah per-artist)
  const published = ArtistStudio.getPublishedAnnouncements(artistName);

  if (!container) return;

  if (published.length === 0) {
    container.innerHTML = `
      <div style="color:var(--spotify-light-gray);font-size:14px;">
        Tidak ada pengumuman dari ${artistName}.
      </div>
    `;
    return;
  }

  // Get read set untuk artist ini
  const readSet = getReadAnnouncementsForArtist(artistName);

  // Filter berdasarkan status read/unread
  const filtered = published.filter(a =>
    currentFilter === "unread"
      ? !readSet.has(a.id)
      : readSet.has(a.id)
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="color:var(--spotify-light-gray);font-size:14px;">
        ${currentFilter === "unread" ? "Tidak ada pengumuman belum dibaca" : "Tidak ada pengumuman yang sudah dibaca"}
      </div>
    `;
    return;
  }

  // Render announcement
  container.innerHTML = filtered.map(a => `
    <div class="announcement-card ${readSet.has(a.id) ? "read" : ""}"
         onclick="markAsRead(${a.id})">

      <div class="announcement-header-card">
        <div class="announcement-meta">
          <span>
            <i class="fa-solid fa-calendar-days"></i> ${new Date(a.createdAt).toLocaleDateString("id-ID")}
          </span>
        </div>
      </div>

      <h4 class="announcement-title">${a.content}</h4>

      <div class="announcement-footer">
        <span><i class="fa-regular fa-eye"></i> ${(a.views||0).toLocaleString()} views</span>
      </div>
    </div>
  `).join("");
}

/**
 * PUBLIC FUNCTION - Hitung berapa announcement yang belum dibaca untuk artist
 * Digunakan oleh artistStudio.js untuk update badge
 * 
 * @param {string} artistName - Nama artist
 * @param {Array} publishedAnnouncements - Array announcement yang published
 * @return {number} - Jumlah announcement yang belum dibaca
 */
function getUnreadCountForArtist(artistName, publishedAnnouncements = []) {
  if (!publishedAnnouncements || publishedAnnouncements.length === 0) {
    return 0;
  }

  // Get read set untuk artist ini
  const readSet = readAnnouncementsByArtist[artistName] || new Set();

  // Hitung yang BELUM dibaca
  const unreadCount = publishedAnnouncements.filter(a => !readSet.has(a.id)).length;
  return unreadCount;
}
