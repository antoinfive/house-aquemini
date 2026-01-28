'use client';

import { useState, useCallback, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/shared';
import { TracklistDisplay } from './TracklistDisplay';
import type { VinylFormData, Vinyl } from '@/lib/types';

interface VinylFormProps {
  initialData?: Partial<Vinyl>;
  onSubmit: (data: VinylFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CONDITION_OPTIONS = [
  'Mint (M)',
  'Near Mint (NM)',
  'Very Good Plus (VG+)',
  'Very Good (VG)',
  'Good Plus (G+)',
  'Good (G)',
  'Fair (F)',
  'Poor (P)',
];

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

const FORMAT_OPTIONS = ['LP', '12"', '7"', '10"', '2xLP', '3xLP', 'Box Set'];

const RPM_OPTIONS = [33, 45, 78];

export function VinylForm({ initialData, onSubmit, onCancel, isLoading = false }: VinylFormProps) {
  const [formData, setFormData] = useState<VinylFormData>({
    artist: initialData?.artist || '',
    album: initialData?.album || '',
    year: initialData?.year || undefined,
    label: initialData?.label || undefined,
    catalog_number: initialData?.catalog_number || undefined,
    pressing_info: initialData?.pressing_info || undefined,
    country: initialData?.country || undefined,
    format: initialData?.format || undefined,
    rpm: initialData?.rpm || undefined,
    sleeve_condition: initialData?.sleeve_condition || undefined,
    media_condition: initialData?.media_condition || undefined,
    cover_art_url: initialData?.cover_art_url || undefined,
    genre: initialData?.genre || [],
    notes: initialData?.notes || undefined,
    purchase_info: initialData?.purchase_info || undefined,
    discogs_id: initialData?.discogs_id || undefined,
    tracklist: initialData?.tracklist || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : parseInt(value, 10),
    }));
  };

  const handleGenreToggle = useCallback((genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist is required';
    }
    if (!formData.album.trim()) {
      newErrors.album = 'Album is required';
    }
    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit(formData);
  };

  const handleCoverArtChange = (url: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      cover_art_url: url,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Art Upload */}
      <div className="space-y-4">
        <h3 className="input-label">
          Cover Art
        </h3>
        <ImageUpload
          value={formData.cover_art_url}
          onChange={handleCoverArtChange}
          bucket="vinyl-covers"
          maxSizeMB={5}
          label=""
        />
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="input-label">
          Basic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Artist *"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            error={errors.artist}
            placeholder="e.g., Miles Davis"
            required
          />
          <Input
            label="Album *"
            name="album"
            value={formData.album}
            onChange={handleChange}
            error={errors.album}
            placeholder="e.g., Kind of Blue"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Year"
            name="year"
            type="number"
            value={formData.year || ''}
            onChange={handleNumberChange}
            error={errors.year}
            placeholder="e.g., 1959"
            min={1900}
            max={new Date().getFullYear() + 1}
          />
          <Input
            label="Label"
            name="label"
            value={formData.label || ''}
            onChange={handleChange}
            placeholder="e.g., Columbia"
          />
          <Input
            label="Catalog Number"
            name="catalog_number"
            value={formData.catalog_number || ''}
            onChange={handleChange}
            placeholder="e.g., CS 8163"
          />
        </div>
      </div>

      {/* Format & Pressing */}
      <div className="space-y-4">
        <h3 className="input-label">
          Format & Pressing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label block mb-2">
              Format
            </label>
            <select
              name="format"
              value={formData.format || ''}
              onChange={handleChange}
              className="input-industrial w-full px-4 py-2.5 focus-ring"
            >
              <option value="">Select format</option>
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label block mb-2">
              RPM
            </label>
            <select
              name="rpm"
              value={formData.rpm || ''}
              onChange={handleNumberChange}
              className="input-industrial w-full px-4 py-2.5 focus-ring"
            >
              <option value="">Select RPM</option>
              {RPM_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} RPM
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Country"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            placeholder="e.g., USA"
          />
        </div>
        <Input
          label="Pressing Info"
          name="pressing_info"
          value={formData.pressing_info || ''}
          onChange={handleChange}
          placeholder="e.g., Original pressing, 180g reissue"
        />
      </div>

      {/* Condition */}
      <div className="space-y-4">
        <h3 className="input-label">
          Condition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label block mb-2">
              Media Condition
            </label>
            <select
              name="media_condition"
              value={formData.media_condition || ''}
              onChange={handleChange}
              className="input-industrial w-full px-4 py-2.5 focus-ring"
            >
              <option value="">Select condition</option>
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label block mb-2">
              Sleeve Condition
            </label>
            <select
              name="sleeve_condition"
              value={formData.sleeve_condition || ''}
              onChange={handleChange}
              className="input-industrial w-full px-4 py-2.5 focus-ring"
            >
              <option value="">Select condition</option>
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-4">
        <h3 className="input-label">
          Genres
        </h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreToggle(genre)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                formData.genre.includes(genre)
                  ? 'bg-brass-500 text-steel-900'
                  : 'bg-steel-700 text-steel-300 hover:bg-steel-600 border border-steel-600'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        {formData.genre.length > 0 && (
          <p className="text-sm text-steel-400">
            Selected: {formData.genre.join(', ')}
          </p>
        )}
      </div>

      {/* Tracklist (read-only, from Discogs) */}
      {formData.tracklist && formData.tracklist.length > 0 && (
        <div className="space-y-4">
          <h3 className="input-label">Tracklist</h3>
          <TracklistDisplay tracklist={formData.tracklist} />
          {formData.discogs_id && (
            <p className="text-xs text-steel-500">
              Imported from Discogs (ID: {formData.discogs_id})
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="input-label">
          Additional Info
        </h3>
        <div>
          <label className="input-label block mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="input-industrial w-full px-4 py-2.5 focus-ring resize-none"
            placeholder="Any additional notes about this record..."
          />
        </div>
        <Input
          label="Purchase Info"
          name="purchase_info"
          value={formData.purchase_info || ''}
          onChange={handleChange}
          placeholder="e.g., $25 from Amoeba Records, 2024"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-steel-700">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData?.id ? 'Save Changes' : 'Add to Collection'}
        </Button>
      </div>
    </form>
  );
}
