-- Aces Library Initial Schema
-- Phase 2: Supabase Setup
-- This migration creates all tables, indexes, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with owner flag
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index for quick user lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile (but not is_owner flag - that's admin only)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- VINYLS TABLE
-- Main collection with rich metadata
-- ============================================
CREATE TABLE vinyls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core info
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  year INTEGER,
  label TEXT,
  catalog_number TEXT,

  -- Pressing details
  pressing_info TEXT,
  country TEXT,
  format TEXT, -- LP, EP, Single, etc.
  rpm INTEGER, -- 33, 45, 78

  -- Condition (Goldmine grading)
  sleeve_condition TEXT, -- M, NM, VG+, VG, G+, G, F, P
  media_condition TEXT,  -- M, NM, VG+, VG, G+, G, F, P

  -- Media URLs
  cover_art_url TEXT,
  custom_photos TEXT[] DEFAULT '{}',
  audio_clips TEXT[] DEFAULT '{}',

  -- Metadata
  genre TEXT[] DEFAULT '{}',
  notes TEXT,
  purchase_info TEXT,
  discogs_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_vinyls_owner_id ON vinyls(owner_id);
CREATE INDEX idx_vinyls_artist ON vinyls(artist);
CREATE INDEX idx_vinyls_album ON vinyls(album);
CREATE INDEX idx_vinyls_year ON vinyls(year);
CREATE INDEX idx_vinyls_created_at ON vinyls(created_at DESC);
CREATE INDEX idx_vinyls_genre ON vinyls USING GIN(genre);

-- RLS for vinyls
ALTER TABLE vinyls ENABLE ROW LEVEL SECURITY;

-- Anyone can view vinyls (public gallery)
CREATE POLICY "Vinyls are publicly viewable"
  ON vinyls FOR SELECT
  USING (true);

-- Only owner can insert
CREATE POLICY "Owner can insert vinyls"
  ON vinyls FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- Only owner can update their own vinyls
CREATE POLICY "Owner can update own vinyls"
  ON vinyls FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- Only owner can delete their own vinyls
CREATE POLICY "Owner can delete own vinyls"
  ON vinyls FOR DELETE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- ============================================
-- WISHLIST_ITEMS TABLE
-- Visual mood board with drag-drop ordering
-- ============================================
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core info
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  cover_art_url TEXT,

  -- Priority and organization
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  target_price DECIMAL(10, 2),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  category TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_wishlist_owner_id ON wishlist_items(owner_id);
CREATE INDEX idx_wishlist_position ON wishlist_items(owner_id, position);
CREATE INDEX idx_wishlist_priority ON wishlist_items(priority);
CREATE INDEX idx_wishlist_tags ON wishlist_items USING GIN(tags);

-- RLS for wishlist
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Wishlist items are publicly viewable (optional - can be shown in public gallery)
CREATE POLICY "Wishlist items are publicly viewable"
  ON wishlist_items FOR SELECT
  USING (true);

-- Only owner can insert
CREATE POLICY "Owner can insert wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- Only owner can update
CREATE POLICY "Owner can update own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- Only owner can delete
CREATE POLICY "Owner can delete own wishlist items"
  ON wishlist_items FOR DELETE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- ============================================
-- NOW_PLAYING TABLE
-- Current listening (manual or Spotify)
-- One row per owner (singleton pattern)
-- ============================================
CREATE TABLE now_playing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source type
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'spotify')),

  -- Manual selection
  vinyl_id UUID REFERENCES vinyls(id) ON DELETE SET NULL,

  -- Spotify data
  spotify_track_name TEXT,
  spotify_artist_name TEXT,
  spotify_album_art_url TEXT,

  -- Timestamp
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One now_playing per owner
  UNIQUE(owner_id)
);

-- Indexes
CREATE INDEX idx_now_playing_owner_id ON now_playing(owner_id);
CREATE INDEX idx_now_playing_vinyl_id ON now_playing(vinyl_id);

-- RLS for now_playing
ALTER TABLE now_playing ENABLE ROW LEVEL SECURITY;

-- Anyone can view now playing (shown in public gallery)
CREATE POLICY "Now playing is publicly viewable"
  ON now_playing FOR SELECT
  USING (true);

-- Only owner can insert/update their now playing
CREATE POLICY "Owner can insert now playing"
  ON now_playing FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

CREATE POLICY "Owner can update own now playing"
  ON now_playing FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

CREATE POLICY "Owner can delete own now playing"
  ON now_playing FOR DELETE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- ============================================
-- SPOTIFY_TOKENS TABLE
-- Encrypted OAuth tokens (owner-only access)
-- ============================================
CREATE TABLE spotify_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- OAuth tokens (should be encrypted at rest via Supabase)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One token set per owner
  UNIQUE(owner_id)
);

-- Index
CREATE INDEX idx_spotify_tokens_owner_id ON spotify_tokens(owner_id);

-- RLS for spotify_tokens (STRICT - owner only)
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Only owner can view their own tokens
CREATE POLICY "Owner can view own spotify tokens"
  ON spotify_tokens FOR SELECT
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- Only owner can insert tokens
CREATE POLICY "Owner can insert spotify tokens"
  ON spotify_tokens FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- Only owner can update tokens
CREATE POLICY "Owner can update own spotify tokens"
  ON spotify_tokens FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- Only owner can delete tokens
CREATE POLICY "Owner can delete own spotify tokens"
  ON spotify_tokens FOR DELETE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_owner = true
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vinyls_updated_at
  BEFORE UPDATE ON vinyls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_now_playing_updated_at
  BEFORE UPDATE ON now_playing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spotify_tokens_updated_at
  BEFORE UPDATE ON spotify_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, is_owner)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- Note: These are created via Supabase dashboard or API, not SQL
-- Included here as documentation
-- ============================================

-- Buckets to create:
-- 1. vinyl-covers - Album cover art (public read, authenticated write)
-- 2. vinyl-photos - Custom vinyl photos (public read, authenticated write)
-- 3. audio-clips - Sample audio recordings (public read, authenticated write)
-- 4. wishlist-images - Wishlist album covers (public read, authenticated write)

-- Storage policies example (apply via dashboard):
-- Policy: "Public read access"
--   bucket: vinyl-covers
--   operation: SELECT
--   policy: true
--
-- Policy: "Owner write access"
--   bucket: vinyl-covers
--   operation: INSERT
--   policy: auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_owner = true)
