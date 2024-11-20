import React from 'react';
import { PresentCard } from './PresentCard';
import type { Present } from '../types';

interface PresentListProps {
  presents: Present[];
  onPurchaseToggle: (id: string) => void;
  onPriorityChange: (id: string, priority: Present['priority']) => void;
}

export function PresentList({ presents, onPurchaseToggle, onPriorityChange }: PresentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {presents.map((present) => (
        <div key={present.id} className="h-[420px]">
          <PresentCard
            present={present}
            onPurchaseToggle={onPurchaseToggle}
            onPriorityChange={onPriorityChange}
          />
        </div>
      ))}
    </div>
  );
}