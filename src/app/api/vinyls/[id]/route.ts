import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Vinyl, VinylFormData, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vinyls')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }

  return NextResponse.json<ApiResponse<Vinyl>>({ data, error: null });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      { data: null, error: 'Only the owner can edit vinyls' },
      { status: 403 }
    );
  }

  // Parse request body
  const body: Partial<VinylFormData> = await request.json();

  // Update vinyl
  const { data, error } = await supabase
    .from('vinyls')
    .update({
      ...(body.artist !== undefined && { artist: body.artist }),
      ...(body.album !== undefined && { album: body.album }),
      ...(body.year !== undefined && { year: body.year }),
      ...(body.label !== undefined && { label: body.label }),
      ...(body.catalog_number !== undefined && { catalog_number: body.catalog_number }),
      ...(body.pressing_info !== undefined && { pressing_info: body.pressing_info }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.format !== undefined && { format: body.format }),
      ...(body.rpm !== undefined && { rpm: body.rpm }),
      ...(body.sleeve_condition !== undefined && { sleeve_condition: body.sleeve_condition }),
      ...(body.media_condition !== undefined && { media_condition: body.media_condition }),
      ...(body.genre !== undefined && { genre: body.genre }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.purchase_info !== undefined && { purchase_info: body.purchase_info }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }

  return NextResponse.json<ApiResponse<Vinyl>>({ data, error: null });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      { data: null, error: 'Only the owner can delete vinyls' },
      { status: 403 }
    );
  }

  // Delete vinyl
  const { error } = await supabase
    .from('vinyls')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<null>>({ data: null, error: null });
}
