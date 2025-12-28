/**
 * NAVIGATION LAYER
 * Mengatur navigasi halaman dengan memanggil fungsi dari App.js
 * Ini adalah wrapper untuk memudahkan pemanggilan dari HTML
 */

// Kembali ke halaman sebelumnya (dashboard atau artist ke dashboard)
function goBack() {
  App.goBack();
}

// Maju ke halaman berikutnya (tidak digunakan saat ini)
function goForward() {
  App.goForward();
}

// Tampilkan halaman artis dengan nama tertentu
function showArtistPage(artistName) {
  App.showArtistPage(artistName);
  setupFollowButton(); // Setup tombol follow setelah halaman ditampilkan
}

/**
 * FOLLOW BUTTON HANDLER
 * Mengatur interaksi tombol "Ikuti" di halaman artis
 */
function setupFollowButton() {
  const followBtn = document.getElementById("followBtn");
  if (!followBtn) return;

  let isFollowing = false;
  const label = followBtn.querySelector("span");

  followBtn.onclick = () => {
    followBtn.classList.add("animating");

    setTimeout(() => {
      isFollowing = !isFollowing;

      followBtn.classList.toggle("following", isFollowing);
      label.textContent = isFollowing ? "Mengikuti" : "Ikuti";

      followBtn.classList.remove("animating");
    }, 150);
  };
}

