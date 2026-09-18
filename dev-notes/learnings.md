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

## UI/UX — session flow

- Problema: RIR (reps in riserva) veniva chiesto anche quando le reps pulite erano già sotto il target del set — scala 0/3+ non ha senso quando si è già andati a cedimento prima del previsto. Soluzione: campo RIR nascosto dinamicamente quando l'input reps pulite scende sotto il target del set corrente.
- Problema: a fine esercizio non c'era un riscontro automatico su reps totali fatte vs dovute sull'intero esercizio (solo serie fatte/target). Soluzione: somma di `rep_pulite` su tutte le serie loggate confrontata con `serie×reps` target, con avviso "Non completato: X/Y reps" nella schermata di fine esercizio (solo esercizi dinamici).
- Problema: la scala FIR (0-3) a fine set isometrico non riportava il significato dei valori, difficile da ricordare durante la sessione. Soluzione: etichette esplicative sotto i pulsanti nell'overlay FIR (3=forma perfetta, 2=cedimento solo nell'ultimo istante, 1=forma persa ma sotto-figura tenuta, 0=crollo totale).
- Problema: nel countdown, i beep dei soli ultimi 3 secondi non davano un preavviso sufficiente per prepararsi. Soluzione: beep singolo di preavviso configurabile (10/15/20s, default 15s) in Impostazioni, distinto dai beep finali.

## Scope decisions (tried and moved on from)

- Simplicity over features is the governing principle.
- Circuit mode (automated sequential execution) was evaluated and consciously rejected.
- MammApp as a separate application was replaced by shared Supabase credentials plus WhatsApp reminders.
