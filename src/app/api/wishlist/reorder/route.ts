import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

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
      { data: null, error: 'Only the owner can reorder wishlist items' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const items: { id: string; position: number }[] = body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Items array is required' },
      { status: 400 }
    );
  }

  // Update all positions in a single batch using Promise.all
  const updates = items.map(({ id, position }) =>
    supabase
      .from('wishlist_items')
      .update({ position })
      .eq('id', id)
      .eq('owner_id', user.id)
  );

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);

  if (hasError) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to update some positions' },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<{ updated: number }>>({
    data: { updated: items.length },
    error: null,
  });
}
