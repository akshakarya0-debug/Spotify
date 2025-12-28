// minimal HTML escape utility to avoid XSS when inserting user content
const Sanitizer = (() => {
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  return { escapeHtml };
})();

window.Sanitizer = window.Sanitizer || Sanitizer;
