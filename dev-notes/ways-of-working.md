---
name: ways-of-working
description: How Matteo wants CaliMat work done — communication style, iteration loop, version discipline, edit conventions
---

## Communication

- Matteo communicates in Italian and prefers concise schematic numbered responses.
- He gives direct precise feedback. Verbose or redundant replies are explicitly unwanted.

## Iteration loop

- The working loop: upload current file → describe changes in a numbered list → implement via targeted edits → Node.js syntax validation → deliver updated file → "perfetto" or a precise bug report → repeat.
- `str_replace` targeted edits are preferred over full rewrites; regressions from changes are a key concern.

## Version discipline

- Version numbers increment only on explicit instruction, never automatically.
- Version format is `v1.7` — dot before the number. Matteo has a firm rule here and corrects violations directly.

## Decision & documentation patterns

- Feasibility and tradeoffs are discussed before any code is written; the simplest solution covering actual needs is preferred over building ahead of confirmed requirements.
- Stable anchors: `// ─── NOME ───` code section markers are preferred over absolute line numbers in documentation, since the file grows and line references drift.
