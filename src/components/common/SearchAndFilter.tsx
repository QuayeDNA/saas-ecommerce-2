// src/components/common/SearchAndFilter.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Button, Input, Select, Card, CardBody } from '../../design-system';
import { useDebounce } from '../../hooks';

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  disabled?: boolean;
}

export interface SearchAndFilterProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Search Configuration
  debounceDelay?: number; // Delay in ms before triggering search (default: 500)
  minSearchLength?: number; // Minimum characters before triggering search (default: 0)
  enableAutoSearch?: boolean; // Whether to auto-search on typing (default: true)

  // Filters
  filters: {
    [key: string]: {
      value: string;
      options: FilterOption[];
      label: string;
      placeholder?: string;
    };
  };
  onFilterChange: (filterKey: string, value: string) => void;

  // Date Range
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  showDateRange?: boolean;

  // Actions
  onSearch: (e: React.FormEvent) => void;
  onClearFilters: () => void;

  // UI Options
  showSearchButton?: boolean;
  showClearButton?: boolean;
  showFilterToggle?: boolean;
  className?: string;

  // Loading state
  isLoading?: boolean;

  // Custom actions
  customActions?: React.ReactNode;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  debounceDelay = 500,
  minSearchLength = 0,
  enableAutoSearch = true,
  filters,
  onFilterChange,
  dateRange,
  onDateRangeChange,
  showDateRange = false,
  onSearch,
  onClearFilters,
  showSearchButton = true,
  showClearButton = true,
  showFilterToggle = true,
  className = "",
  isLoading = false,
  customActions
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [immediateSearchTerm, setImmediateSearchTerm] = useState(searchTerm);

  // Debounced search function
  const debouncedSearch = useDebounce((...args: unknown[]) => {
    const value = args[0] as string;
    if (value.length >= minSearchLength || value === '') {
      onSearchChange(value);
    }
  }, debounceDelay);

  // Update immediate search term when prop changes (for external updates)
  useEffect(() => {
    setImmediateSearchTerm(searchTerm);
  }, [searchTerm]);

  // Cleanup pending debounce on unmount
  useEffect(() => () => debouncedSearch.cleanup(), [debouncedSearch]);

  // Handle immediate input changes
  const handleSearchInputChange = useCallback((value: string) => {
    setImmediateSearchTerm(value);
    if (enableAutoSearch) {
      debouncedSearch(value);
    }
  }, [enableAutoSearch, debouncedSearch]);

  // Handle immediate search (for search button or enter key)
  const handleImmediateSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Cancel any pending debounced search
    debouncedSearch.cleanup();
    // Trigger immediate search
    onSearchChange(immediateSearchTerm);
    onSearch(e);
  }, [immediateSearchTerm, onSearchChange, onSearch, debouncedSearch]);

  const hasActiveFilters = Object.values(filters).some(filter => filter.value !== '') ||
    (showDateRange && dateRange && (dateRange.startDate || dateRange.endDate));
  const hasSearchTerm = searchTerm.trim() !== '';
  const hasImmediateSearchTerm = immediateSearchTerm.trim() !== '';

  const handleClearAll = () => {
    setImmediateSearchTerm('');
    onSearchChange('');
    Object.keys(filters).forEach(filterKey => {
      onFilterChange(filterKey, '');
    });
    if (showDateRange && onDateRangeChange) {
      onDateRangeChange('', '');
    }
    onClearFilters();
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (onDateRangeChange && dateRange) {
      const newStartDate = field === 'startDate' ? value : dateRange.startDate;
      const newEndDate = field === 'endDate' ? value : dateRange.endDate;
      onDateRangeChange(newStartDate, newEndDate);

      // Auto-search when both dates are set or when clearing dates
      if ((newStartDate && newEndDate) || (!newStartDate && !newEndDate)) {
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
          onSearch(fakeEvent);
        }, 100);
      }
    }
  };

  return (
    <Card className={`border border-[var(--color-border)] bg-[var(--color-surface)] ${className}`}>
      <CardBody>
        {/* Search and Actions Row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
          {/* Search Input */}
          <form onSubmit={handleImmediateSearch} className="w-full md:flex-1">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={immediateSearchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              leftIcon={<FaSearch className="text-slate-400" />}
              disabled={isLoading}
            />
          </form>

          {/* Action Buttons */}
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:flex-nowrap">
            {showSearchButton && (
              <Button
                onClick={handleImmediateSearch}
                disabled={isLoading}
                size="sm"
                className="w-full sm:w-auto"
              >
                <FaSearch className="mr-2" />
                Search
              </Button>
            )}

            {showFilterToggle && (
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full sm:w-auto md:hidden border-[var(--color-border)]"
                size="sm"
              >
                <FaFilter className="mr-2" />
                {showMobileFilters ? 'Hide Filters' : 'Filters'}
              </Button>
            )}

            {showClearButton && (hasActiveFilters || hasSearchTerm || hasImmediateSearchTerm) && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={isLoading}
                size="sm"
                className="w-full sm:w-auto border-[var(--color-border)] text-slate-700"
              >
                <FaTimes className="mr-2" />
                Clear
              </Button>
            )}

            {customActions}
          </div>
        </div>

        {/* Filters Section */}
        {(Object.keys(filters).length > 0 || showDateRange) && (
          <div
            className={`mt-4 border-t border-[var(--color-border)] pt-4 ${showMobileFilters ? 'block' : 'hidden'} md:block`}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Object.entries(filters).map(([filterKey, filter]) => (
                <div key={filterKey}>
                  <Select
                    label={filter.label}
                    value={filter.value}
                    onChange={(value) => onFilterChange(filterKey, value)}
                    options={[
                      { value: '', label: filter.placeholder || `All ${filter.label}` },
                      ...filter.options.map(option => ({
                        value: option.value,
                        label: option.label,
                        disabled: option.disabled || false
                      }))
                    ]}
                    disabled={isLoading}
                  />
                </div>
              ))}

              {/* Date Range Picker */}
              {showDateRange && (
                <>
                  <div>
                    <Input
                      type="date"
                      label="Start Date"
                      value={dateRange?.startDate || ''}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      label="End Date"
                      value={dateRange?.endDate || ''}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(hasActiveFilters || hasSearchTerm || hasImmediateSearchTerm) && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <div className="flex flex-wrap gap-2">
              {(hasSearchTerm || hasImmediateSearchTerm) && (
                <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm text-primary-700">
                  Search: "{hasSearchTerm ? searchTerm : immediateSearchTerm}"
                  <button
                    onClick={() => {
                      setImmediateSearchTerm('');
                      onSearchChange('');
                    }}
                    className="ml-2 text-primary-600 transition-colors hover:text-primary-800"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}

              {Object.entries(filters).map(([filterKey, filter]) => {
                if (filter.value) {
                  const selectedOption = filter.options.find(opt => opt.value === filter.value);
                  return (
                    <span
                      key={filterKey}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {filter.label}: {selectedOption?.label}
                      <button
                        onClick={() => onFilterChange(filterKey, '')}
                        className="ml-2 text-slate-500 transition-colors hover:text-slate-700"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  );
                }
                return null;
              })}

              {/* Date Range Active Filter */}
              {showDateRange && dateRange && (dateRange.startDate || dateRange.endDate) && (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                  Date: {dateRange.startDate || 'Start'} - {dateRange.endDate || 'End'}
                  <button
                    onClick={() => onDateRangeChange?.('', '')}
                    className="ml-2 text-emerald-600 transition-colors hover:text-emerald-800"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}; 