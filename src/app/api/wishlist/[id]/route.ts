import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { WishlistItem, WishlistFormData, ApiResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }

  return NextResponse.json<ApiResponse<WishlistItem>>({ data, error: null });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      { data: null, error: 'Only the owner can edit wishlist items' },
      { status: 403 }
    );
  }

  // Parse request body
  const body: Partial<WishlistFormData> & { position?: number } = await request.json();

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {};
  if (body.artist !== undefined) updateData.artist = body.artist;
  if (body.album !== undefined) updateData.album = body.album;
  if (body.year !== undefined) updateData.year = body.year || null;
  if (body.label !== undefined) updateData.label = body.label || null;
  if (body.cover_art_url !== undefined) updateData.cover_art_url = body.cover_art_url || null;
  if (body.target_price !== undefined) updateData.target_price = body.target_price || null;
  if (body.notes !== undefined) updateData.notes = body.notes || null;
  if (body.discogs_id !== undefined) updateData.discogs_id = body.discogs_id || null;
  if (body.position !== undefined) updateData.position = body.position;

  const { data, error } = await supabase
    .from('wishlist_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }

  return NextResponse.json<ApiResponse<WishlistItem>>({ data, error: null });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      { data: null, error: 'Only the owner can delete wishlist items' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<{ deleted: true }>>({ data: { deleted: true }, error: null });
}
