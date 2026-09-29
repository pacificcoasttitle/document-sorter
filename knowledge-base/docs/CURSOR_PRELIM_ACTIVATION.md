# Cursor handoff: activate Prelim standards

The app is hosted at https://document-sorter.vercel.app/ and uses its existing Render PostgreSQL database. This is an additive library, not a SoftPro integration or a new application database.

## Before running

1. Pull the latest `main` without discarding local changes.
2. Use the existing database settings securely. Never echo connection strings, passwords, JWT secrets or API keys. Rotate the previously shared database password and update Vercel's `DATABASE_URL` before production use.
3. Confirm the intended database and a usable backup/recovery point. Do not recreate users, departments, workspaces or other existing tables.

## Apply the migration

Run the **entire** `knowledge-base/migrations/001_prelim_references.sql` file on the existing database. It is transactional and creates only the library's three tables and indexes. It contains no seed data, credentials, deletes or changes to existing application records.

Alternatively, from `knowledge-base` with Node 22.18+ and `DATABASE_URL` already set in the process environment:

```powershell
node scripts/prelim-library.mjs --migrate --apply
```

If credentials are held in a local, git-ignored `.env.local`, Node can load them without printing them:

```powershell
node --env-file=.env.local scripts/prelim-library.mjs --migrate --apply
```

Use the organization's validated TLS connection settings. If connection or migration fails, stop and report a sanitized error; do not disable certificate verification as a workaround. No Anthropic calls are needed for migration or import.

## Verify schema

```sql
SELECT to_regclass('public.prelim_references') AS references_table,
       to_regclass('public.prelim_reference_revisions') AS revisions_table,
       to_regclass('public.prelim_reference_events') AS events_table;
SELECT status, count(*) FROM prelim_reference_revisions GROUP BY status;
```

The second query is empty before the initial import. The feature can deploy before this migration, but will display a setup message until it is applied.

## Import the source material separately

Local input paths are listed in `docs/PRELIM_REFERENCE_LIBRARY.md`. They are internal source material, intentionally not committed to GitHub. If using another machine, transfer those two JSON files privately first.

```powershell
node scripts/prelim-library.mjs --codebook "PATH\codebook_data.json" --pilot "PATH\pilot_records.json"
node scripts/prelim-library.mjs --codebook "PATH\codebook_data.json" --pilot "PATH\pilot_records.json" --apply
```

Add `--env-file=.env.local` before the script name if needed. Validate the dry run reports **1,401 drafts** (1,393 code-book entries and eight pilot examples) before importing. An import rerun skips existing records rather than overwriting them. Nothing is automatically approved.

## Acceptance

- Confirm Vercel deployed the intended commit successfully; Git push alone is not deployment confirmation.
- Sign in normally, then open `/prelim-standards`.
- An existing admin can select Draft and review imports; do not grant new roles without authorization.
- Staff see only approved records. An empty approved list is expected initially.
- Test a draft's submit/return/approve flow with the user. Confirm exact wording, bold phrases, source and history. The pilot includes case-specific names/amounts; do not publish those as generic templates without review.
- Report migration outcome, import counts and deployment status. Do not report secrets.

For rollback, revert the feature deployment; preserve its tables and audit history. Do not drop data.
