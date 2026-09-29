-- Tessa: additive reference-library migration. No existing application rows are changed.
-- Run the complete file after confirming a recoverable database backup.
-- Safe to rerun against the same schema; do not drop tables to reverse a deployment.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
CREATE TABLE IF NOT EXISTS prelim_references (
 id SERIAL PRIMARY KEY,
 import_key TEXT UNIQUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS prelim_reference_revisions (
 id SERIAL PRIMARY KEY,
 reference_id INTEGER NOT NULL REFERENCES prelim_references(id),
 version INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','retired')),
 content JSONB NOT NULL,
 source_text TEXT NOT NULL,
 created_by TEXT NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 approved_by TEXT,
 approved_at TIMESTAMPTZ,
 UNIQUE(reference_id,version)
);
CREATE UNIQUE INDEX IF NOT EXISTS prelim_one_approved ON prelim_reference_revisions(reference_id) WHERE status='approved';
CREATE UNIQUE INDEX IF NOT EXISTS prelim_one_working ON prelim_reference_revisions(reference_id) WHERE status IN ('draft','pending');
CREATE TABLE IF NOT EXISTS prelim_reference_events (
 id SERIAL PRIMARY KEY,
 revision_id INTEGER NOT NULL REFERENCES prelim_reference_revisions(id),
 action TEXT NOT NULL,
 actor TEXT NOT NULL,
 at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 snapshot JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS prelim_events_revision ON prelim_reference_events(revision_id,id);
COMMIT;
