import { describe, it, expect } from 'vitest';
import type { Vinyl, WishlistItem, NowPlaying } from './index';

describe('Type definitions', () => {
  it('should allow creating a valid Vinyl object', () => {
    const vinyl: Vinyl = {
      id: '123',
      owner_id: 'owner-1',
      artist: 'Miles Davis',
      album: 'Kind of Blue',
      year: 1959,
      label: 'Columbia',
      catalog_number: 'CL 1355',
      pressing_info: 'Original Mono',
      country: 'USA',
      format: 'LP',
      rpm: 33,
      sleeve_condition: 'VG+',
      media_condition: 'NM',
      cover_art_url: 'https://example.com/cover.jpg',
      custom_photos: [],
      audio_clips: [],
      genre: ['Jazz', 'Modal Jazz'],
      notes: 'Classic album',
      purchase_info: null,
      discogs_id: null,
      tracklist: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(vinyl.artist).toBe('Miles Davis');
    expect(vinyl.genre).toContain('Jazz');
  });

  it('should allow creating a valid WishlistItem object', () => {
    const item: WishlistItem = {
      id: '456',
      owner_id: 'owner-1',
      artist: 'John Coltrane',
      album: 'A Love Supreme',
      cover_art_url: null,
      priority: 'high',
      target_price: 150,
      notes: 'Looking for original pressing',
      tags: ['Jazz', 'Spiritual'],
      position: 1,
      category: 'Jazz',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(item.priority).toBe('high');
    expect(item.tags).toHaveLength(2);
  });

  it('should allow creating a valid NowPlaying object', () => {
    const nowPlaying: NowPlaying = {
      id: '789',
      owner_id: 'owner-1',
      source: 'manual',
      vinyl_id: '123',
      spotify_track_name: null,
      spotify_artist_name: null,
      spotify_album_art_url: null,
      updated_at: new Date().toISOString(),
    };

    expect(nowPlaying.source).toBe('manual');
    expect(nowPlaying.vinyl_id).toBe('123');
  });
});
