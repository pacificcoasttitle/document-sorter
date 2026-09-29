# Tessa workflow audit — September 29, 2026

**Subsequent owner-authorized change:** The code-book imports were later published as `source_approved`, a separate source-wording-only status. The counts below document the original audit, not the current publication state. See `SOURCE_WORDING_APPROVAL.md`. No guidance or formatting was approved by that operation.

## Scope and evidence

Traced navigation, workspace hydration, reference search, imported content, source saving, SOP reading and approval transitions. Inspected application code and performed an aggregate-only production database audit in a read-only transaction with verified TLS. No production records, statuses, credentials or schema were changed by this audit. Local tests use synthetic data only.

## Are all answers approved?

No. At audit time:

| Collection | State | Interpretation |
| --- | --- | --- |
| Prelim references | 1,401 drafts; zero approved | Imported review material, not published answers. |
| Prelim draft content | 1,393 have empty guidance | Mostly source wording requiring human guidance and formatting review. |
| Operations SOPs | 46 pending; one approved | Submission is not approval. The approved record has an approver and approval timestamp. |
| Legacy underwriting entries | 109 marked approved | The database defaults new entries to approved. The inspected schema has no approver provenance fields. This flag cannot prove human approval. |

The old SOP endpoints accepted caller-supplied identity/role. Existing approval metadata alone cannot retrospectively establish that the old action was properly authorized. No old record has been relabeled or certified.

## Root causes and local remedies

1. **Two domains shared the same URL.** Both old library links led to `/` and changed stored workspace state. Refreshes and copied links were ambiguous. Start now offers Title and Operations; `/title/guidance` and `/operations` bind their domain to the URL. Title groups Prelim references and legacy sources rather than mixing them with SOPs.
2. **Workspace initialization preceded sign-in.** Workspace data was fetched once. It now reloads when the authenticated user changes, with a visible recovery state if unavailable.
3. **Question shortcuts searched an empty approved scope without explaining it.** Search now loads the caller-authorized corpus, separates approved results from unapproved matches, and produces a visible result summary on shortcut or Search. Reviewers explicitly opt into draft matches; normal readers cannot retrieve drafts from the reference API. It does not generate answers or promote results.
4. **Source text looked like guidance.** The legacy library and detail view now disclose unverified approval. New source saves explicitly use draft instead of the automatic approved default. Existing entries are preserved.
5. **SOP approval trusted browser claims.** Mutations now verify the signed session and fetch the current role from the database. Owner/admin checks, allowed transitions, row locking, transaction-backed activity logging, and server-derived attribution replace browser-supplied authority.
6. **Editing approved SOPs preserved approval.** Admin revisions now return the procedure to draft and clear approval metadata. Pending procedures cannot change under a reviewer's feet. SOPs do not have revision archives; this does not claim otherwise.
7. **Library requests duplicated and could race.** Removed duplicate fetches; the newest request controls the visible result. Fetch failures show an explicit retry action instead of quietly looking like no matches.

## Intended reader journey

- Start → **Title** → **Prelim wording & formatting** → question/search → approved reference → wording, formatting, source and approval context.
- If no approved reference exists, say so. A reviewer may inspect the matching draft separately. An ordinary reader should contact the title lead, not rely on unpublished text.
- Start → **Title** → **Underwriting source library** → research-only legacy source with a visible approval warning.
- Start → **Operations** → approved SOPs by default. Reviewers can filter drafts/pending. Create → draft → submit → admin approval. Admin revision of approved content → draft → review again.

## Required editorial work (not automated)

Rudy/designated reviewers must select useful pilot references, supply missing guidance and formatting, verify source wording/applicability, and use the existing submit/approve process. This is what creates useful approved search results. Do not bulk approve the code book to populate the screen. Review the 46 pending SOPs separately from title reference content.

## Limits and follow-up

- This is a targeted workflow repair, not a full application security certification. Legacy source editing/deletion and other older API routes still need a separate authorization audit.
- Legacy sources have no trustworthy publication workflow/provenance; they remain clearly labeled research material. Do not advertise them as approved answers.
- SOPs still lack version history and a return-for-revision action. Pending SOPs cannot be edited in this change; an admin review is required. A future revision workflow should preserve approved versions instead of overwriting them.
- No migration is required for these changes; existing columns support them.
- Local fixes are not production changes until committed, pushed and successfully deployed.

## Verification

Synthetic browser checks cover suggested-question results, unapproved-result disclosure, autocomplete keyboard selection, zero-match states, draft formatting preview, stable Operations routing after reload with conflicting stored workspace, desktop sections and mobile width. Isolated database tests cover reference publication rules and SOP role spoofing, ownership, pending immutability, approval provenance, reapproval rejection and approved-to-draft revision. No test approves live material.

Passed locally: all five automated search/database tests, both browser test scripts, TypeScript checks and targeted lint. Existing unrelated local edits were preserved. Screenshots contain synthetic demonstration data, not production answers.
