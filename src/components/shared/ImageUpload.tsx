'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  bucket?: string;
  maxSizeMB?: number;
  label?: string;
  error?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function ImageUpload({
  value,
  onChange,
  bucket = 'vinyl-covers',
  maxSizeMB = 5,
  label = 'Cover Art',
  error,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, WebP, or AVIF image';
    }
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemove = () => {
    onChange(undefined);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || uploadError;

  return (
    <div className="space-y-2">
      {label && (
        <label className="input-label block">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="sr-only"
        aria-label={label}
      />

      {value ? (
        // Preview state
        <div className="relative group">
          <div className="relative aspect-square w-full max-w-[200px] rounded-lg overflow-hidden border border-steel-600 bg-steel-800">
            <Image
              src={value}
              alt="Cover art preview"
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
          <div className="absolute inset-0 max-w-[200px] bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="px-3 py-1.5 bg-steel-700 hover:bg-steel-600 text-steel-200 text-sm rounded transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-100 text-sm rounded transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        // Upload zone
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative aspect-square w-full max-w-[200px] rounded-lg border-2 border-dashed
            transition-colors cursor-pointer
            flex flex-col items-center justify-center gap-2
            ${isDragOver
              ? 'border-brass-500 bg-brass-500/10'
              : 'border-steel-600 hover:border-steel-500 bg-steel-800/50 hover:bg-steel-800'
            }
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          aria-label="Upload cover art"
        >
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-2 border-brass-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-steel-400">Uploading...</span>
            </>
          ) : (
            <>
              <svg
                className={`w-10 h-10 ${isDragOver ? 'text-brass-500' : 'text-steel-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-steel-400 text-center px-2">
                {isDragOver ? 'Drop image here' : 'Click or drag to upload'}
              </span>
              <span className="text-xs text-steel-500">
                JPG, PNG, WebP • Max {maxSizeMB}MB
              </span>
            </>
          )}
        </div>
      )}

      {displayError && (
        <p className="text-sm text-red-400" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
