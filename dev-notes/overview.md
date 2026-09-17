---
name: overview
description: CaliMat — purpose, architecture, stack, current feature state, and what's next
aliases: [CaliMat, calimat, github.com/Matteo2712/calimat]
---

## Purpose & context

- Matteo is an Italian self-taught developer with a PHP/procedural background.
- CaliMat is a personal calisthenics workout tracking PWA that Matteo uses himself and shares with friends.
- CaliMat is his primary ongoing project and doubles as a learning vehicle for modern web development.
- Matteo is an active calisthenics practitioner working on advanced skills (planche, front lever, handstand, muscle-ups, human flag), so he brings direct training experience to product decisions.

## Stack & infrastructure

- Vanilla JS, no build step, no framework; entire app lives in a single `index.html` (~3000 lines) plus `sw.js`.
- Backend: Supabase — auth (email/password) plus PostgreSQL with RLS. Tables: `workouts`, `sessions`, `profiles`, `gruppi`.
- Deployment: Cloudflare Pages, automatic deploy on push.
- Version control: GitHub (`github.com/Matteo2712/calimat`) + GitKraken (visual Git client, used for all Git operations).
- Android distribution: PWABuilder as a TWA, package `io.github.matteo2712.twa`.
- Hardware: GEOID HS500 BLE chest strap (standard GATT Heart Rate Service, UUID `0x180D`); primary device is Android mobile.
- Naming conventions (canonical): Supabase constants are `SUPABASE_URL` and `SUPABASE_KEY`; the service worker file is always `sw.js`, never `service-worker.js`.

## Project documentation

- `CLAUDE.md` — project context document for AI-assisted workflows: architecture, state machine, storage keys, gotchas, function index.
- `spiegazione-codice.txt` — beginner's guide in Italian comparing JS patterns to PHP.
- Matteo maintains a separate reference document (drawn from CaliMat lessons) standardizing stack choices, naming conventions, and patterns for future projects.

## Current state (v1.7 in production — re-verify before relying on this)

- Gruppi system: workout cards assignable to named groups, with multi-select modal, Supabase sync, and group-based filtering across Schede/Storico/Stats pages.
- BLE heart rate integration: GEOID HS500 chest strap via Web Bluetooth, per-exercise HR aggregation (pre/max/end), interactive canvas chart with pinch-to-zoom/pan, watchdog for stale signal, reconnect loop.
- Offline sync queue: `cm_pending_sync` in localStorage, `flushPendingSync` with auth token refresh, `deleteRowVerified()` to prevent infinite retry loops.
- Per-set effort logging: 1Hz HR sampling, RIR (dynamic) and FIR (static/isometric) metrics stored per set, CSV export with `;` separator.
- Session UX: context-sensitive "Termina esercizio" / "Skip Pausa" (jumps to 4s remaining), history stack with back button, Android hardware back-button double-tap-to-exit, session state persistence/recovery after OS kill.
- `hrSamples` compression: delta-encoded parallel arrays (~74–77% size reduction) applied at Supabase write/read.
- Open issue: Skip Pausa countdown behavior was still not fully correct at the end of one session; Matteo opted to re-explain from scratch in a new chat rather than continue debugging.

## On the horizon (as of last session — re-verify)

- Skill progression database: awaiting Matteo's custom step definitions — he prefers to write these himself based on his own training methodology; standard progressions were rejected.
- Session/scheda export as a shareable image with logo.
- Capacitor wrapper for a proper native Android app — identified as the right approach because it preserves the HTML/JS workflow.
- `?mode=semplice` flag: potential simplified UI variant for a family member who uses the app with their own Supabase login. Full remote monitoring and push notifications were evaluated and deliberately dropped in favor of shared-credential simplicity.
- Algorithmic scoring system at design stage: a Bayesian hierarchical filter as the core engine (mirroring Garmin/Firstbeat/Coros architecture), fed by scientifically validated features (TRIMP, HRR, signature matching against personal best), with changepoint detection as a diagnostic layer.
- Issues identified in the evaluated v7.0 algorithm document: fixed weights contradicting the stated philosophy, division instability in the corrective factor formula, and single-session calibration treated as a fixed parameter.
- Reusable LLM prompt for scientific guidance on quantifying neuromuscular/neural effort from HR data — bpm-and-time-only, explicitly excluding cardiovascular/metabolic metrics.
