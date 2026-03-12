export interface ParsedSpotifyLink {
  type: 'track' | 'album';
  id: string;
}

/**
 * Parse a Spotify URL or URI into its type and ID.
 * Handles:
 * - https://open.spotify.com/track/xxx?si=...
 * - https://open.spotify.com/album/xxx?si=...
 * - spotify:track:xxx
 * - spotify:album:xxx
 */
export function parseSpotifyUrl(input: string): ParsedSpotifyLink | null {
  const trimmed = input.trim();

  // Spotify URI format: spotify:track:xxx or spotify:album:xxx
  const uriMatch = trimmed.match(/^spotify:(track|album):([a-zA-Z0-9]+)$/);
  if (uriMatch) {
    return { type: uriMatch[1] as 'track' | 'album', id: uriMatch[2] };
  }

  // Spotify web URL format
  try {
    const url = new URL(trimmed);
    if (url.hostname !== 'open.spotify.com') return null;

    const pathMatch = url.pathname.match(/^\/(track|album)\/([a-zA-Z0-9]+)/);
    if (pathMatch) {
      return { type: pathMatch[1] as 'track' | 'album', id: pathMatch[2] };
    }
  } catch {
    // Not a valid URL
  }

  return null;
}
