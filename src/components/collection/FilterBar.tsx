'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import type { VinylFilters } from '@/lib/types';

interface FilterBarProps {
  filters: VinylFilters;
  onFilterByGenre: (genres: string[]) => void;
  onFilterByYearRange: (start?: number, end?: number) => void;
  onClearFilters: () => void;
}

const COMMON_GENRES = [
  'Jazz',
  'Soul',
  'Funk',
  'R&B',
  'Hip-Hop',
  'Electronic',
  'Rock',
  'Pop',
  'Classical',
  'Reggae',
  'Blues',
  'World',
  'Ambient',
  'Experimental',
];

export function FilterBar({
  filters,
  onFilterByGenre,
  onFilterByYearRange,
  onClearFilters,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [yearStart, setYearStart] = useState<string>(filters.yearStart?.toString() || '');
  const [yearEnd, setYearEnd] = useState<string>(filters.yearEnd?.toString() || '');

  const selectedGenres = filters.genre || [];

  const activeFilterCount =
    selectedGenres.length +
    (filters.yearStart ? 1 : 0) +
    (filters.yearEnd ? 1 : 0);

  const handleGenreToggle = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    onFilterByGenre(newGenres);
  };

  const handleYearStartChange = (value: string) => {
    setYearStart(value);
    const start = value ? parseInt(value, 10) : undefined;
    const end = yearEnd ? parseInt(yearEnd, 10) : undefined;
    onFilterByYearRange(start, end);
  };

  const handleYearEndChange = (value: string) => {
    setYearEnd(value);
    const start = yearStart ? parseInt(yearStart, 10) : undefined;
    const end = value ? parseInt(value, 10) : undefined;
    onFilterByYearRange(start, end);
  };

  const handleClearAll = () => {
    setYearStart('');
    setYearEnd('');
    onClearFilters();
  };

  return (
    <div className="bg-steel-800/50 rounded-lg border border-steel-700">
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-steel-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-steel-200 font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-brass-500 text-steel-900 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-steel-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div id="filter-content" className="px-4 pb-4 space-y-4 border-t border-steel-700">
          {/* Genre Filter */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-steel-300 mb-2">
              Genre
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-brass-500 text-steel-900 font-medium'
                      : 'bg-steel-700 text-steel-300 hover:bg-steel-600 border border-steel-600'
                  }`}
                  aria-pressed={selectedGenres.includes(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
            {selectedGenres.length > 0 && (
              <p className="mt-2 text-sm text-steel-400">
                Selected: {selectedGenres.join(', ')}
              </p>
            )}
          </div>

          {/* Year Range Filter */}
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">
              Year Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={yearStart}
                  onChange={(e) => handleYearStartChange(e.target.value)}
                  placeholder="From"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  className="input-industrial w-full px-3 py-2 text-sm focus-ring"
                  aria-label="Start year"
                />
              </div>
              <span className="text-steel-500">to</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={yearEnd}
                  onChange={(e) => handleYearEndChange(e.target.value)}
                  placeholder="To"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  className="input-industrial w-full px-3 py-2 text-sm focus-ring"
                  aria-label="End year"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
