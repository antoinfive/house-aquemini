import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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
      { data: null, error: 'Only the owner can upload images' },
      { status: 403 }
    );
  }

  // Parse request body
  const body = await request.json();
  const { imageUrl, discogsId } = body;

  if (!imageUrl) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Image URL is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch image from Discogs
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'AcesLibrary/1.0',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Failed to fetch image from Discogs' },
        { status: 500 }
      );
    }

    // Get content type and ensure it's an image
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Get the image as a buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Determine file extension
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = extMap[contentType] || 'jpg';

    // Generate unique filename
    const timestamp = Date.now();
    const filename = discogsId
      ? `discogs-${discogsId}-${timestamp}.${ext}`
      : `discogs-${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vinyl-covers')
      .upload(filename, imageBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('vinyl-covers').getPublicUrl(uploadData.path);

    return NextResponse.json<ApiResponse<{ url: string }>>({
      data: { url: publicUrl },
      error: null,
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
