// Re-export supabase clients
export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';

// Database type re-exports for convenience
export type { Profile, Vinyl, WishlistItem, NowPlaying, SpotifyTokens } from '../types';
