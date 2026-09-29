# Code-book source-wording approval

## Approval scope

The project owner authorized publication of the 1,393 code-book imports as **Approved source wording**, not as reviewed guidance or formatting. The eight presentation pilots and all SOPs are excluded. No source text or content fields are rewritten.

`source_approved` is distinct from `approved`. The latter continues to require completed scenario, guidance, matter type and formatting notes, submission, and administrator approval. Source approval does not certify that historical wording is current law or applicable to a particular file.

## Reader workflow

The default Published library includes both statuses, with explicit labels. A source-only result provides original wording and a **Copy source wording** action. Its display is not described as an approved formatting example. Search summaries separately count approved guidance, source wording and reviewer-only draft matches. Ordinary readers cannot access unpublished drafts.

A reviewer can create a draft revision from source-approved wording while the source version remains visible. Only a completed, normally approved revision supersedes that version. Administrators may retire source-approved records. The one-published-version index covers both approval scopes.

## Controlled bulk operation

`scripts/approve-codebook-source.mjs` defaults to read-only dry run. Apply requires an explicit actor, a backup directory and an unchanged dry-run digest. It requires exactly 1,393 `codebook-2017:` imports, one unchanged initial draft each, original wording and only the original import event. Other states fail closed. A second run after successful completion is a no-op.

The before-state JSON includes parents, revisions and events. The database migration, status changes and 1,393 `approve_source_wording` audit events are committed together. Attribution identifies project-owner authorization via Codex, explicitly source-only; it does not impersonate an application reviewer.

The migration file `002_source_wording_approval.sql` alone changes the allowed status and publication uniqueness; it does not approve content. Existing records and pilots are preserved. Apply the corresponding application release before expecting the new views in the live interface. Older releases do not expose this status to normal readers.

## Validation

Production verification after the owner-authorized operation on September 29, 2026: 1,393 code-book revisions are `source_approved`, eight presentation pilots remain `draft`, and exactly 1,393 `approve_source_wording` events exist. A rerun detected completion and changed zero records. Before-state backup: `C:\Users\gerar\Desktop\document-sorter-backups\codebook-source-approval-2026-09-29\codebook-before-source-approval-1790718873055.json`.

Isolated database tests verify migration reruns, reader visibility, draft exclusion, immutability, incomplete-guidance submission rejection, and correct supersession by a fully reviewed revision. Browser tests verify source-only search, labels, copy controls and absence of reviewer actions for readers. No tests approve live guidance.

## Recovery

Keep the before-state backup private. Prefer an audited retirement if a source should no longer be available. Do not drop the new constraint/index while source-approved records exist. Any restoration must compare current versions and audit events first so later human edits are not overwritten.
