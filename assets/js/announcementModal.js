const AnnouncementModal = (() => {
  const modal = () => document.getElementById("announcementModal");
  const input = () => document.getElementById("announcementInput");
  const startDate = () => document.getElementById("startDate");
  const endDate = () => document.getElementById("endDate");
  const mode = () => document.getElementById("announcementMode");
  const counter = () => document.getElementById("charCounter");

  function open() {
    modal().classList.remove("hidden");
    input().focus();
    updateCounter();
  }

  function close() {
    modal().classList.add("hidden");
    input().value = "";
    startDate().value = "";
    endDate().value = "";
    mode().value = "publish";
    updateCounter();
  }

  function updateCounter() {
    counter().textContent = `${input().value.length} / 500`;
  }

  function submit() {
    const text = input().value.trim();
    if (!text) return;

    ArtistStudio.addAnnouncement({
      content: text,
      mode: mode().value,
      startDate: startDate().value || null,
      endDate: endDate().value || null
    });

    close();
  }

  input()?.addEventListener("input", updateCounter);

  return {
    open,
    close,
    submit
  };
})();
