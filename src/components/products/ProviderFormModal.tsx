/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/products/ProviderFormModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import type { Provider } from '../../types/package';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Switch,
  Textarea,
} from '../../design-system';

// Extended provider interface with tags for the form
export interface ProviderFormData extends Omit<Partial<Provider>, 'code'> {
  code?: string;
  tags?: string[];
}

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProviderFormData) => Promise<void>;
  provider?: Provider | null;
  mode: 'create' | 'edit';
  loading: boolean;
}

export const ProviderFormModal: React.FC<ProviderFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  provider: providerData,
  mode,
  loading
}) => {
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    code: '',
    description: '',
    tags: [],
    isActive: true
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (providerData && mode === 'edit') {
      // Convert Provider to ProviderFormData (adding tags if needed)
      const formDataFromProvider: ProviderFormData = {
        ...providerData,
        tags: []  // Initialize tags as empty array since it's not in Provider type
      };
      setFormData(formDataFromProvider);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        tags: [],
        isActive: true
      });
    }
  }, [providerData, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Error submitting provider
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      mode="bottom-sheet"
      overlayClassName="bg-black/60"
      className="max-h-[95vh]"
    >
      <DialogHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'create' ? 'Add Provider' : 'Edit Provider'}
            </h2>
            <p className="text-sm text-slate-500">
              Complete the provider details and save your changes.
            </p>
          </div>
          <Button
            variant="ghost"
            iconOnly
            aria-label="Close provider form"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900"
          >
            <FaTimes />
          </Button>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Provider Name"
              required
              value={formData.name ?? ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter provider name"
              fullWidth
            />
            <Input
              label="Provider Code"
              required
              value={formData.code ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              onBlur={(e) => {
                const value = e.target.value.toUpperCase();
                const allowedCodes = ['MTN', 'TELECEL', 'AT', 'AFA', ''] as const;
                if (!allowedCodes.includes(value as any)) {
                  setFormData((prev) => ({ ...prev, code: '' }));
                }
              }}
              placeholder="MTN, TELECEL, AT, AFA"
              fullWidth
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Add a short description for this provider"
          />

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                label="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="e.g., data, airtime"
                fullWidth
              />
              <Button
                type="button"
                variant="secondary"
                leftIcon={<FaPlus />}
                onClick={addTag}
                className="min-w-[130px]"
              >
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-slate-500 transition hover:text-slate-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <Input
            label="Logo URL"
            type="url"
            value={formData.logo?.url ?? ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                logo: {
                  url: e.target.value,
                  alt: prev.logo?.alt ?? '',
                },
              }))
            }
            placeholder="https://example.com/logo.png"
            fullWidth
          />

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isActive || false}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              label="Active provider"
            />
          </div>

          <DialogFooter justify="between" className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading} loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}>
              {mode === 'create' ? 'Create Provider' : 'Update Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};
