import { NextRequest, NextResponse } from 'next/server';
import { searchReleases } from '@/lib/discogs/client';
import { transformSearchResult } from '@/lib/discogs/transform';
import type { ApiResponse } from '@/lib/types';
import type { SearchResultDisplay } from '@/lib/discogs/transform';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '20', 10);

  if (!query || query.trim().length === 0) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Search query is required' },
      { status: 400 }
    );
  }

  const { data, error } = await searchReleases(query, page, perPage);

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
