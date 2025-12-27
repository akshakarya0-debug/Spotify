let currentFilter = "unread";
let readSet = new Set(JSON.parse(localStorage.getItem("read_announcements") || "[]"));

function saveRead() {
  localStorage.setItem("read_announcements", JSON.stringify([...readSet]));
}

function openAnnouncementModal() {
  document.getElementById("announcementModal").classList.add("active");
  document.body.style.overflow = "hidden";
  renderAnnouncements();
}

function closeAnnouncementModal() {
  document.getElementById("announcementModal").classList.remove("active");
  document.body.style.overflow = "auto";
}

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

function markAsRead(id) {
  readSet.add(id);
  saveRead();
  renderAnnouncements();
}

function renderAnnouncements() {
  const container = document.getElementById("announcementContainer");
  const state = ArtistStudioStore.getState();

  const items = state.announcements.filter(a =>
    a.status === "published"
  );

  const filtered = items.filter(a =>
    currentFilter === "unread"
      ? !readSet.has(a.id)
      : readSet.has(a.id)
  );

  if (!filtered.length) {
    container.innerHTML = `<div class="muted">Tidak ada pengumuman.</div>`;
    return;
  }

  container.innerHTML = filtered.map(a => `
    <div class="announcement-card ${readSet.has(a.id) ? "read" : ""}"
         onclick="markAsRead('${a.id}')">
      <h4>${a.title}</h4>
      <p>${a.content}</p>
    </div>
  `).join("");
}
