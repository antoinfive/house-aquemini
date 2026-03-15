/**
 * Maps genre names to warm-palette tinted background/text classes.
 * Uses a Map cache for O(1) repeated lookups.
 */

interface GenreColorSet {
  bg: string;
  text: string;
  border: string;
}

const genreColorCache = new Map<string, GenreColorSet>();

const DEFAULT_COLORS: GenreColorSet = { bg: 'bg-steel-700/50', text: 'text-steel-300', border: 'border-steel-600' };

function computeGenreColors(normalized: string): GenreColorSet {
  if (normalized === 'jazz') {
    return { bg: 'bg-amber-400/15', text: 'text-amber-300', border: 'border-amber-400/30' };
  }
  if (['soul', 'funk', 'r&b'].includes(normalized)) {
    return { bg: 'bg-terracotta-400/15', text: 'text-terracotta-400', border: 'border-terracotta-400/30' };
  }
  if (normalized === 'hip-hop' || normalized === 'hip hop') {
    return { bg: 'bg-orange-400/15', text: 'text-orange-300', border: 'border-orange-400/30' };
  }
  if (normalized === 'electronic') {
    return { bg: 'bg-sky-400/15', text: 'text-sky-300', border: 'border-sky-400/30' };
  }
  if (normalized === 'rock') {
    return { bg: 'bg-red-400/15', text: 'text-red-300', border: 'border-red-400/30' };
  }
  if (normalized === 'reggae') {
    return { bg: 'bg-green-400/15', text: 'text-green-300', border: 'border-green-400/30' };
  }
  if (normalized === 'blues') {
    return { bg: 'bg-indigo-400/15', text: 'text-indigo-300', border: 'border-indigo-400/30' };
  }
  if (normalized === 'classical') {
    return { bg: 'bg-violet-400/15', text: 'text-violet-300', border: 'border-violet-400/30' };
  }
  if (normalized === 'pop') {
    return { bg: 'bg-pink-400/15', text: 'text-pink-300', border: 'border-pink-400/30' };
  }

  return DEFAULT_COLORS;
}

export function getGenreColors(genre: string): GenreColorSet {
  const normalized = genre.toLowerCase();
  const cached = genreColorCache.get(normalized);
  if (cached) return cached;

  const colors = computeGenreColors(normalized);
  genreColorCache.set(normalized, colors);
  return colors;
}
