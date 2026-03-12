import { NextRequest, NextResponse } from 'next/server';
import { parseSpotifyUrl } from '@/lib/spotify/parseUrl';
import { getTrack, getAlbum } from '@/lib/spotify/client';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { data: null, error: 'Missing url parameter' },
      { status: 400 }
    );
  }

  const parsed = parseSpotifyUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { data: null, error: 'Invalid Spotify URL' },
      { status: 400 }
    );
  }

  try {
    const data =
      parsed.type === 'track'
        ? await getTrack(parsed.id)
        : await getAlbum(parsed.id);

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to resolve Spotify link';
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
