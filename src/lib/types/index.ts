// Database types - will be generated from Supabase later
// For now, define the core interfaces

// Track information from Discogs
export interface Track {
  position: string;
  title: string;
  duration: string;
}

export interface Profile {
  id: string;
  user_id: string;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vinyl {
  id: string;
  owner_id: string;
  artist: string;
  album: string;
  year: number | null;
  label: string | null;
  catalog_number: string | null;
  pressing_info: string | null;
  country: string | null;
  format: string | null;
  rpm: number | null;
  sleeve_condition: string | null;
  media_condition: string | null;
  cover_art_url: string | null;
  custom_photos: string[];
  audio_clips: string[];
  genre: string[];
  notes: string | null;
  purchase_info: string | null;
  discogs_id: string | null;
  tracklist: Track[] | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  owner_id: string;
  artist: string;
  album: string;
  year: number | null;
  label: string | null;
  cover_art_url: string | null;
  target_price: number | null;
  notes: string | null;
  position: number;
  discogs_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NowPlaying {
  id: string;
  owner_id: string;
  source: 'manual' | 'spotify';
  vinyl_id: string | null;
  spotify_track_name: string | null;
  spotify_artist_name: string | null;
  spotify_album_art_url: string | null;
  updated_at: string;
}

export interface SpotifyTokens {
  id: string;
  owner_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form types
export interface VinylFormData {
  artist: string;
  album: string;
  year?: number;
  label?: string;
  catalog_number?: string;
  pressing_info?: string;
  country?: string;
  format?: string;
  rpm?: number;
  sleeve_condition?: string;
  media_condition?: string;
  cover_art_url?: string;
  genre: string[];
  notes?: string;
  purchase_info?: string;
  discogs_id?: string;
  tracklist?: Track[];
}

export interface WishlistFormData {
  artist: string;
  album: string;
  year?: number;
  label?: string;
  cover_art_url?: string;
  target_price?: number;
  notes?: string;
  discogs_id?: string;
}

// Filter types
export interface VinylFilters {
  search?: string;
  genre?: string[];
  yearStart?: number;
  yearEnd?: number;
}

export interface WishlistFilters {
  search?: string;
}
