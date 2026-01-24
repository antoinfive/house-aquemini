-- Migration: Simplify wishlist_items table
-- Add new fields for Discogs integration, keep old columns for backwards compatibility

-- Add new columns to wishlist_items
ALTER TABLE wishlist_items
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS discogs_id TEXT;

-- Create index for year (commonly filtered)
CREATE INDEX IF NOT EXISTS idx_wishlist_year ON wishlist_items(year);

-- Note: Old columns (priority, tags, category) are kept in the database
-- but are no longer used by the application. They can be dropped later
-- if desired with:
-- ALTER TABLE wishlist_items DROP COLUMN priority;
-- ALTER TABLE wishlist_items DROP COLUMN tags;
-- ALTER TABLE wishlist_items DROP COLUMN category;
-- DROP INDEX IF EXISTS idx_wishlist_priority;
-- DROP INDEX IF EXISTS idx_wishlist_tags;
