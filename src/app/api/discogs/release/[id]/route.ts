import { NextRequest, NextResponse } from 'next/server';
import { getRelease } from '@/lib/discogs/client';
import {
  transformReleaseToVinylForm,
  getPrimaryCoverImageUrl,
} from '@/lib/discogs/transform';
import type { ApiResponse, VinylFormData } from '@/lib/types';

interface ReleaseResponse {
  vinyl: VinylFormData;
  coverImageUrl: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const releaseId = parseInt(id, 10);

  if (isNaN(releaseId) || releaseId <= 0) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Invalid release ID' },
      { status: 400 }
    );
  }

  const { data, error } = await getRelease(releaseId);

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Release not found' },
      { status: 404 }
    );
  }

  // Transform to vinyl form data
  const vinyl = transformReleaseToVinylForm(data);
  const coverImageUrl = getPrimaryCoverImageUrl(data);

  return NextResponse.json<ApiResponse<ReleaseResponse>>({
    data: {
      vinyl,
      coverImageUrl,
    },
    error: null,
  });
}
