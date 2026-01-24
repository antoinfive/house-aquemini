-- Add tracklist JSONB column to vinyls table
-- Stores array of { position: string, title: string, duration: string }

ALTER TABLE vinyls
ADD COLUMN tracklist JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN vinyls.tracklist IS 'Track listing from Discogs: [{position, title, duration}]';
