'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { DiscogsSearchInput } from './DiscogsSearchInput';
import { DiscogsBarcodeInput } from './DiscogsBarcodeInput';
import { DiscogsResultList } from './DiscogsResultList';
import { useDiscogsSearch } from '@/lib/hooks';
import type { VinylFormData } from '@/lib/types';
import type { SearchResultDisplay } from '@/lib/discogs/transform';

interface DiscogsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: VinylFormData) => void;
  onManualEntry: () => void;
}

type TabType = 'search' | 'barcode';

export function DiscogsSearchModal({
  isOpen,
  onClose,
  onSelect,
  onManualEntry,
}: DiscogsSearchModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const {
    results,
    isLoading,
    error,
    pagination,
    search,
    searchByBarcode,
    loadMore,
    selectRelease,
    proxyImage,
    clearResults,
  } = useDiscogsSearch();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    clearResults();
  };

  const handleResultSelect = async (result: SearchResultDisplay) => {
    setSelectingId(result.id);

    try {
      // Fetch full release details
      const releaseData = await selectRelease(result.id);

      if (!releaseData) {
        setSelectingId(null);
        return;
      }

      let finalCoverUrl: string | undefined;

      // Proxy the cover image if available
      if (releaseData.coverImageUrl) {
        const proxiedUrl = await proxyImage(
          releaseData.coverImageUrl,
          releaseData.vinyl.discogs_id
        );
        if (proxiedUrl) {
          finalCoverUrl = proxiedUrl;
        }
      }

      // Pass the vinyl data with the proxied cover URL
      onSelect({
        ...releaseData.vinyl,
        cover_art_url: finalCoverUrl,
      });
    } finally {
      setSelectingId(null);
    }
  };

  const handleManualClick = () => {
    onManualEntry();
  };

  const handleClose = () => {
    clearResults();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Search Discogs"
      size="lg"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-steel-700">
          <button
            type="button"
            onClick={() => handleTabChange('search')}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              border-b-2 -mb-px
              ${
                activeTab === 'search'
                  ? 'text-brass-400 border-brass-400'
                  : 'text-steel-400 border-transparent hover:text-steel-200'
              }
            `}
          >
            <span className="flex items-center gap-2">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('barcode')}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              border-b-2 -mb-px
              ${
                activeTab === 'barcode'
                  ? 'text-brass-400 border-brass-400'
                  : 'text-steel-400 border-transparent hover:text-steel-200'
              }
            `}
          >
            <span className="flex items-center gap-2">
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
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h2M4 12v8h2m6-8v8m6-8v8h2M4 4h16"
                />
              </svg>
              Barcode
            </span>
          </button>
        </div>

        {/* Search Input or Barcode Input */}
        <div>
          {activeTab === 'search' ? (
            <DiscogsSearchInput onSearch={search} isLoading={isLoading} />
          ) : (
            <DiscogsBarcodeInput onSearch={searchByBarcode} isLoading={isLoading} />
          )}
        </div>

        {/* Results */}
        <DiscogsResultList
          results={results}
          isLoading={isLoading}
          error={error}
          pagination={pagination}
          onSelect={handleResultSelect}
          onLoadMore={loadMore}
          selectingId={selectingId}
          emptyMessage={
            activeTab === 'search'
              ? 'Search for an album or artist to find releases on Discogs.'
              : 'Enter a barcode to search for releases.'
          }
        />

        {/* Manual Entry Link */}
        <div className="pt-2 border-t border-steel-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualClick}
            className="w-full justify-center text-steel-400 hover:text-steel-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Enter Details Manually
          </Button>
        </div>
      </div>
    </Modal>
  );
}
