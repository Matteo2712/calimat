---
name: learnings
description: Hard-won CaliMat lessons — TWA signing, Supabase offline-first, algorithm philosophy, training protocols, scope decisions
---

## Platform & sync

- TWA address bar removal requires the `assetlinks.json` fingerprint to exactly match the signing keystore used for the APK. Always reuse the original `signing.keystore` and update `assetlinks.json` on each rebuild.
- Conflict markers in `assetlinks.json` (from Git merges) are a common failure point for TWA verification.
- Supabase offline-first requirements: client-side `crypto.randomUUID()` for IDs rather than server-generated, soft-delete awareness for offline deletions, `updated_at` triggers, explicit RLS policies, and a conflict resolution strategy declared upfront.
- The `deleteRowVerified()` pattern is essential to distinguish "already deleted" from "blocked by RLS/stale token" — without it, offline sync hits infinite retry loops.

## Algorithm philosophy

- Matteo explicitly wants to avoid fixed arbitrary weights and hardcoded thresholds. When pragmatic compromises are made (as in v7.0), they should be declared consciously rather than embedded silently.

## Training domain knowledge

- Static hold training: 30-second total TUT target with descending variation — start at the hardest sustainable position and regress as needed within the set. Established as the standard protocol for planche, front lever, handstand, and human flag.
- Muscle-up progressions: band-assisted work and explosive pull-up variations are preferred over the generic "pull-up + dip" approach. Matteo corrects theoretically-derived progressions from direct experience.

## Scope decisions (tried and moved on from)

- Simplicity over features is the governing principle.
- Circuit mode (automated sequential execution) was evaluated and consciously rejected.
- MammApp as a separate application was replaced by shared Supabase credentials plus WhatsApp reminders.
