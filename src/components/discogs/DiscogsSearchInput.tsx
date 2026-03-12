'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { parseSpotifyUrl } from '@/lib/spotify/parseUrl';

interface DiscogsSearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function DiscogsSearchInput({
  onSearch,
  isLoading = false,
  placeholder = 'Search by artist, album, or paste a Spotify link...',
}: DiscogsSearchInputProps) {
  const [value, setValue] = useState('');
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const resolveSpotifyLink = async (url: string) => {
    setIsResolvingLink(true);
    setResolveError(null);
    try {
      const response = await fetch(
        `/api/spotify/resolve?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.data) {
        const { artist, album } = data.data;
        const query = `${artist} ${album}`;
        setValue(query);
        onSearch(query);
        return;
      }

      // Resolution returned an error — show it, don't search Discogs with raw URL
      setResolveError(data.error || 'Could not resolve Spotify link');
    } catch {
      setResolveError('Failed to resolve Spotify link');
    } finally {
      setIsResolvingLink(false);
    }
  };

  const looksLikeUrl = (text: string) =>
    text.startsWith('https://') || text.startsWith('http://') || text.startsWith('spotify:');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setResolveError(null);

    // If it looks like a URL/URI, don't fire Discogs search
    if (looksLikeUrl(newValue)) {
      // Only resolve if it's a complete, parseable Spotify link
      if (parseSpotifyUrl(newValue)) {
        resolveSpotifyLink(newValue);
      }
      // Otherwise wait for more input — don't search Discogs with a partial URL
      return;
    }

    onSearch(newValue);
  };

  const handleClear = () => {
    setValue('');
    setResolveError(null);
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading || isResolvingLink ? (
            <svg
              className={`w-5 h-5 animate-spin ${isResolvingLink ? 'text-green-400' : 'text-brass-400'}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-steel-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
        <Input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-steel-400 hover:text-steel-200 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {isResolvingLink && (
        <p className="mt-1 text-xs text-green-400">Resolving Spotify link...</p>
      )}
      {resolveError && (
        <p className="mt-1 text-xs text-red-400">{resolveError}</p>
      )}
    </div>
  );
}
