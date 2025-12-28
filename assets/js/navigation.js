/**
 * NAVIGATION LAYER
 * Wrapper antara HTML dan App.js
 * + Follow button dengan state per artis (FIXED)
 */

/* =========================
   FOLLOW STATE (PER ARTIS)
   key = nama artis (diambil dari DOM)
========================= */
const followState = {};

/* =========================
   NAVIGATION WRAPPER
========================= */

// Tombol back (pakai logic App)
function goBack() {
  App.goBack();
}

// Forward tidak dipakai
function goForward() {
  // intentionally empty
}

// Navigasi ke halaman artis
function showArtistPage(artistName) {
  App.showArtistPage(artistName);

  // SETUP FOLLOW setelah halaman artis aktif
  setupFollowButton();
}

/* =========================
   FOLLOW BUTTON HANDLER
   SUMBER KEBENARAN: DOM (#artistName)
========================= */
function setupFollowButton() {
  const followBtn = document.getElementById("followBtn");
  const artistNameEl = document.getElementById("artistName");

  if (!followBtn || !artistNameEl) return;

  const artistName = artistNameEl.textContent.trim();
  const label = followBtn.querySelector("span");

  if (!label) return;

  // Ambil state follow berdasarkan artis AKTIF
  let isFollowing = !!followState[artistName];

  // Render state awal
  followBtn.classList.toggle("following", isFollowing);
  label.textContent = isFollowing ? "Mengikuti" : "Ikuti";

  // Reset handler agar tidak dobel
  followBtn.onclick = null;

  followBtn.onclick = () => {
    followBtn.classList.add("animating");

    setTimeout(() => {
      isFollowing = !isFollowing;

      // Simpan state ke artis yang benar
      followState[artistName] = isFollowing;

      // Update UI
      followBtn.classList.toggle("following", isFollowing);
      label.textContent = isFollowing ? "Mengikuti" : "Ikuti";

      followBtn.classList.remove("animating");
    }, 150);
  };
}
