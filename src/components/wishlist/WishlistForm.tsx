'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/shared';
import type { WishlistFormData, WishlistItem } from '@/lib/types';

interface WishlistFormProps {
  initialData?: Partial<WishlistItem>;
  onSubmit: (data: WishlistFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WishlistForm({ initialData, onSubmit, onCancel, isLoading = false }: WishlistFormProps) {
  const [formData, setFormData] = useState<WishlistFormData>({
    artist: initialData?.artist || '',
    album: initialData?.album || '',
    year: initialData?.year || undefined,
    label: initialData?.label || undefined,
    cover_art_url: initialData?.cover_art_url || undefined,
    target_price: initialData?.target_price || undefined,
    notes: initialData?.notes || undefined,
    discogs_id: initialData?.discogs_id || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : name === 'target_price' ? parseFloat(value) : parseInt(value, 10),
    }));
  };

  const handleCoverArtChange = (url: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      cover_art_url: url,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist is required';
    }
    if (!formData.album.trim()) {
      newErrors.album = 'Album is required';
    }
    if (formData.target_price !== undefined && formData.target_price < 0) {
      newErrors.target_price = 'Price cannot be negative';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Art Upload */}
      <div className="space-y-4">
        <h3 className="input-label">Cover Art</h3>
        <ImageUpload
          value={formData.cover_art_url}
          onChange={handleCoverArtChange}
          bucket="vinyl-covers"
          maxSizeMB={5}
          label=""
        />
      </div>

      {/* Album Info */}
      <div className="space-y-4">
        <h3 className="input-label">Album Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Artist *"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            error={errors.artist}
            placeholder="e.g., D'Angelo"
            required
          />
          <Input
            label="Album *"
            name="album"
            value={formData.album}
            onChange={handleChange}
            error={errors.album}
            placeholder="e.g., Voodoo"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Year"
            name="year"
            type="number"
            value={formData.year || ''}
            onChange={handleNumberChange}
            error={errors.year}
            placeholder="e.g., 2000"
            min={1900}
            max={new Date().getFullYear() + 1}
          />
          <Input
            label="Label"
            name="label"
            value={formData.label || ''}
            onChange={handleChange}
            placeholder="e.g., Virgin Records"
          />
        </div>
      </div>

      {/* Target Price */}
      <div className="space-y-4">
        <h3 className="input-label">Target Price</h3>
        <div className="max-w-xs">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400">$</span>
            <Input
              name="target_price"
              type="number"
              value={formData.target_price || ''}
              onChange={handleNumberChange}
              error={errors.target_price}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="pl-7"
            />
          </div>
          <p className="text-sm text-steel-500 mt-1">
            Optional: Set a target price you&apos;re willing to pay
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="input-label">Notes</h3>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={3}
          className="input-industrial w-full px-4 py-2.5 focus-ring resize-none"
          placeholder="Any notes about this item (where to find it, condition requirements, etc.)..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-steel-700">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData?.id ? 'Save Changes' : 'Add to Wishlist'}
        </Button>
      </div>
    </form>
  );
}
