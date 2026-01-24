'use client';

import { useState, FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { ImageUpload } from '@/components/shared';
import type { WishlistFormData, WishlistItem } from '@/lib/types';

interface WishlistFormProps {
  initialData?: Partial<WishlistItem>;
  onSubmit: (data: WishlistFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High Priority', color: 'text-red-400' },
  { value: 'medium', label: 'Medium Priority', color: 'text-brass-400' },
  { value: 'low', label: 'Low Priority', color: 'text-steel-400' },
] as const;

const COMMON_TAGS = [
  'Rare',
  'Original Press',
  'Reissue',
  'Limited Edition',
  'Colored Vinyl',
  '180g',
  'Sealed',
  'Import',
  'First Press',
  'Box Set',
];

export function WishlistForm({ initialData, onSubmit, onCancel, isLoading = false }: WishlistFormProps) {
  const [formData, setFormData] = useState<WishlistFormData>({
    artist: initialData?.artist || '',
    album: initialData?.album || '',
    cover_art_url: initialData?.cover_art_url || undefined,
    priority: initialData?.priority || 'medium',
    target_price: initialData?.target_price || undefined,
    notes: initialData?.notes || undefined,
    tags: initialData?.tags || [],
    category: initialData?.category || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customTag, setCustomTag] = useState('');

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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : parseFloat(value),
    }));
  };

  const handlePriorityChange = (priority: 'high' | 'medium' | 'low') => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()],
      }));
      setCustomTag('');
    }
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
          bucket="wishlist-images"
          maxSizeMB={5}
          label=""
        />
      </div>

      {/* Required Fields */}
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
      </div>

      {/* Priority */}
      <div className="space-y-4">
        <h3 className="input-label">Priority Level</h3>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePriorityChange(option.value)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                formData.priority === option.value
                  ? option.value === 'high'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : option.value === 'medium'
                    ? 'bg-brass-500/20 text-brass-400 border border-brass-500/50'
                    : 'bg-steel-500/20 text-steel-400 border border-steel-500/50'
                  : 'bg-steel-700 text-steel-300 hover:bg-steel-600 border border-steel-600'
              }`}
            >
              {option.label}
            </button>
          ))}
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

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="input-label">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                formData.tags.includes(tag)
                  ? 'bg-brass-500 text-steel-900'
                  : 'bg-steel-700 text-steel-300 hover:bg-steel-600 border border-steel-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {/* Custom tag input */}
        <div className="flex gap-2 max-w-xs">
          <Input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            placeholder="Add custom tag..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddCustomTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <p className="text-sm text-steel-400">
            Selected: {formData.tags.join(', ')}
          </p>
        )}
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
