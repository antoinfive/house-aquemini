-- Add original release year to vinyls
-- Keeps existing year as the pressing-specific year

ALTER TABLE vinyls
ADD COLUMN IF NOT EXISTS release_year INTEGER;

-- Backfill existing rows so current cards keep showing a year
UPDATE vinyls
SET release_year = year
WHERE release_year IS NULL
  AND year IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vinyls_release_year ON vinyls(release_year);

COMMENT ON COLUMN vinyls.release_year IS 'Original album release year, distinct from the pressing year stored in year';
