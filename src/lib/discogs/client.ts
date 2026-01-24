import type {
  DiscogsSearchResponse,
  DiscogsRelease,
  DiscogsRateLimit,
  DiscogsError,
} from './types';

const DISCOGS_API_BASE = 'https://api.discogs.com';
const USER_AGENT = 'AcesLibrary/1.0';

// Rate limit tracking
let rateLimitInfo: DiscogsRateLimit | null = null;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

function getAuthHeaders(): HeadersInit {
  const token = process.env.DISCOGS_PERSONAL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('DISCOGS_PERSONAL_ACCESS_TOKEN environment variable is not set');
  }

  return {
    'User-Agent': USER_AGENT,
    'Authorization': `Discogs token=${token}`,
    'Accept': 'application/json',
  };
}

function parseRateLimitHeaders(headers: Headers): DiscogsRateLimit {
  return {
    limit: parseInt(headers.get('X-Discogs-Ratelimit') || '60', 10),
    used: parseInt(headers.get('X-Discogs-Ratelimit-Used') || '0', 10),
    remaining: parseInt(headers.get('X-Discogs-Ratelimit-Remaining') || '60', 10),
  };
}

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  // Ensure minimum interval between requests
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  // If we're near the rate limit, wait longer
  if (rateLimitInfo && rateLimitInfo.remaining < 5) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function fetchDiscogs<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; rateLimit: DiscogsRateLimit | null }> {
  await waitForRateLimit();

  const url = `${DISCOGS_API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    lastRequestTime = Date.now();
    rateLimitInfo = parseRateLimitHeaders(response.headers);

    if (response.status === 429) {
      // Rate limited - return error
      return {
        data: null,
        error: 'Rate limit exceeded. Please try again later.',
        rateLimit: rateLimitInfo,
      };
    }

    if (!response.ok) {
      const errorBody = (await response.json()) as DiscogsError;
      return {
        data: null,
        error: errorBody.message || `Discogs API error: ${response.status}`,
        rateLimit: rateLimitInfo,
      };
    }

    const data = (await response.json()) as T;
    return { data, error: null, rateLimit: rateLimitInfo };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: message, rateLimit: rateLimitInfo };
  }
}

// Search releases by query (album/artist)
export async function searchReleases(
  query: string,
  page = 1,
  perPage = 20
): Promise<{ data: DiscogsSearchResponse | null; error: string | null }> {
  const params = new URLSearchParams({
    q: query,
    type: 'release',
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const result = await fetchDiscogs<DiscogsSearchResponse>(
    `/database/search?${params.toString()}`
  );

  return { data: result.data, error: result.error };
}

// Search by barcode (UPC/EAN)
export async function searchByBarcode(
  barcode: string
): Promise<{ data: DiscogsSearchResponse | null; error: string | null }> {
  const params = new URLSearchParams({
    barcode: barcode.replace(/[^0-9]/g, ''), // Clean barcode
    type: 'release',
  });

  const result = await fetchDiscogs<DiscogsSearchResponse>(
    `/database/search?${params.toString()}`
  );

  return { data: result.data, error: result.error };
}

// Get full release details by ID
export async function getRelease(
  releaseId: number
): Promise<{ data: DiscogsRelease | null; error: string | null }> {
  const result = await fetchDiscogs<DiscogsRelease>(`/releases/${releaseId}`);
  return { data: result.data, error: result.error };
}

// Get current rate limit info
export function getRateLimitInfo(): DiscogsRateLimit | null {
  return rateLimitInfo;
}
