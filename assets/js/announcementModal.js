const AnnouncementModal = (() => {
  /**
   * ANNOUNCEMENT COMPOSER MODAL
   * Modal untuk artis membuat pengumuman baru di Artist Studio
   * Data akan disimpan di ArtistStudio module
   */
  
  const modal = () => document.getElementById("announcementComposerModal");
  const input = () => document.getElementById("announcementInput");
  const startDate = () => document.getElementById("startDate");
  const endDate = () => document.getElementById("endDate");
  const mode = () => document.getElementById("announcementMode");
  const counter = () => document.getElementById("charCounter");

  /**
   * Buka modal composer
   */
  function open() {
    modal().classList.remove("hidden");
    input().focus();
    updateCounter();
  }

  /**
   * Tutup modal composer
   */
  function close() {
    modal().classList.add("hidden");
    input().value = "";
    startDate().value = "";
    endDate().value = "";
    mode().value = "publish";
    updateCounter();
  }

  /**
   * Update counter karakter
   */
  function updateCounter() {
    counter().textContent = `${input().value.length} / 500`;
  }

  /**
   * Submit pengumuman baru
   * Simpan ke ArtistStudio
   */
  function submit() {
    const text = input().value.trim();
    if (!text) return;

    // Moderation check (toggleable via FeatureFlags)
    const moderationEnabled = window.FeatureFlags ? FeatureFlags.isEnabled('enableModeration') : true;
    const scan = moderationEnabled && window.ModerationService ? ModerationService.scan(text) : { ok: true, suspicious: false };

    const finalMode = scan.suspicious ? 'pending' : mode().value;

    // Tambah announcement ke ArtistStudio
    ArtistStudio.addAnnouncement({
      content: text,
      mode: finalMode,
      startDate: startDate().value || null,
      endDate: endDate().value || null
    });

    if (scan.suspicious) {
      // inform developer console and leave modal closed (studio will show pending)
      console.log('Announcement flagged as pending by ModerationService:', scan.reason);
    }

    close();
  }

  input()?.addEventListener("input", updateCounter);

  return {
    open,
    close,
    submit
  };
})();
