'use client';

import { useState } from 'react';
import type { Track } from '@/lib/types';

interface TracklistDisplayProps {
  tracklist: Track[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function TracklistDisplay({
  tracklist,
  collapsible = true,
  defaultExpanded = true,
}: TracklistDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!tracklist || tracklist.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  // Group tracks by side (A, B, C, D) if positions indicate sides
  const hasSides = tracklist.some((t) => /^[A-Z]/.test(t.position));

  return (
    <div className="border border-steel-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={!collapsible}
        className={`
          w-full flex items-center justify-between px-4 py-3
          bg-steel-800/50 text-left
          ${collapsible ? 'cursor-pointer hover:bg-steel-800' : 'cursor-default'}
          transition-colors
        `}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-steel-200">
          <svg
            className="w-4 h-4 text-brass-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          Tracklist
          <span className="text-steel-500 font-normal">
            ({tracklist.length} tracks)
          </span>
        </span>
        {collapsible && (
          <svg
            className={`w-4 h-4 text-steel-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
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
        )}
      </button>

      {/* Track list */}
      {isExpanded && (
        <div className="divide-y divide-steel-800">
          {tracklist.map((track, index) => {
            // Check if this is a new side
            const currentSide = hasSides ? track.position.charAt(0) : null;
            const prevSide =
              hasSides && index > 0
                ? tracklist[index - 1].position.charAt(0)
                : null;
            const isNewSide = hasSides && currentSide !== prevSide;

            return (
              <div key={`${track.position}-${index}`}>
                {/* Side header */}
                {isNewSide && (
                  <div className="px-4 py-1.5 bg-steel-900/50 text-xs font-medium text-steel-500 uppercase tracking-wide">
                    Side {currentSide}
                  </div>
                )}
                {/* Track row */}
                <div className="flex items-center px-4 py-2 text-sm hover:bg-steel-800/30 transition-colors">
                  <span className="w-10 text-steel-500 font-mono text-xs">
                    {track.position || `${index + 1}`}
                  </span>
                  <span className="flex-1 text-steel-200 truncate">
                    {track.title}
                  </span>
                  {track.duration && (
                    <span className="ml-2 text-steel-500 font-mono text-xs">
                      {track.duration}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collapsed hint */}
      {!isExpanded && collapsible && (
        <div className="px-4 py-2 text-xs text-steel-500">
          Click to expand tracklist
        </div>
      )}
    </div>
  );
}
