'use client';

import { useState } from 'react';
import { useAuth, useWishlist } from '@/lib/hooks';
import { WishlistGrid, WishlistForm } from '@/components/wishlist';
import { Button, Modal } from '@/components/ui';
import type { WishlistItem, WishlistFormData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { isOwner, isLoading: authLoading } = useAuth();
  const {
    items,
    isLoading: wishlistLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    filterByPriority,
    clearFilters,
    filters,
  } = useWishlist();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<WishlistItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClick = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (item: WishlistItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: WishlistItem) => {
    setDeleteConfirm(item);
  };

  const handleFormSubmit = async (data: WishlistFormData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const result = await updateItem(editingItem.id, data);
        if (result) {
          toast.success('Item updated successfully');
          setIsFormOpen(false);
          setEditingItem(null);
        }
      } else {
        const result = await addItem(data);
        if (result) {
          toast.success('Item added to wishlist');
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
      const success = await removeItem(deleteConfirm.id);
      if (success) {
        toast.success('Item removed from wishlist');
        setDeleteConfirm(null);
      }
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriorityFilter = (priority: 'high' | 'medium' | 'low' | null) => {
    if (priority === null) {
      clearFilters();
    } else {
      filterByPriority(priority);
    }
  };

  const isLoading = authLoading || wishlistLoading;

  // Count items by priority
  const priorityCounts = items.reduce(
    (acc, item) => {
      acc[item.priority]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-steel-900/50 border-b border-steel-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-steel-100 tracking-tight">
                Wishlist
              </h1>
              <p className="mt-1 text-steel-400">
                {items.length} {items.length === 1 ? 'item' : 'items'} on your wishlist
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
                Add Item
              </Button>
            )}
          </div>

          {/* Priority Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => handlePriorityFilter(null)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                !filters.priority
                  ? 'bg-brass-500 text-steel-900'
                  : 'bg-steel-700 text-steel-300 hover:bg-steel-600'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => handlePriorityFilter('high')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                filters.priority === 'high'
                  ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                  : 'bg-steel-700 text-steel-300 hover:bg-steel-600'
              }`}
            >
              High ({priorityCounts.high})
            </button>
            <button
              onClick={() => handlePriorityFilter('medium')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                filters.priority === 'medium'
                  ? 'bg-brass-500/30 text-brass-400 border border-brass-500/50'
                  : 'bg-steel-700 text-steel-300 hover:bg-steel-600'
              }`}
            >
              Medium ({priorityCounts.medium})
            </button>
            <button
              onClick={() => handlePriorityFilter('low')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                filters.priority === 'low'
                  ? 'bg-steel-500/30 text-steel-400 border border-steel-500/50'
                  : 'bg-steel-700 text-steel-300 hover:bg-steel-600'
              }`}
            >
              Low ({priorityCounts.low})
            </button>
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

        <WishlistGrid
          items={items}
          isLoading={isLoading}
          isOwner={isOwner}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          emptyMessage={
            isOwner
              ? 'Start building your wishlist by adding records you want to find.'
              : 'No items in the wishlist yet.'
          }
        />
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Wishlist Item' : 'Add to Wishlist'}
        size="lg"
      >
        <WishlistForm
          initialData={editingItem || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Remove from Wishlist"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-steel-300">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-steel-100">
              {deleteConfirm?.album}
            </span>{' '}
            by {deleteConfirm?.artist} from your wishlist?
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
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
