import { useState, useEffect } from "react";
import type { Bundle } from "../../types/package";
import {
  Button,
  Input,
  Select,
  Textarea,
  Switch,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../../design-system";
import { FaTimes, FaSave, FaCube } from "react-icons/fa";

interface BundleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Bundle) => Promise<void>;
  initialData?: Bundle | null;
  packageId?: string;
  providerId?: string;
  providerCode?: string;
}

const defaultBundle: Partial<Bundle> = {
  name: '',
  description: '',
  dataVolume: 0,
  dataUnit: 'MB',
  validity: 1,
  validityUnit: 'days',
  price: 0,
  currency: 'GHS',
  features: [],
  isActive: true,
  tags: [],
  category: 'custom',
  requiresGhanaCard: false,
  afaRequirements: [],
};

const CATEGORY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "unlimited", label: "Unlimited" },
  { value: "custom", label: "Custom" },
];

const DATA_UNIT_OPTIONS = [
  { value: "MB", label: "MB" },
  { value: "GB", label: "GB" },
  { value: "TB", label: "TB" },
];

const VALIDITY_UNIT_OPTIONS = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "unlimited", label: "Unlimited" },
];

export const BundleFormModal: React.FC<BundleFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  packageId,
  providerId,
  providerCode,
}) => {
  const [formData, setFormData] = useState<Partial<Bundle>>(defaultBundle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAfaBundle = providerCode === 'AFA';

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Ensure providerId is a string when editing
        let providerIdValue: string | undefined = initialData.providerId;
        if (typeof initialData.providerId === 'object' && initialData.providerId !== null) {
          // If it's a populated object, extract the _id
          const providerObj = initialData.providerId as { _id?: string; id?: string };
          if (providerObj._id) {
            providerIdValue = providerObj._id;
          } else if (providerObj.id) {
            providerIdValue = providerObj.id;
          } else {
            providerIdValue = '';
          }
        }

        setFormData({
          ...initialData,
          providerId: String(providerIdValue || '')
        });
      } else {
        setFormData({
          ...defaultBundle,
          packageId: packageId || '',
          providerId: String(providerId || ''),
        });
      }
      setError(null);
    }
  }, [open, initialData, packageId, providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        throw new Error('Bundle name is required');
      }

      // Only validate data volume for non-AFA bundles
      if (!isAfaBundle) {
        if (!formData.dataVolume || formData.dataVolume <= 0) {
          throw new Error('Data volume must be greater than 0');
        }

        // Validate validity - allow 'unlimited' or numbers > 0
        if (formData.validityUnit === 'unlimited') {
          formData.validity = 'unlimited';
        } else if (!formData.validity || (typeof formData.validity === 'number' && formData.validity <= 0)) {
          throw new Error('Validity must be greater than 0');
        }
      }

      if (!formData.price || formData.price < 0) {
        throw new Error('Price must be 0 or greater');
      }

      await onSubmit(formData as Bundle);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bundle');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Bundle, value: string | number | boolean | string[] | 'unlimited') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      mode="bottom-sheet"
      size="xl"
      className="sm:max-w-4xl"
    >
      <DialogHeader className="px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaCube className="text-blue-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? 'Edit Bundle' : 'Create Bundle'}
              {isAfaBundle && <span className="text-blue-600 ml-2">(AFA Registration)</span>}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </DialogHeader>

      <DialogBody className="px-4 sm:px-6 py-4 max-h-[72vh]">
        {/* Form */}
        <form id="bundle-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && <Alert status="error" variant="left-accent">{error}</Alert>}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Name *
              </label>
              <Input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter bundle name"
                required
                disabled={loading}
              />
            </div>

            <Textarea
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter bundle description"
              rows={3}
              disabled={loading}
            />

            <Select
              label="Category"
              value={formData.category || 'custom'}
              onChange={(value) => handleInputChange('category', value)}
              options={CATEGORY_OPTIONS}
              disabled={loading}
            />
          </div>

          {/* Data Configuration - Only show for non-AFA bundles */}
          {!isAfaBundle && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Data Configuration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Volume *
                  </label>
                  <Input
                    type="number"
                    value={formData.dataVolume || ''}
                    onChange={(e) => handleInputChange('dataVolume', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>

                <Select
                  label="Data Unit"
                  value={formData.dataUnit || 'MB'}
                  onChange={(value) => handleInputChange('dataUnit', value)}
                  options={DATA_UNIT_OPTIONS}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Validity Configuration - Only show for non-AFA bundles */}
          {!isAfaBundle && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Validity Configuration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity Duration *
                  </label>
                  <Input
                    type="number"
                    value={formData.validityUnit === 'unlimited' ? '' : (formData.validity || '')}
                    onChange={(e) => handleInputChange('validity', Number(e.target.value))}
                    placeholder={formData.validityUnit === 'unlimited' ? 'Unlimited' : '1'}
                    min="1"
                    required={formData.validityUnit !== 'unlimited'}
                    disabled={loading || formData.validityUnit === 'unlimited'}
                  />
                </div>

                <Select
                  label="Validity Unit"
                  value={formData.validityUnit || 'days'}
                  onChange={(value) => {
                    handleInputChange('validityUnit', value);
                    if (value === 'unlimited') {
                      handleInputChange('validity', 'unlimited');
                    } else if (formData.validity === 'unlimited') {
                      handleInputChange('validity', 1);
                    }
                  }}
                  options={VALIDITY_UNIT_OPTIONS}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Input
                  type="text"
                  value={formData.currency || 'GHS'}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  placeholder="GHS"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>

            <div className="rounded-lg border border-gray-200 px-4 py-3">
              <Switch
                checked={formData.isActive || false}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                isDisabled={loading}
                label="Active Bundle"
              />
            </div>
          </div>

          {/* AFA-Specific Fields */}
          {isAfaBundle && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">AFA Registration Requirements</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure the requirements for this AFA registration service. This is not a data bundle but a registration service.
              </p>

              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <Switch
                  checked={formData.requiresGhanaCard || false}
                  onCheckedChange={(checked) => handleInputChange('requiresGhanaCard', checked)}
                  isDisabled={loading}
                  label="Require Ghana Card Number for registration"
                />
              </div>

              <div>
                <Textarea
                  label="Additional Registration Requirements"
                  value={(formData.afaRequirements || []).join('\n')}
                  onChange={(e) => handleInputChange('afaRequirements', e.target.value.split('\n').filter(req => req.trim()))}
                  placeholder="Enter additional requirements for AFA registration (one per line)&#10;Example:&#10;- Valid ID card&#10;- Proof of address&#10;- Business registration certificate"
                  rows={4}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  List any additional documents or information required for this AFA registration (one per line)
                </p>
              </div>
            </div>
          )}

          {/* Package and Provider Info (Read-only) */}
          {(packageId || providerId) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Package Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packageId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package ID
                    </label>
                    <Input
                      type="text"
                      value={packageId}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                )}

                {providerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider
                    </label>
                    <Input
                      type="text"
                      value={providerId}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </form>
      </DialogBody>

      <DialogFooter className="px-4 sm:px-6 flex-col-reverse sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="bundle-form"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FaSave className="text-sm" />
          {loading ? 'Saving...' : (initialData ? 'Update Bundle' : 'Create Bundle')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}; 