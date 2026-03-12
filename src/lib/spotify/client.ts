interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyResolvedData {
  artist: string;
  album: string;
  year?: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.startsWith('your_') || clientSecret.startsWith('your_')) {
    throw new Error('Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return data.access_token;
}

async function spotifyFetch(path: string): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTrack(id: string): Promise<SpotifyResolvedData> {
  const response = await spotifyFetch(`/tracks/${id}`);
  if (!response.ok) {
    throw new Error(`Spotify track fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const artist = data.artists?.[0]?.name ?? 'Unknown Artist';
  const album = data.album?.name ?? data.name;
  const releaseDate = data.album?.release_date;
  const year = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : undefined;

  return { artist, album, year: year && !isNaN(year) ? year : undefined };
}

export async function getAlbum(id: string): Promise<SpotifyResolvedData> {
  const response = await spotifyFetch(`/albums/${id}`);
  if (!response.ok) {
    throw new Error(`Spotify album fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const artist = data.artists?.[0]?.name ?? 'Unknown Artist';
  const album = data.name;
  const releaseDate = data.release_date;
  const year = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : undefined;

  return { artist, album, year: year && !isNaN(year) ? year : undefined };
}
