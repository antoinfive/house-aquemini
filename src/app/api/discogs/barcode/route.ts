import { NextRequest, NextResponse } from 'next/server';
import { searchByBarcode } from '@/lib/discogs/client';
import { transformSearchResult } from '@/lib/discogs/transform';
import type { ApiResponse } from '@/lib/types';
import type { SearchResultDisplay } from '@/lib/discogs/transform';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get('barcode');

  if (!barcode || barcode.trim().length === 0) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Barcode is required' },
      { status: 400 }
    );
  }

  // Validate barcode format (should be numeric, typically 12-13 digits for UPC/EAN)
  const cleanBarcode = barcode.replace(/[^0-9]/g, '');
  if (cleanBarcode.length < 8 || cleanBarcode.length > 14) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Invalid barcode format' },
      { status: 400 }
    );
  }

  const { data, error } = await searchByBarcode(cleanBarcode);

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'No response from Discogs' },
      { status: 500 }
    );
  }

  // Transform results for display
  const results = data.results.map(transformSearchResult);

  return NextResponse.json<
    ApiResponse<{
      results: SearchResultDisplay[];
      pagination: {
        page: number;
        pages: number;
        total: number;
      };
    }>
  >({
    data: {
      results,
      pagination: {
        page: data.pagination.page,
        pages: data.pagination.pages,
        total: data.pagination.items,
      },
    },
    error: null,
  });
}
