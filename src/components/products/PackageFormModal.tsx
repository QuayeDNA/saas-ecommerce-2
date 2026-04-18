import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Alert,
} from '../../design-system';
import type { Package } from '../../types/package';

interface PackageFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Package>) => void;
  initialData?: Partial<Package> | null;
}

const PROVIDER_OPTIONS = [
  { value: 'MTN', label: 'MTN' },
  { value: 'TELECEL', label: 'TELECEL' },
  { value: 'AT', label: 'AT' },
  { value: 'AFA', label: 'AFA' }
];

const CATEGORY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'unlimited', label: 'Unlimited' },
  { value: 'custom', label: 'Custom' },
];

export const PackageFormModal: React.FC<PackageFormModalProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState<Partial<Package>>({
    name: '',
    description: '',
    provider: '',
    category: 'daily',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        provider: initialData.provider || '',
        category: initialData.category || 'daily',
        isActive: initialData.isActive ?? true,
      });
    } else {
      setForm({ name: '', description: '', provider: '', category: 'daily', isActive: true });
    }
    setError(null);
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;

    if (type === 'checkbox') {
      // Only HTMLInputElement has 'checked'
      newValue = (e.target as HTMLInputElement).checked;
    }

    setForm(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.provider || !form.category) {
      setError('Name, Provider, and Category are required.');
      return;
    }
    setError(null);
    onSubmit(form);
  };

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      mode="bottom-sheet"
      size="lg"
      className="sm:max-w-2xl"
    >
      <DialogHeader className="px-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {initialData ? 'Edit Package' : 'Create Package'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure package details and provider assignment.
        </p>
      </DialogHeader>

      <DialogBody className="px-4 sm:px-6 py-4 max-h-[68vh]">
        <form id="package-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert status="error" variant="left-accent">{error}</Alert>}

          <Input
            type="text"
            name="name"
            label="Name *"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />

          <Textarea
            name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />

          <Select
            label="Provider *"
            value={form.provider || ''}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                provider: value,
              }))
            }
            options={[
              { value: '', label: 'Select provider' },
              ...PROVIDER_OPTIONS,
            ]}
          />

          <Select
            label="Category *"
            value={form.category || 'daily'}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                category: value as Package['category'],
              }))
            }
            options={CATEGORY_OPTIONS}
          />

          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <Switch
              checked={!!form.isActive}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  isActive: checked,
                }))
              }
              label="Active package"
            />
          </div>
        </form>
      </DialogBody>

      <DialogFooter className="px-4 sm:px-6 flex-col sm:flex-row">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" form="package-form" className="w-full sm:w-auto">
          {initialData ? 'Update Package' : 'Create Package'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}; 