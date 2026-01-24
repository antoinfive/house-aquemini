'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Vinyl } from '@/lib/types';
import { TracklistDisplay } from './TracklistDisplay';

interface VinylDetailProps {
  vinyl: Vinyl;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetNowPlaying?: () => void;
  onBack?: () => void;
}

export function VinylDetail({
  vinyl,
  isOwner = false,
  onEdit,
  onDelete,
  onSetNowPlaying,
  onBack,
}: VinylDetailProps) {
  const [coverImageError, setCoverImageError] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);

  const hasCustomPhotos = vinyl.custom_photos && vinyl.custom_photos.length > 0;
  const hasAudioClips = vinyl.audio_clips && vinyl.audio_clips.length > 0;

  const handleAudioPlay = (index: number) => {
    setPlayingAudioIndex(index);
  };

  const handleAudioPause = () => {
    setPlayingAudioIndex(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-steel-400 hover:text-steel-200 transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Collection
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Cover Art & Photos */}
        <div className="space-y-6">
          {/* Main Cover Art */}
          <div className="relative aspect-square bg-steel-900 rounded-lg overflow-hidden shadow-2xl">
            {vinyl.cover_art_url && !coverImageError ? (
              <Image
                src={vinyl.cover_art_url}
                alt={`${vinyl.album} cover`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
                onError={() => setCoverImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-32 h-32 text-steel-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>

          {/* Custom Photos Gallery */}
          {hasCustomPhotos && (
            <div>
              <h3 className="text-sm font-medium text-steel-400 mb-3">Photos</h3>
              <div className="grid grid-cols-4 gap-2">
                {vinyl.custom_photos.map((photoUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className="relative aspect-square bg-steel-800 rounded-md overflow-hidden hover:ring-2 hover:ring-brass-500 transition-all"
                  >
                    <Image
                      src={photoUrl}
                      alt={`${vinyl.album} photo ${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio Clips */}
          {hasAudioClips && (
            <div>
              <h3 className="text-sm font-medium text-steel-400 mb-3">Audio Clips</h3>
              <div className="space-y-2">
                {vinyl.audio_clips.map((clipUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-steel-800/50 rounded-lg border border-steel-700"
                  >
                    <button
                      onClick={() => playingAudioIndex === index ? handleAudioPause() : handleAudioPlay(index)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-brass-500 hover:bg-brass-400 rounded-full text-steel-900 transition-colors"
                      aria-label={playingAudioIndex === index ? 'Pause' : 'Play'}
                    >
                      {playingAudioIndex === index ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-steel-200 truncate">Clip {index + 1}</p>
                      <audio
                        src={clipUrl}
                        className="w-full h-8 mt-1"
                        controls
                        onPlay={() => handleAudioPlay(index)}
                        onPause={handleAudioPause}
                        onEnded={handleAudioPause}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Header with Actions */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-steel-100 tracking-tight">
                  {vinyl.album}
                </h1>
                <p className="text-xl text-steel-300 mt-1">{vinyl.artist}</p>
              </div>
              {isOwner && (
                <div className="flex gap-2 flex-shrink-0">
                  {onSetNowPlaying && (
                    <button
                      onClick={onSetNowPlaying}
                      className="p-2.5 bg-brass-500 hover:bg-brass-400 rounded-lg text-steel-900 transition-colors"
                      aria-label="Set as now playing"
                      title="Set as now playing"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="p-2.5 bg-steel-700 hover:bg-steel-600 rounded-lg text-steel-200 transition-colors"
                      aria-label="Edit vinyl"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="p-2.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white transition-colors"
                      aria-label="Delete vinyl"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Genre Tags */}
            {vinyl.genre && vinyl.genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {vinyl.genre.map((g) => (
                  <span
                    key={g}
                    className="genre-tag px-3 py-1 rounded-full text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {vinyl.year && (
              <InfoBlock label="Year" value={vinyl.year.toString()} />
            )}
            {vinyl.format && (
              <InfoBlock label="Format" value={vinyl.format} />
            )}
            {vinyl.rpm && (
              <InfoBlock label="RPM" value={`${vinyl.rpm}`} />
            )}
            {vinyl.label && (
              <InfoBlock label="Label" value={vinyl.label} />
            )}
            {vinyl.catalog_number && (
              <InfoBlock label="Catalog #" value={vinyl.catalog_number} />
            )}
            {vinyl.country && (
              <InfoBlock label="Country" value={vinyl.country} />
            )}
          </div>

          {/* Condition */}
          {(vinyl.media_condition || vinyl.sleeve_condition) && (
            <div className="p-4 bg-steel-800/50 rounded-lg border border-steel-700">
              <h3 className="text-sm font-medium text-steel-400 mb-3">Condition</h3>
              <div className="grid grid-cols-2 gap-4">
                {vinyl.media_condition && (
                  <div>
                    <p className="text-xs text-steel-500 uppercase tracking-wide">Media</p>
                    <p className="text-steel-200 mt-1">{vinyl.media_condition}</p>
                  </div>
                )}
                {vinyl.sleeve_condition && (
                  <div>
                    <p className="text-xs text-steel-500 uppercase tracking-wide">Sleeve</p>
                    <p className="text-steel-200 mt-1">{vinyl.sleeve_condition}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pressing Info */}
          {vinyl.pressing_info && (
            <div className="p-4 bg-steel-800/50 rounded-lg border border-steel-700">
              <h3 className="text-sm font-medium text-steel-400 mb-2">Pressing Info</h3>
              <p className="text-steel-200 whitespace-pre-wrap">{vinyl.pressing_info}</p>
            </div>
          )}

          {/* Tracklist */}
          {vinyl.tracklist && vinyl.tracklist.length > 0 && (
            <TracklistDisplay
              tracklist={vinyl.tracklist}
              collapsible={true}
              defaultExpanded={true}
            />
          )}

          {/* Notes */}
          {vinyl.notes && (
            <div className="p-4 bg-steel-800/50 rounded-lg border border-steel-700">
              <h3 className="text-sm font-medium text-steel-400 mb-2">Notes</h3>
              <p className="text-steel-200 whitespace-pre-wrap">{vinyl.notes}</p>
            </div>
          )}

          {/* Purchase Info */}
          {vinyl.purchase_info && (
            <div className="p-4 bg-steel-800/50 rounded-lg border border-steel-700">
              <h3 className="text-sm font-medium text-steel-400 mb-2">Purchase Info</h3>
              <p className="text-steel-200 whitespace-pre-wrap">{vinyl.purchase_info}</p>
            </div>
          )}

          {/* Discogs Link */}
          {vinyl.discogs_id && (
            <a
              href={`https://www.discogs.com/release/${vinyl.discogs_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brass-400 hover:text-brass-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.824a9.176 9.176 0 110 18.352 9.176 9.176 0 010-18.352zm0 3.353a5.824 5.824 0 100 11.647 5.824 5.824 0 000-11.647zm0 2.824a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
              View on Discogs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-steel-800 text-xs text-steel-500">
            <p>Added: {new Date(vinyl.created_at).toLocaleDateString()}</p>
            {vinyl.updated_at !== vinyl.created_at && (
              <p>Last updated: {new Date(vinyl.updated_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhotoIndex !== null && hasCustomPhotos && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedPhotoIndex(null)}
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation buttons */}
          {selectedPhotoIndex > 0 && (
            <button
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex(selectedPhotoIndex - 1);
              }}
              aria-label="Previous photo"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {selectedPhotoIndex < vinyl.custom_photos.length - 1 && (
            <button
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex(selectedPhotoIndex + 1);
              }}
              aria-label="Next photo"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="relative max-w-4xl max-h-[80vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={vinyl.custom_photos[selectedPhotoIndex]}
              alt={`${vinyl.album} photo ${selectedPhotoIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selectedPhotoIndex + 1} / {vinyl.custom_photos.length}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-steel-800/30 rounded-lg">
      <p className="text-xs text-steel-500 uppercase tracking-wide">{label}</p>
      <p className="text-steel-200 mt-1 font-medium truncate">{value}</p>
    </div>
  );
}
