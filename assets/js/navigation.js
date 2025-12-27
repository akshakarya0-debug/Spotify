function showArtistPage(name) {
  App.showArtistPage(name);
}

function goBack() {
  App.goBack();
}

function goForward() {
  App.goForward();
}
let isFollowing = false;

function showArtistPage(artistName) {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('artistPage').classList.add('active');
    document.getElementById('artistName').textContent = artistName;

    if (artistName === 'Fourtwnty') {
        document.getElementById('artistListeners').textContent =
            '10.517.222 pendengar bulanan';
    } else if (artistName === 'Nadhif Basalamah') {
        document.getElementById('artistListeners').textContent =
            '8.342.891 pendengar bulanan';
    } else {
        document.getElementById('artistListeners').textContent =
            '5.234.567 pendengar bulanan';
    }

    currentView = 'artist';

    setupFollowButton(); // ⬅️ PENTING
}

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
