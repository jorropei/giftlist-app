export type PriorityLevel = 'must-have' | 'nice-to-have' | 'optional';
export type ViewMode = 'grid' | 'list' | 'board';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
}

export interface Present {
  id: string;
  item: string;
  for: string;
  from: string;
  notes?: string;
  createdAt: Date;
  url?: string;
  imageUrl?: string;
  price?: number;
  brand?: string;
  isPurchased: boolean;
  priority: PriorityLevel;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  price: number;
  date: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
}

export interface GiftFilters {
  brand?: string;
  recipient?: string;
  status?: 'purchased' | 'not-purchased';
  priority?: PriorityLevel;
}