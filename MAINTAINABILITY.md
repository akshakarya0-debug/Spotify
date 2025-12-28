Maintainability notes for Announcement feature

Goal: make code easy to change, test, and safely toggle behavior in production.

What was added

- Adapters pattern: all external concerns live in `assets/js/adapters/*`
  - `CacheAdapter` - local persistence shim (localStorage)
  - `ModerationService` - content scan shim
  - `Telemetry` - metrics shim
  - `Health` - health shim
  - `FeatureFlags` - runtime toggles for features

- Partitioning helpers in `ArtistStudio`:
  - `getAnnouncementsForArtist(artistName)`
  - `saveAnnouncementsForArtist(artistName, announcements)`
  - `fanoutToFollowers(artistName, announcement)` (demo stub)

- Read-state persistence in `modal.js` stored at `readAnnouncementsByArtist_v1` key

How to use feature flags

- Open DevTools Console and toggle flags:

  ```js
  // check all flags
  FeatureFlags.all()

  // disable moderation
  FeatureFlags.setFlag('enableModeration', false)

  // disable telemetry
  FeatureFlags.setFlag('enableTelemetry', false)
  ```

Why this helps NFR-09 (Maintainability)

- Behavior can be toggled at runtime to disable risky subsystems during incidents.
- Adapters isolate external dependencies, making unit-testing and replacement easier.
- Partitioning helpers centralize artist-specific logic for future extraction to backend services.

Next recommended steps

- Add unit tests for adapters and ArtistStudio helpers.
- Add a CI job that runs linting and basic browser tests.
- Replace local shims with real backend services behind the adapters.
