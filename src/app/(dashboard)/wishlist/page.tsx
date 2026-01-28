'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useVinyls } from '@/lib/hooks/useVinyls';
import { WishlistGrid } from '@/components/wishlist/WishlistGrid';
import { WishlistForm } from '@/components/wishlist/WishlistForm';
import { DiscogsSearchModal } from '@/components/discogs/DiscogsSearchModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { WishlistItem, WishlistFormData, VinylFormData } from '@/lib/types';
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
    search,
    clearFilters,
  } = useWishlist();
  const { addVinyl } = useVinyls();

  const [isDiscogsModalOpen, setIsDiscogsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [discogsInitialData, setDiscogsInitialData] = useState<Partial<WishlistFormData> | null>(null);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<WishlistItem | null>(null);
  const [addToCollectionConfirm, setAddToCollectionConfirm] = useState<WishlistItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddClick = () => {
    setEditingItem(null);
    setDiscogsInitialData(null);
    setIsDiscogsModalOpen(true);
  };

  const handleDiscogsSelect = (data: VinylFormData) => {
    // Convert VinylFormData to WishlistFormData
    const wishlistData: Partial<WishlistFormData> = {
      artist: data.artist,
      album: data.album,
      year: data.year,
      label: data.label,
      cover_art_url: data.cover_art_url,
      discogs_id: data.discogs_id,
    };
    setDiscogsInitialData(wishlistData);
    setIsDiscogsModalOpen(false);
    setIsFormOpen(true);
  };

  const handleManualEntry = () => {
    setDiscogsInitialData(null);
    setIsDiscogsModalOpen(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (item: WishlistItem) => {
    setEditingItem(item);
    setDiscogsInitialData(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: WishlistItem) => {
    setDeleteConfirm(item);
  };

  const handleAddToCollectionClick = (item: WishlistItem) => {
    setAddToCollectionConfirm(item);
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
      setDiscogsInitialData(null);
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

  const handleAddToCollectionConfirm = async () => {
    if (!addToCollectionConfirm) return;

    setIsSubmitting(true);
    try {
      let vinylData: VinylFormData;

      // Helper to proxy Discogs image to Supabase Storage
      const proxyImage = async (imageUrl: string, discogsId?: string): Promise<string | null> => {
        try {
          const response = await fetch('/api/discogs/image-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl, discogsId }),
          });
          const data = await response.json();
          return data.data?.url || null;
        } catch {
          return null;
        }
      };

      // If we have a discogs_id, fetch full release data including tracklist
      if (addToCollectionConfirm.discogs_id) {
        const response = await fetch(`/api/discogs/release/${addToCollectionConfirm.discogs_id}`);
        const result = await response.json();

        if (response.ok && result.data?.vinyl) {
          // Proxy the cover image to Supabase Storage
          let coverArtUrl: string | undefined;
          if (result.data.coverImageUrl) {
            const proxiedUrl = await proxyImage(result.data.coverImageUrl, addToCollectionConfirm.discogs_id);
            coverArtUrl = proxiedUrl || undefined;
          }

          // Use full Discogs data (includes tracklist, genres, etc.)
          vinylData = {
            ...result.data.vinyl,
            cover_art_url: coverArtUrl,
            // Preserve notes from wishlist item
            notes: addToCollectionConfirm.notes || result.data.vinyl.notes,
          };
        } else {
          // Fallback to basic wishlist data if Discogs fetch fails
          vinylData = {
            artist: addToCollectionConfirm.artist,
            album: addToCollectionConfirm.album,
            year: addToCollectionConfirm.year || undefined,
            label: addToCollectionConfirm.label || undefined,
            cover_art_url: addToCollectionConfirm.cover_art_url || undefined,
            discogs_id: addToCollectionConfirm.discogs_id || undefined,
            genre: [],
            notes: addToCollectionConfirm.notes || undefined,
          };
        }
      } else {
        // No discogs_id, use basic wishlist data
        vinylData = {
          artist: addToCollectionConfirm.artist,
          album: addToCollectionConfirm.album,
          year: addToCollectionConfirm.year || undefined,
          label: addToCollectionConfirm.label || undefined,
          cover_art_url: addToCollectionConfirm.cover_art_url || undefined,
          genre: [],
          notes: addToCollectionConfirm.notes || undefined,
        };
      }

      const vinyl = await addVinyl(vinylData);
      if (vinyl) {
        // Auto-delete from wishlist on successful add to collection
        await removeItem(addToCollectionConfirm.id);
        toast.success('Added to collection and removed from wishlist');
        setAddToCollectionConfirm(null);
      }
    } catch {
      toast.error('Failed to add to collection');
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

  const isLoading = authLoading || wishlistLoading;

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
          onAddToCollection={handleAddToCollectionClick}
          emptyMessage={
            isOwner
              ? 'Start building your wishlist by adding records you want to find.'
              : 'No items in the wishlist yet.'
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
          setEditingItem(null);
          setDiscogsInitialData(null);
        }}
        title={editingItem ? 'Edit Wishlist Item' : 'Add to Wishlist'}
        size="lg"
      >
        <WishlistForm
          initialData={editingItem || discogsInitialData || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
            setDiscogsInitialData(null);
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

      {/* Add to Collection Confirmation Modal */}
      <Modal
        isOpen={!!addToCollectionConfirm}
        onClose={() => setAddToCollectionConfirm(null)}
        title="Add to Collection"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-steel-300">
            Add{' '}
            <span className="font-semibold text-steel-100">
              {addToCollectionConfirm?.album}
            </span>{' '}
            by {addToCollectionConfirm?.artist} to your collection?
          </p>
          <p className="text-sm text-steel-400">
            This will remove it from your wishlist.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setAddToCollectionConfirm(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCollectionConfirm}
              isLoading={isSubmitting}
            >
              Add to Collection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
