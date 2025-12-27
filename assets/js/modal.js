let readAnnouncements = new Set();
let currentFilter = "unread";

function openAnnouncementModal() {
    document.getElementById("announcementModal").classList.add("active");
    document.body.style.overflow = "hidden";


    // Hilangkan badge
    const badge = document.querySelector(".notification-badge");
    if (badge) badge.style.display = "none";

    renderAnnouncements();
}

function markAsRead(id) {
    readAnnouncements.add(id);

    // Hilangkan badge kalau semua sudah dibaca
    if (readAnnouncements.size === announcementData.length) {
        const badge = document.querySelector(".notification-badge");
        if (badge) badge.style.display = "none";
    }

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
    document.querySelectorAll(".announcement-tabs .tab")
        .forEach((t, i) => t.classList.toggle("active", i === index));
}

function renderAnnouncements() {
    const container = document.getElementById("announcementContainer");

    const filtered = announcementData.filter(a =>
        currentFilter === "unread"
            ? !readAnnouncements.has(a.id)
            : readAnnouncements.has(a.id)
    );

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="color:var(--spotify-light-gray);font-size:14px;">
                Tidak ada pengumuman.
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(a => `
    <div class="announcement-card ${readAnnouncements.has(a.id) ? "read" : ""}"
         onclick="markAsRead('${a.id}')">

        <div class="announcement-header-card">
            <div class="announcement-meta">
                <span>
                    <i class="fa-solid fa-calendar-days"></i> ${a.date}
                </span>
                <span class="announcement-badge">
                    <i class="fa-solid fa-${a.icon}"></i> ${a.type}
                </span>
            </div>
        </div>

        <h4 class="announcement-title">${a.title}</h4>
        <p class="announcement-content">${a.content}</p>

        <div class="announcement-footer">
            ${a.footer.map(f => `<span>${f}</span>`).join("<span>•</span>")}
        </div>
    </div>
`).join("");

}
