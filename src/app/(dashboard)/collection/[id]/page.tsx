'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { VinylDetail, VinylForm } from '@/components/collection';
import { Button, Modal } from '@/components/ui';
import type { Vinyl, VinylFormData, ApiResponse } from '@/lib/types';
import toast from 'react-hot-toast';

interface VinylDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function VinylDetailPage({ params }: VinylDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isOwner, isLoading: authLoading } = useAuth();

  const [vinyl, setVinyl] = useState<Vinyl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vinyl data
  useEffect(() => {
    const fetchVinyl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/vinyls/${id}`);
        const result: ApiResponse<Vinyl> = await response.json();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setVinyl(result.data);
        }
      } catch {
        setError('Failed to load vinyl details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVinyl();
  }, [id]);

  const handleBack = () => {
    router.push('/collection');
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: VinylFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vinyls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Vinyl> = await response.json();

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setVinyl(result.data);
        setIsEditModalOpen(false);
        toast.success('Vinyl updated successfully');
      }
    } catch {
      toast.error('Failed to update vinyl');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vinyls/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Vinyl deleted from collection');
        router.push('/collection');
      }
    } catch {
      toast.error('Failed to delete vinyl');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNowPlaying = async () => {
    try {
      const response = await fetch('/api/now-playing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'manual',
          vinyl_id: id,
        }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Now playing updated');
      }
    } catch {
      toast.error('Failed to set now playing');
    }
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-6 bg-steel-700 rounded w-40 mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cover art skeleton */}
              <div className="aspect-square bg-steel-800 rounded-lg" />

              {/* Details skeleton */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-10 bg-steel-700 rounded w-3/4" />
                  <div className="h-6 bg-steel-700 rounded w-1/2" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-steel-800 rounded-lg" />
                  ))}
                </div>
                <div className="h-32 bg-steel-800 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-steel-400 hover:text-steel-200 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collection
          </button>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="w-24 h-24 text-red-500/50 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-steel-200 mb-2">
              {error === 'PGRST116' ? 'Vinyl not found' : 'Error loading vinyl'}
            </h2>
            <p className="text-steel-400 mb-6">
              {error === 'PGRST116'
                ? 'The vinyl you are looking for does not exist or has been deleted.'
                : error}
            </p>
            <Button onClick={handleBack}>Return to Collection</Button>
          </div>
        </div>
      </div>
    );
  }

  // No vinyl found
  if (!vinyl) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-steel-400 hover:text-steel-200 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collection
          </button>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-xl font-semibold text-steel-200 mb-2">Vinyl not found</h2>
            <p className="text-steel-400 mb-6">
              The vinyl you are looking for does not exist or has been deleted.
            </p>
            <Button onClick={handleBack}>Return to Collection</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VinylDetail
          vinyl={vinyl}
          isOwner={isOwner}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetNowPlaying={handleSetNowPlaying}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Vinyl"
        size="xl"
      >
        <VinylForm
          initialData={vinyl}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Vinyl"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-steel-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-steel-100">{vinyl.album}</span> by{' '}
            {vinyl.artist}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
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
