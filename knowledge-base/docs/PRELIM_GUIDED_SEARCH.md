# Guided discovery for Prelim help

- Six question shortcuts translate common tasks into library keywords.
- The search dropdown shows up to six matching stored references with their status and version. Arrow keys, Enter, Escape and pointer selection work.
- Exact codes rank first, then title/phrase matches, then keyword matches. Basic aliases cover taxes/installments, bold/emphasis and owner/vesting. This is deterministic keyword search, not semantic AI or generated advice.
- Multi-tag topics can be filtered individually. Results show 50 at a time with a load-more button.
- Approved remains the default. An empty approved library explains that review is required and gives authorized reviewers a direct route to drafts or pilot examples. No draft is automatically published or exposed to ordinary readers.
- Primary views are Approved answers, Draft review and Awaiting approval. Retired/all-version views remain under More views.
- Mobile selection scrolls to the chosen reference. The initial detail panel explains the three-step lookup flow.
- Navigation now separates Title guidance and Procedures and selects their existing workspaces directly. Help explains which section to use. All API access checks and approval rules remain unchanged; no migration is needed.

Checks: `node --test tests/reference-search.test.mjs`; local browser fixtures in `tests/prelim-ui.mjs` and `tests/shared-ui.mjs`. Source records and secrets are not part of test data.
