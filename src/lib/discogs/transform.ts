import type { DiscogsRelease, DiscogsSearchResult } from './types';
import type { VinylFormData, Track } from '@/lib/types';

// Format mapping from Discogs to our format options
const FORMAT_MAP: Record<string, string> = {
  'LP': 'LP',
  'Album': 'LP',
  '12"': '12"',
  '7"': '7"',
  '10"': '10"',
  '2xLP': '2xLP',
  '3xLP': '3xLP',
  'Box Set': 'Box Set',
  'EP': '12"',
  'Single': '7"',
};

// Clean artist name (remove numbering like "(2)" for disambiguation)
function cleanArtistName(name: string): string {
  return name.replace(/\s*\(\d+\)$/, '').trim();
}

// Get primary format from Discogs formats array
function getPrimaryFormat(formats: DiscogsRelease['formats']): string | undefined {
  if (!formats || formats.length === 0) return undefined;

  const primary = formats[0];

  // Check for multi-disc first
  const qty = parseInt(primary.qty, 10);
  if (qty >= 2 && primary.name === 'Vinyl') {
    return `${qty}xLP`;
  }

  // Check descriptions for specific format info
  if (primary.descriptions) {
    for (const desc of primary.descriptions) {
      if (FORMAT_MAP[desc]) return FORMAT_MAP[desc];
    }
  }

  // Fall back to name mapping
  return FORMAT_MAP[primary.name] || primary.name;
}

// Extract genres and styles (combine and dedupe)
function extractGenres(release: DiscogsRelease): string[] {
  const allGenres = [...(release.genres || []), ...(release.styles || [])];
  // Dedupe and limit to 5
  return [...new Set(allGenres)].slice(0, 5);
}

// Transform tracklist
function transformTracklist(tracklist: DiscogsRelease['tracklist']): Track[] {
  if (!tracklist) return [];

  return tracklist
    .filter((track) => track.type_ === 'track')
    .map((track) => ({
      position: track.position || '',
      title: track.title || '',
      duration: track.duration || '',
    }));
}

// Transform full Discogs release to VinylFormData
export function transformReleaseToVinylForm(release: DiscogsRelease): VinylFormData {
  const artist =
    release.artists?.length > 0
      ? cleanArtistName(release.artists[0].name)
      : release.artists_sort || 'Unknown Artist';

  const label =
    release.labels?.length > 0 ? release.labels[0].name : undefined;

  const catalogNumber =
    release.labels?.length > 0 ? release.labels[0].catno : undefined;

  return {
    artist,
    album: release.title,
    year: release.year || undefined,
    label: label || undefined,
    catalog_number: catalogNumber || undefined,
    country: release.country || undefined,
    format: getPrimaryFormat(release.formats),
    genre: extractGenres(release),
    discogs_id: release.id.toString(),
    tracklist: transformTracklist(release.tracklist),
    // These fields need to be filled by user or processed separately
    cover_art_url: undefined, // Will be set after image proxy
    rpm: undefined,
    pressing_info: undefined,
    sleeve_condition: undefined,
    media_condition: undefined,
    notes: undefined,
    purchase_info: undefined,
  };
}

// Get the primary cover image URL from a release
export function getPrimaryCoverImageUrl(release: DiscogsRelease): string | null {
  if (!release.images || release.images.length === 0) return null;

  // Prefer primary image
  const primary = release.images.find((img) => img.type === 'primary');
  if (primary) return primary.uri;

  // Fall back to first image
  return release.images[0].uri;
}

// Transform search result for display (lighter weight)
export interface SearchResultDisplay {
  id: number;
  artist: string;
  album: string;
  year: string | null;
  label: string | null;
  catno: string | null;
  format: string | null;
  country: string | null;
  thumb: string;
  coverImage: string;
}

export function transformSearchResult(result: DiscogsSearchResult): SearchResultDisplay {
  // Parse title - Discogs format is "Artist - Album"
  const titleParts = result.title.split(' - ');
  const artist = titleParts.length > 1 ? cleanArtistName(titleParts[0]) : 'Unknown Artist';
  const album = titleParts.length > 1 ? titleParts.slice(1).join(' - ') : result.title;

  return {
    id: result.id,
    artist,
    album,
    year: result.year || null,
    label: result.label?.[0] || null,
    catno: result.catno || null,
    format: result.format?.join(', ') || null,
    country: result.country || null,
    thumb: result.thumb || '',
    coverImage: result.cover_image || '',
  };
}
