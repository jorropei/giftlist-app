import React from 'react';
import { Filter } from 'lucide-react';
import type { GiftFilters, ViewMode, Present } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface FiltersProps {
  filters: GiftFilters;
  onFilterChange: (filters: GiftFilters) => void;
  presents: Present[];
}

export function Filters({
  filters,
  onFilterChange,
  presents,
}: FiltersProps) {
  const { t } = useTranslation();
  const uniquePeople = Array.from(new Set(presents.map(present => present.for))).sort();

  return (
    <div className="glass-card p-3 sm:p-4 rounded-xl border border-gray-800 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as 'purchased' | 'not-purchased' | undefined })}
            className="input-field !py-1.5"
          >
            <option value="">{t('allStatus')}</option>
            <option value="purchased">{t('purchased')}</option>
            <option value="not-purchased">{t('notPurchased')}</option>
          </select>

          <select
            value={filters.person || ''}
            onChange={(e) => onFilterChange({ ...filters, person: e.target.value })}
            className="input-field !py-1.5"
          >
            <option value="">{t('allPeople')}</option>
            {uniquePeople.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}