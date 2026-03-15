import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Vinyl, VinylFormData, ApiResponse, PaginatedResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Parse query params for filtering
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const genres = searchParams.getAll('genre');
  const yearStart = searchParams.get('yearStart');
  const yearEnd = searchParams.get('yearEnd');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('vinyls')
    .select('*', { count: 'exact' })
    .order('artist', { ascending: true });

  // Apply search filter (artist or album)
  if (search) {
    query = query.or(`artist.ilike.%${search}%,album.ilike.%${search}%`);
  }

  // Apply genre filter (overlaps - records with ANY of the selected genres)
  // Include hyphen/space variants so "Hip-Hop" also matches "Hip Hop" in the DB
  if (genres.length > 0) {
    const normalizedGenres = [...new Set(genres.flatMap(g => {
      const variants = [g];
      if (g.includes('-')) variants.push(g.replace(/-/g, ' '));
      if (g.includes(' ')) variants.push(g.replace(/ /g, '-'));
      return variants;
    }))];
    query = query.overlaps('genre', normalizedGenres);
  }

  // Apply year range filter
  if (yearStart) {
    query = query.gte('year', parseInt(yearStart));
  }
  if (yearEnd) {
    query = query.lte('year', parseInt(yearEnd));
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  const total = count ?? 0;
  const page = Math.floor(offset / limit) + 1;

  return NextResponse.json<PaginatedResponse<Vinyl>>({
    data: data || [],
    total,
    page,
    pageSize: limit,
    hasMore: offset + limit < total,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Fetch auth and profile in parallel to avoid waterfall
  const [authResult, profileResult] = await Promise.all([
    supabase.auth.getUser(),
    // Start profile query - will filter by user_id after we have it
    supabase.from('profiles').select('user_id, is_owner'),
  ]);

  const { data: { user }, error: authError } = authResult;

  if (authError || !user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Find the user's profile from the prefetched results
  const profile = profileResult.data?.find((p) => p.user_id === user.id);

  if (!profile?.is_owner) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Only the owner can add vinyls' },
      { status: 403 }
    );
  }

  // Parse request body
  const body: VinylFormData = await request.json();

  // Validate required fields
  if (!body.artist || !body.album) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Artist and album are required' },
      { status: 400 }
    );
  }

  // Insert vinyl
  const { data, error } = await supabase
    .from('vinyls')
    .insert({
      owner_id: user.id,
      artist: body.artist,
      album: body.album,
      release_year: body.release_year || body.year || null,
      year: body.year || null,
      label: body.label || null,
      catalog_number: body.catalog_number || null,
      pressing_info: body.pressing_info || null,
      country: body.country || null,
      format: body.format || null,
      rpm: body.rpm || null,
      sleeve_condition: body.sleeve_condition || null,
      media_condition: body.media_condition || null,
      cover_art_url: body.cover_art_url || null,
      genre: body.genre || [],
      notes: body.notes || null,
      purchase_info: body.purchase_info || null,
      discogs_id: body.discogs_id || null,
      tracklist: body.tracklist || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<Vinyl>>({ data, error: null }, { status: 201 });
}
