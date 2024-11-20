import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import { useListStore } from './useListStore';
import type { Present, GiftFilters } from '../types';

interface GiftStore {
  presents: Present[];
  filters: GiftFilters;
  loading: boolean;
  error: string | null;
  fetchPresents: () => Promise<void>;
  addPresent: (present: Omit<Present, 'id' | 'createdAt'>) => Promise<void>;
  updatePresent: (id: string, present: Partial<Present>) => Promise<void>;
  deletePresent: (id: string) => Promise<void>;
  togglePurchaseStatus: (id: string) => Promise<void>;
  updatePriority: (id: string, priority: Present['priority']) => Promise<void>;
  setFilters: (filters: GiftFilters) => void;
}

export const useGiftStore = create<GiftStore>((set, get) => ({
  presents: [],
  filters: {},
  loading: false,
  error: null,

  fetchPresents: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;
      const currentList = useListStore.getState().currentList;
      
      if (!user || !currentList) {
        throw new Error('User must be logged in and a list must be selected');
      }

      const presentsRef = collection(db, COLLECTIONS.PRESENTS);
      const q = query(presentsRef, where('listId', '==', currentList.id));
      const querySnapshot = await getDocs(q);
      
      const presents = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Present[];

      set({ presents, loading: false });
    } catch (error) {
      console.error('Error fetching presents:', error);
      set({ 
        error: 'Failed to fetch presents. Please try again.',
        loading: false,
        presents: []
      });
    }
  },

  addPresent: async (presentData) => {
    try {
      set({ error: null });
      const user = useAuthStore.getState().user;
      const currentList = useListStore.getState().currentList;
      
      if (!user || !currentList) {
        throw new Error('User must be logged in and a list must be selected');
      }

      const newPresent = {
        item: presentData.item,
        for: presentData.for,
        from: presentData.from || 'Anonymous',
        notes: presentData.notes || null,
        url: presentData.url || null,
        imageUrl: presentData.imageUrl || null,
        price: presentData.price || null,
        brand: presentData.brand || null,
        brandLogoUrl: presentData.brandLogoUrl || null,
        isPurchased: false,
        priority: presentData.priority || 'nice-to-have',
        listId: currentList.id,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        priceHistory: presentData.price 
          ? [{
              price: presentData.price,
              date: Timestamp.fromDate(new Date())
            }]
          : []
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.PRESENTS), newPresent);
      
      set(state => ({
        presents: [...state.presents, { 
          ...newPresent, 
          id: docRef.id,
          createdAt: new Date()
        } as Present]
      }));
    } catch (error) {
      console.error('Error adding present:', error);
      set({ error: 'Failed to add present. Please try again.' });
      throw error;
    }
  },

  updatePresent: async (id: string, presentData: Partial<Present>) => {
    try {
      set({ error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User must be logged in');

      const presentRef = doc(db, COLLECTIONS.PRESENTS, id);
      await updateDoc(presentRef, {
        ...presentData,
        updatedAt: serverTimestamp()
      });

      set(state => ({
        presents: state.presents.map(p =>
          p.id === id ? { ...p, ...presentData } : p
        )
      }));
    } catch (error) {
      console.error('Error updating present:', error);
      set({ error: 'Failed to update present. Please try again.' });
      throw error;
    }
  },

  deletePresent: async (id: string) => {
    try {
      set({ error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User must be logged in');

      const presentRef = doc(db, COLLECTIONS.PRESENTS, id);
      await deleteDoc(presentRef);

      set(state => ({
        presents: state.presents.filter(p => p.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting present:', error);
      set({ error: 'Failed to delete present. Please try again.' });
      throw error;
    }
  },

  togglePurchaseStatus: async (id: string) => {
    try {
      set({ error: null });
      const present = get().presents.find(p => p.id === id);
      if (!present) return;

      const presentRef = doc(db, COLLECTIONS.PRESENTS, id);
      await updateDoc(presentRef, {
        isPurchased: !present.isPurchased,
        updatedAt: serverTimestamp()
      });

      set(state => ({
        presents: state.presents.map(p =>
          p.id === id ? { ...p, isPurchased: !p.isPurchased } : p
        )
      }));
    } catch (error) {
      console.error('Error toggling purchase status:', error);
      set({ error: 'Failed to update purchase status. Please try again.' });
    }
  },

  updatePriority: async (id: string, priority: Present['priority']) => {
    try {
      set({ error: null });
      const presentRef = doc(db, COLLECTIONS.PRESENTS, id);
      await updateDoc(presentRef, {
        priority,
        updatedAt: serverTimestamp()
      });

      set(state => ({
        presents: state.presents.map(p =>
          p.id === id ? { ...p, priority } : p
        )
      }));
    } catch (error) {
      console.error('Error updating priority:', error);
      set({ error: 'Failed to update priority. Please try again.' });
    }
  },

  setFilters: (filters) => set({ filters })
}));