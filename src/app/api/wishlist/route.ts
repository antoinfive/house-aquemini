import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { WishlistItem, WishlistFormData, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Parse query params for filtering
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');

  let query = supabase
    .from('wishlist_items')
    .select('*')
    .order('artist', { ascending: true });

  // Apply search filter (artist or album)
  if (search) {
    query = query.or(`artist.ilike.%${search}%,album.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<WishlistItem[]>>({ data, error: null });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user is owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_owner')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_owner) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Only the owner can add wishlist items' },
      { status: 403 }
    );
  }

  // Parse request body
  const body: WishlistFormData = await request.json();

  // Validate required fields
  if (!body.artist || !body.album) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Artist and album are required' },
      { status: 400 }
    );
  }

  // Get the highest position to add new item at the end
  const { data: lastItem } = await supabase
    .from('wishlist_items')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = lastItem ? lastItem.position + 1 : 0;

  // Insert wishlist item
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      owner_id: user.id,
      artist: body.artist,
      album: body.album,
      year: body.year || null,
      label: body.label || null,
      cover_art_url: body.cover_art_url || null,
      target_price: body.target_price || null,
      notes: body.notes || null,
      discogs_id: body.discogs_id || null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<WishlistItem>>({ data, error: null }, { status: 201 });
}
