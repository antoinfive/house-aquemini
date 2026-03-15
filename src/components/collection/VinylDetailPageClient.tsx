'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { VinylDetail } from '@/components/collection/VinylDetail';
import { VinylForm } from '@/components/collection/VinylForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Vinyl, VinylFormData, ApiResponse } from '@/lib/types';
import toast from 'react-hot-toast';

interface VinylDetailPageClientProps {
  vinyl: Vinyl;
}

export default function VinylDetailPageClient({ vinyl: initialVinyl }: VinylDetailPageClientProps) {
  const router = useRouter();
  const { isOwner } = useAuth();

  const [vinyl, setVinyl] = useState<Vinyl>(initialVinyl);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = useCallback(() => {
    router.push('/collection');
  }, [router]);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = async (data: VinylFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vinyls/${vinyl.id}`, {
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

  const handleDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vinyls/${vinyl.id}`, {
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

  const handleSetNowPlaying = useCallback(async () => {
    try {
      const response = await fetch('/api/now-playing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'manual',
          vinyl_id: vinyl.id,
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
  }, [vinyl.id]);

  return (
    <div className="page-enter min-h-screen">
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
