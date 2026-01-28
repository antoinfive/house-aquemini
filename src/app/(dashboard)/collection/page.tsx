'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVinyls } from '@/lib/hooks/useVinyls';
import { VinylGrid } from '@/components/collection/VinylGrid';
import { VinylForm } from '@/components/collection/VinylForm';
import { FilterBar } from '@/components/collection/FilterBar';
import { DiscogsSearchModal } from '@/components/discogs/DiscogsSearchModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Vinyl, VinylFormData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function CollectionPage() {
  const router = useRouter();
  const { isOwner, isLoading: authLoading } = useAuth();
  const {
    vinyls,
    isLoading: vinylsLoading,
    error,
    addVinyl,
    updateVinyl,
    removeVinyl,
    search,
    filterByGenre,
    filterByYearRange,
    clearFilters,
    filters,
  } = useVinyls();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDiscogsModalOpen, setIsDiscogsModalOpen] = useState(false);
  const [editingVinyl, setEditingVinyl] = useState<Vinyl | null>(null);
  const [discogsInitialData, setDiscogsInitialData] = useState<Partial<VinylFormData> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Vinyl | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search with proper cleanup
  useEffect(() => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      search(searchQuery);
    }, 300);

    // Cleanup on unmount or when searchQuery changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]); // Only depend on searchQuery, not search

  const handleAddClick = () => {
    setEditingVinyl(null);
    setDiscogsInitialData(null);
    setIsDiscogsModalOpen(true);
  };

  const handleDiscogsSelect = (data: VinylFormData) => {
    setDiscogsInitialData(data);
    setIsDiscogsModalOpen(false);
    setIsFormOpen(true);
  };

  const handleManualEntry = () => {
    setDiscogsInitialData(null);
    setIsDiscogsModalOpen(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (vinyl: Vinyl) => {
    setEditingVinyl(vinyl);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vinyl: Vinyl) => {
    setDeleteConfirm(vinyl);
  };

  const handleVinylClick = (vinyl: Vinyl) => {
    router.push(`/collection/${vinyl.id}`);
  };

  const handleFormSubmit = async (data: VinylFormData) => {
    setIsSubmitting(true);
    try {
      if (editingVinyl) {
        const result = await updateVinyl(editingVinyl.id, data);
        if (result) {
          toast.success('Vinyl updated successfully');
          setIsFormOpen(false);
          setEditingVinyl(null);
        }
      } else {
        const result = await addVinyl(data);
        if (result) {
          toast.success('Vinyl added to collection');
          setIsFormOpen(false);
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsSubmitting(true);
    try {
      const success = await removeVinyl(deleteConfirm.id);
      if (success) {
        toast.success('Vinyl removed from collection');
        setDeleteConfirm(null);
      }
    } catch {
      toast.error('Failed to delete vinyl');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    search('');
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    clearFilters();
  };

  const isLoading = authLoading || vinylsLoading;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-steel-900/50 border-b border-steel-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-steel-100 tracking-tight">
                Collection
              </h1>
              <p className="mt-1 text-steel-400">
                {vinyls.length} {vinyls.length === 1 ? 'record' : 'records'} in your collection
              </p>
            </div>
            {isOwner && (
              <Button onClick={handleAddClick}>
                <svg
                  className="w-5 h-5 mr-2 -ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Vinyl
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500"
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
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by artist or album..."
                  className="pl-10"
                />
              </div>
            </div>
            {searchQuery && (
              <Button variant="ghost" onClick={handleClearSearch}>
                Clear Search
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4">
            <FilterBar
              filters={filters}
              onFilterByGenre={filterByGenre}
              onFilterByYearRange={filterByYearRange}
              onClearFilters={handleClearAllFilters}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <VinylGrid
          vinyls={vinyls}
          isLoading={isLoading}
          isOwner={isOwner}
          onVinylClick={handleVinylClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          emptyMessage={
            isOwner
              ? 'Start building your collection by adding your first vinyl record.'
              : 'No vinyls in this collection yet.'
          }
        />
      </div>

      {/* Discogs Search Modal */}
      <DiscogsSearchModal
        isOpen={isDiscogsModalOpen}
        onClose={() => setIsDiscogsModalOpen(false)}
        onSelect={handleDiscogsSelect}
        onManualEntry={handleManualEntry}
      />

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVinyl(null);
          setDiscogsInitialData(null);
        }}
        title={editingVinyl ? 'Edit Vinyl' : 'Add New Vinyl'}
        size="xl"
      >
        <VinylForm
          initialData={editingVinyl || discogsInitialData || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingVinyl(null);
            setDiscogsInitialData(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Vinyl"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-steel-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-steel-100">
              {deleteConfirm?.album}
            </span>{' '}
            by {deleteConfirm?.artist}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              isLoading={isSubmitting}
              className="bg-red-600 hover:bg-red-500 border-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
