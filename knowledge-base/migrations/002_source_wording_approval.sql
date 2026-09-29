-- Add source-only publication. Does not approve any content by itself.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE prelim_reference_revisions DROP CONSTRAINT IF EXISTS prelim_reference_revisions_status_check;
ALTER TABLE prelim_reference_revisions ADD CONSTRAINT prelim_reference_revisions_status_check
 CHECK(status IN ('draft','pending','source_approved','approved','retired'));
-- One published version per reference, regardless of approval scope.
CREATE UNIQUE INDEX IF NOT EXISTS prelim_one_published ON prelim_reference_revisions(reference_id)
 WHERE status IN ('source_approved','approved');
COMMIT;
