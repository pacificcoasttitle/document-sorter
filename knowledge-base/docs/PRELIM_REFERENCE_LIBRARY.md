# Prelim standards — internal reference library

This module helps staff find guidance, wording and a formatting example. It does **not** generate preliminary reports or modify SoftPro. The existing underwriting and SOP workspaces are unchanged.

## What ships

- `/prelim-standards`: full-text search across reference fields; topic/status filters; guidance and formatted wording alongside each other.
- Draft editing with exact-phrase bold emphasis and live preview. Source wording stays preserved separately; paragraph breaks are editable.
- Regular users can read only approved references. Department heads/admins create and edit drafts, submit, and return pending records. Only admins approve or retire.
- A revision of approved guidance leaves the approved version visible until its replacement is approved. Approval retires the prior version atomically.
- Database-backed role checks, optimistic stale-edit checks, per-reference transaction locking, and recorded approval names/dates. Review history and all event snapshots are retained.
- Plain-text copying is available only on approved references. Styling is demonstrated, not injected into SoftPro.

## Activate on the existing Tessa database

Use a backup/staging database first. The module requires the application's existing `users` table, `DATABASE_URL` and a real `JWT_SECRET` matching login. No secrets belong in source control. There is no fallback secret in the new API.

With Node 22.18+ and dependencies installed, run from `knowledge-base`:

```powershell
node scripts/prelim-library.mjs --migrate --apply
node scripts/prelim-library.mjs --codebook "PATH\codebook_data.json" --pilot "PATH\pilot_records.json"
node scripts/prelim-library.mjs --codebook "PATH\codebook_data.json" --pilot "PATH\pilot_records.json" --apply
```

The second command is a read-only validation. Migration creates only three new tables and their indexes. Imports are transactional, idempotent and **draft-only**. Reimport skips existing identifiers; it never overwrites edits or approvals. Keep source input JSON as internal material, not in public assets. The migration and importer inherit normal database connection settings from `DATABASE_URL`; use your organization's TLS configuration.

Prepared local inputs contain **1,393 code-book entries + 8 presentation examples = 1,401 drafts**. Code-book imports intentionally leave applicability/guidance blank and matter type unclassified: source text alone is not approved guidance. Existing code anomalies are preserved with source notes. Pilot examples retain sample transaction details and are explicitly case-specific, not universal templates.

## Rudy's review checklist

1. Confirm the source and its current applicability; the 2017 book is historical input.
2. Set the correct matter type and a useful heading; define when it applies.
3. Supply the answer, required documents and decision steps, as applicable.
4. Review wording separately from presentation. Replace case-specific details with approved placeholders if intended as a reusable template.
5. Set paragraph breaks and exact bold phrases. Keep operative qualifiers and alternatives intact.
6. Submit, review the example, and approve under an authorized admin account.

This release does not make AI-generated legal decisions, validate statutory currency, or automatically approve imported content. Regular staff start in the approved library; an initially empty approved view is expected.

## Verification

```powershell
node --test tests/prelim-reference.test.mjs
npx tsc --noEmit --incremental false
```

Before production: apply the migration to staging, import twice to verify skipped duplicates, log in with staff/head/admin accounts, test submit/return/approve/revise/retire, verify old approved guidance remains readable during revision, and test concurrent stale edits. Database-backed acceptance testing requires the existing application's database and accounts.

### Build verification, September 29, 2026

- TypeScript check passed in an isolated dependency installation (the checkout's existing dependency files were not readable).
- All three pure-logic tests passed.
- The API lifecycle test passed against isolated PostgreSQL-compatible PGlite storage: authentication, reader restrictions, role restrictions, stale edits, submission, approval, immutable pending edits, revision uniqueness, retention of the prior approved version, replacement, history access, and retirement.
- Import dry-run validated all 1,401 records. No production data has been imported or approved.
- Browser smoke test passed: draft filtering, selection, search, exact bold emphasis and live edit preview. Screenshot: `C:\Users\gerar\Downloads\Tessa_Prelim_Standards_Preview.png` (synthetic demonstration).

Optional test dependencies: `@electric-sql/pglite`, `esbuild`, `playwright`. Run `node --test tests/prelim-api.integration.mjs` for the isolated lifecycle test and `node tests/prelim-ui.mjs` against a local Next development server (default port 3127). The UI test uses synthetic content and mocked API responses; it is not a substitute for staging acceptance with real accounts.

Local source inputs used for the validated import:

```text
C:\Users\gerar\.codex\.chatgpt-projects\g-p-696008394cd08191830f88dbe504eb19\tmp\pdfs\pctc-codebook-build\codebook_data.json
C:\Users\gerar\.codex\.chatgpt-projects\g-p-696008394cd08191830f88dbe504eb19\tmp\pdfs\prelim-pilot\pilot_records.json
```
