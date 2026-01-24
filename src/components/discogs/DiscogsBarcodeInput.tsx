'use client';

import { useState, useRef, useEffect } from 'react';
import { Input, Button } from '@/components/ui';

interface DiscogsBarcodeInputProps {
  onSearch: (barcode: string) => void;
  isLoading?: boolean;
}

export function DiscogsBarcodeInput({
  onSearch,
  isLoading = false,
}: DiscogsBarcodeInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const newValue = e.target.value.replace(/[^0-9]/g, '');
    setValue(newValue);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) {
      setError('Please enter a barcode');
      return;
    }

    if (value.length < 8 || value.length > 14) {
      setError('Barcode should be 8-14 digits (UPC/EAN format)');
      return;
    }

    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
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
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h2M4 12v8h2m6-8v8m6-8v8h2M4 4h16"
              />
            </svg>
          </div>
          <Input
            ref={inputRef}
            value={value}
            onChange={handleChange}
            placeholder="Enter UPC or EAN barcode..."
            className="pl-10 pr-10"
            maxLength={14}
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-steel-400 hover:text-steel-200 transition-colors"
              aria-label="Clear barcode"
            >
              <svg
                className="w-4 h-4"
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
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        <p className="mt-1 text-xs text-steel-500">
          Enter the barcode number from the vinyl sleeve or insert
        </p>
      </div>

      <Button type="submit" isLoading={isLoading} disabled={!value.trim()}>
        Search Barcode
      </Button>
    </form>
  );
}
