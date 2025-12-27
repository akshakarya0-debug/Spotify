// Artist Studio CRUD + scheduling (FINAL – disesuaikan dengan HTML & App)

// ⬇️ state minimal, tidak bentrok dengan App
const AppState = {
  currentArtistId: "fourtwnty"
};

/* =========================
   STORE
========================= */
const ArtistStudioStore = (() => {
  function ensure() {
    const existing = Storage.load();
    if (existing && existing.version === 1) return existing;
    const seeded = SeedData.initialStore();
    Storage.save(seeded);
    return seeded;
  }

  function getState() {
    return ensure();
  }

  function setState(next) {
    Storage.save(next);
  }

  function upsertAnnouncement(a) {
    const state = getState();
    const idx = state.announcements.findIndex(x => x.id === a.id);
    if (idx >= 0) state.announcements[idx] = a;
    else state.announcements.unshift(a);
    setState(state);
    return a;
  }

  function deleteAnnouncement(id) {
    const state = getState();
    state.announcements = state.announcements.filter(a => a.id !== id);
    setState(state);
  }

  function seedDemo() {
    Storage.save(SeedData.initialStore());
  }

  return { getState, setState, upsertAnnouncement, deleteAnnouncement, seedDemo };
})();

/* =========================
   STUDIO
========================= */
const ArtistStudio = (() => {
  let editingId = null;
  let statusFilter = "all"; // ⬅️ dari tab HTML

  // DOM helpers
  const artistSelect = () => document.getElementById("studioArtistSelect");
  const searchInput = () => document.getElementById("studioSearchInput");
  const listEl = () => document.getElementById("studioList");

  const statTotal = () => document.getElementById("statTotal");
  const statPublished = () => document.getElementById("statPublished");
  const statDraft = () => document.getElementById("statDraft");

  // composer fields
  const composerModal = () => document.getElementById("composerModal");
  const cArtist = () => document.getElementById("composerArtist");
  const cBadge = () => document.getElementById("composerBadge");
  const cTitle = () => document.getElementById("composerTitle");
  const cContent = () => document.getElementById("composerContent");
  const cWhen = () => document.getElementById("composerWhen");
  const cScheduleWrap = () => document.getElementById("composerScheduleWrap");
  const cScheduleAt = () => document.getElementById("composerScheduleAt");
  const cDeleteBtn = () => document.getElementById("composerDeleteBtn");

  /* ---------- INIT ---------- */
  function init() {
    populateArtists();
    renderList();
    wireComposer();
  }

  function populateArtists() {
    const state = ArtistStudioStore.getState();
    const options = state.artists
      .map(a => `<option value="${a.id}">${a.name}</option>`)
      .join("");

    artistSelect().innerHTML = options;
    cArtist().innerHTML = options;

    artistSelect().value = AppState.currentArtistId;
    cArtist().value = AppState.currentArtistId;
  }

  /* ---------- FILTERING ---------- */
  function setStatus(status) {
    statusFilter = status;

    document
      .querySelectorAll(".announcement-tabs .tab")
      .forEach(btn => {
        btn.classList.toggle("active", btn.dataset.status === status);
      });

    renderList();
  }

  function getFiltered() {
    const state = ArtistStudioStore.getState();
    const artistId = artistSelect().value;
    const q = (searchInput().value || "").trim().toLowerCase();
    const now = Date.now();

    let items = state.announcements.filter(a => a.artistId === artistId);

    // scheduled → published jika waktunya lewat
    let changed = false;
    for (const a of items) {
      if (a.status === "scheduled" && a.publishedAt) {
        if (new Date(a.publishedAt).getTime() <= now) {
          a.status = "published";
          a.updatedAt = new Date().toISOString();
          changed = true;
        }
      }
    }
    if (changed) ArtistStudioStore.setState(state);

    items = ArtistStudioStore.getState().announcements.filter(a => a.artistId === artistId);

    if (statusFilter !== "all") {
      items = items.filter(a => a.status === statusFilter);
    }

    if (q) {
      items = items.filter(a =>
        (a.title || "").toLowerCase().includes(q) ||
        (a.content || "").toLowerCase().includes(q) ||
        (a.badge || "").toLowerCase().includes(q)
      );
    }

    items.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    );

    return items;
  }

  /* ---------- RENDER ---------- */
  function renderStats() {
    const state = ArtistStudioStore.getState();
    const artistId = artistSelect().value;
    const items = state.announcements.filter(a => a.artistId === artistId);

    statTotal().textContent = items.length;
    statPublished().textContent = items.filter(a => a.status === "published").length;
    statDraft().textContent = items.filter(a => a.status === "draft").length;
  }

  function renderList() {
    const items = getFiltered();
    renderStats();

    listEl().innerHTML = items.length
      ? items.map(renderRow).join("")
      : `<div class="muted">Belum ada data. Klik <b>+ Buat Pengumuman</b> untuk mulai.</div>`;
  }

  function renderRow(a) {
    return `
      <div class="studio-item">
        <div>
          <div class="pill ${a.status}">${statusLabel(a)}</div>
          <h4>${escapeHtml(a.title || "(Tanpa judul)")}</h4>
          <div class="line">
            ${escapeHtml(a.badge || "📣 Update")} • ${formatWhen(a)}
          </div>
          <div class="line">
            ${escapeHtml((a.content || "").slice(0,120))}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn-secondary small" onclick="ArtistStudio.openComposer('${a.id}')">Edit</button>
          <button class="btn-secondary small" onclick="ArtistStudio.quickPublish('${a.id}')">Publish</button>
        </div>
      </div>
    `;
  }

  function statusLabel(a) {
    if (a.status === "draft") return "Draft";
    if (a.status === "scheduled") return "Scheduled";
    return "Published";
  }

  function formatWhen(a) {
    const iso = a.publishedAt || a.createdAt;
    try {
      return new Date(iso).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch {
      return "—";
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s =>
      ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[s])
    );
  }

  /* ---------- COMPOSER ---------- */
  function openComposer(id = null) {
    editingId = id;
    populateArtists();

    cWhen().value = "now";
    cScheduleWrap().style.display = "none";
    cScheduleAt().value = "";
    cDeleteBtn().style.display = id ? "inline-flex" : "none";

    if (!id) {
      cArtist().value = artistSelect().value;
      cBadge().value = "📣 Update";
      cTitle().value = "";
      cContent().value = "";
    } else {
      const a = ArtistStudioStore.getState().announcements.find(x => x.id === id);
      if (a) {
        cArtist().value = a.artistId;
        cBadge().value = a.badge || "📣 Update";
        cTitle().value = a.title || "";
        cContent().value = a.content || "";

        if (a.status === "draft") cWhen().value = "draft";
        else if (a.status === "scheduled") {
          cWhen().value = "schedule";
          cScheduleWrap().style.display = "block";
          cScheduleAt().value = toLocalInputValue(a.publishedAt);
        } else {
          cWhen().value = "now";
        }
      }
    }

    composerModal().classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeComposer() {
    composerModal().classList.remove("active");
    document.body.style.overflow = "auto";
    editingId = null;
  }

  function wireComposer() {
    cWhen().addEventListener("change", () => {
      cScheduleWrap().style.display =
        cWhen().value === "schedule" ? "block" : "none";
    });

    composerModal().addEventListener("click", e => {
      if (e.target === composerModal()) closeComposer();
    });
  }

  function saveComposer() {
    const nowIso = new Date().toISOString();
    const state = ArtistStudioStore.getState();

    const id = editingId || ("a_" + Math.random().toString(16).slice(2, 10));
    const artistId = cArtist().value;
    const badge = cBadge().value;
    const title = cTitle().value.trim();
    const content = cContent().value.trim();

    if (!title || !content) {
      alert("Judul & isi wajib diisi.");
      return;
    }

    let status = "published";
    let publishedAt = nowIso;

    if (cWhen().value === "draft") {
      status = "draft";
      publishedAt = null;
    } else if (cWhen().value === "schedule") {
      status = "scheduled";
      if (!cScheduleAt().value) {
        alert("Isi jadwalnya dulu.");
        return;
      }
      publishedAt = new Date(cScheduleAt().value).toISOString();
    }

    const existing = state.announcements.find(x => x.id === id);

    ArtistStudioStore.upsertAnnouncement({
      id,
      artistId,
      badge,
      title,
      content,
      footer: existing?.footer || [],
      status,
      publishedAt,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso
    });

    closeComposer();
    renderList();
    AnnouncementUI?.render?.();
  }

  function toLocalInputValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function deleteFromComposer() {
    if (!editingId) return;
    if (!confirm("Yakin hapus pengumuman ini?")) return;
    ArtistStudioStore.deleteAnnouncement(editingId);
    closeComposer();
    renderList();
    AnnouncementUI?.render?.();
  }

  function quickPublish(id) {
    const state = ArtistStudioStore.getState();
    const a = state.announcements.find(x => x.id === id);
    if (!a) return;

    a.status = "published";
    a.publishedAt = new Date().toISOString();
    a.updatedAt = new Date().toISOString();

    ArtistStudioStore.setState(state);
    renderList();
    AnnouncementUI?.render?.();
  }

  function seedDemo() {
    ArtistStudioStore.seedDemo();
    populateArtists();
    renderList();
    AnnouncementUI?.render?.();
  }

  function exportJson() {
    const data = ArtistStudioStore.getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "announcements_export.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  function importJson(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.announcements)) {
          alert("Format JSON tidak valid.");
          return;
        }
        Storage.save(parsed);
        populateArtists();
        renderList();
        AnnouncementUI?.render?.();
        alert("Import berhasil.");
      } catch {
        alert("Gagal import JSON.");
      }
    };
    reader.readAsText(file);
  }

  return {
    init,
    renderList,
    setStatus,
    openComposer,
    closeComposer,
    saveComposer,
    deleteFromComposer,
    quickPublish,
    seedDemo,
    exportJson,
    importJson
  };
})();
