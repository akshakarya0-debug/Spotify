const App = (() => {
  let role = "listener"; // listener | artist
  let view = "dashboard"; // dashboard | artist | studio

  const dashboard = () => document.getElementById("dashboard");
  const artistPage = () => document.getElementById("artistPage");
  const studioView = () => document.getElementById("studioView");
  const studioBtn = () => document.getElementById("studioBtn");
  const roleChip = () => document.getElementById("roleChip");

  function hideAll() {
    dashboard().style.display = "none";
    artistPage().classList.remove("active");
    studioView().style.display = "none";
  }

  function showDashboard() {
    hideAll();
    dashboard().style.display = "block";
    view = "dashboard";
  }

  function showArtistPage(name) {
    hideAll();
    artistPage().classList.add("active");
    document.getElementById("artistName").textContent = name;
    view = "artist";
  }

  function openArtistStudio() {
    if (role !== "artist") return;
    hideAll();
    studioView().style.display = "block";
    view = "studio";
    if (window.ArtistStudio?.init) {
      ArtistStudio.init();
    }
  }

  function toggleRole() {
    role = role === "listener" ? "artist" : "listener";

    roleChip().textContent =
      role === "artist" ? "🎤 Mode: Artist" : "🎧 Mode: Listener";

    studioBtn().style.display = role === "artist" ? "inline-flex" : "none";

    // ⬅️ PENTING: role switch TIDAK mengubah view
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
