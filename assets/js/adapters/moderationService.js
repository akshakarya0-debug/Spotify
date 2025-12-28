const ModerationService = (() => {
  // Minimal ModerationService: detect external links and suspicious patterns.
  function containsExternalLink(text) {
    if (!text) return false;
    // naive check for http(s) or www.
    const re = /https?:\/\/|www\./i;
    return re.test(text);
  }

  function scan(text) {
    const hasLink = containsExternalLink(text);
    return {
      ok: !hasLink,
      suspicious: hasLink,
      reason: hasLink ? 'contains_external_link' : null
    };
  }

  return { scan, containsExternalLink };
})();

window.ModerationService = window.ModerationService || ModerationService;
