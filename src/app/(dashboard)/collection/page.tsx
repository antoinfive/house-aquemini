'use client';

import { useState, useCallback } from 'react';
import { useAuth, useVinyls } from '@/lib/hooks';
import { VinylGrid, VinylForm } from '@/components/collection';
import { Button, Input, Modal } from '@/components/ui';
import type { Vinyl, VinylFormData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function CollectionPage() {
  const { isOwner, isLoading: authLoading } = useAuth();
  const {
    vinyls,
    isLoading: vinylsLoading,
    error,
    addVinyl,
    updateVinyl,
    removeVinyl,
    search,
    clearFilters,
    filters,
  } = useVinyls();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVinyl, setEditingVinyl] = useState<Vinyl | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Vinyl | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddClick = () => {
    setEditingVinyl(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vinyl: Vinyl) => {
    setEditingVinyl(vinyl);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vinyl: Vinyl) => {
    setDeleteConfirm(vinyl);
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

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      // Debounce search
      const timeoutId = setTimeout(() => {
        search(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [search]
  );

  const handleClearSearch = () => {
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
                My Collection
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
            {(searchQuery || filters.search) && (
              <Button variant="ghost" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
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
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          emptyMessage={
            isOwner
              ? 'Start building your collection by adding your first vinyl record.'
              : 'No vinyls in this collection yet.'
          }
        />
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVinyl(null);
        }}
        title={editingVinyl ? 'Edit Vinyl' : 'Add New Vinyl'}
        size="xl"
      >
        <VinylForm
          initialData={editingVinyl || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingVinyl(null);
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
