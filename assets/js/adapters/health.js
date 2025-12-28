const Health = (() => {
  function check() {
    return {
      status: 'ok',
      components: {
        cache: !!window.CacheAdapter,
        moderation: !!window.ModerationService,
        telemetry: !!window.Telemetry
      },
      ts: new Date().toISOString()
    };
  }

  return { check };
})();

window.Health = window.Health || Health;
