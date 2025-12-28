const App = (() => {
  let role = "listener"; // listener | artist
  let view = "dashboard"; // dashboard | artist | studio

  const dashboard = () => document.getElementById("dashboard");
  const artistPage = () => document.getElementById("artistPage");
  const studioView = () => document.getElementById("studioView");
  const studioBtn = () => document.getElementById("studioBtn");
  const roleChip = () => document.getElementById("roleChip");

function hideAll() {
  dashboard().classList.remove("active");
  artistPage().classList.remove("active");
  studioView().classList.remove("active");
}

function showDashboard() {
  hideAll();
  dashboard().classList.add("active");
  view = "dashboard";
}


function openArtistStudio() {
  if (role !== "artist") return;

  // kalau sudah di studio, klik lagi = tutup
  if (view === "studio") {
    showDashboard();
    return;
  }

  hideAll();
  studioView().classList.add("active");
  view = "studio";

  if (window.ArtistStudio?.init) {
    ArtistStudio.init();
  }
}




  function showArtistPage(name) {
    hideAll();
    artistPage().classList.add("active");
    document.getElementById("artistName").textContent = name;
    
    // Set listener count berdasarkan artis
    const listeners = {
      'Fourtwnty': '10.517.222 pendengar bulanan',
      'Nadhif Basalamah': '8.342.891 pendengar bulanan',
    };
    
    const listenerCount = listeners[name] || '5.234.567 pendengar bulanan';
    document.getElementById("artistListeners").textContent = listenerCount;
    
    // ===== ANNOUNCEMENT SYSTEM =====
    // Set current artist di ArtistStudio (untuk tracking)
    ArtistStudio.setCurrentArtist(name);
    
    // Tampilkan button pengumuman untuk SEMUA artist
    const announcementBtn = document.getElementById("announcementBtn");
    if (announcementBtn) {
      announcementBtn.style.display = "inline-flex"; // Tampilkan untuk semua
    }
    
    // Update notification badge (hanya muncul untuk Fourtwnty)
    ArtistStudio.updateNotificationBadge();
    
    view = "artist";
  }

  function toggleRole() {
  role = role === "listener" ? "artist" : "listener";

  roleChip().innerHTML =
    role === "artist"
      ? `<i class="fa-solid fa-microphone"></i> Mode Artist`
      : `<i class="fa-solid fa-headphones"></i> Mode Listener`;

  studioBtn().style.display = role === "artist" ? "inline-flex" : "none";

  // force exit studio jika turun ke listener
  if (role === "listener" && view === "studio") {
    showDashboard();
  }
}



  function goBack() {
    if (view === "studio" || view === "artist") {
      showDashboard();
    }
  }

  function goForward() {}

  return {
    toggleRole,
    openArtistStudio,
    showArtistPage,
    goBack,
    goForward,
    showDashboard
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("studioBtn").style.display = "none";
  App.showDashboard();
});
