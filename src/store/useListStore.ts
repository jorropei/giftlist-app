import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { SHA256 } from 'crypto-js';
import { db, COLLECTIONS, type DBList, type DBListMember } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';

interface ListStore {
  lists: DBList[];
  currentList: DBList | null;
  loading: boolean;
  error: string | null;
  createList: (name: string, description: string, password: string) => Promise<void>;
  joinList: (name: string, password: string) => Promise<void>;
  fetchUserLists: () => Promise<void>;
  setCurrentList: (listId: string) => Promise<void>;
  updateListDescription: (listId: string, description: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
}

export const useListStore = create<ListStore>((set, get) => ({
  lists: [],
  currentList: null,
  loading: false,
  error: null,

  createList: async (name: string, description: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User must be logged in');

      // Check if list name already exists
      const existingList = query(
        collection(db, COLLECTIONS.LISTS),
        where('name', '==', name)
      );
      const snapshot = await getDocs(existingList);
      
      if (!snapshot.empty) {
        throw new Error('A list with this name already exists. Please choose a different name.');
      }

      // Hash the password
      const hashedPassword = SHA256(password).toString();

      // Create the list document
      const listData = {
        name,
        description,
        password: hashedPassword, // Store hashed password
        plainPassword: password, // Store plain password for sharing
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const listRef = await addDoc(collection(db, COLLECTIONS.LISTS), listData);

      // Create the list member document
      const memberId = `${user.uid}_${listRef.id}`;
      const memberData = {
        listId: listRef.id,
        userId: user.uid,
        role: 'owner',
        joinedAt: serverTimestamp()
      };

      await setDoc(doc(db, COLLECTIONS.LIST_MEMBERS, memberId), memberData);

      const newList: DBList = {
        id: listRef.id,
        name,
        description,
        password, // Store plain password
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set(state => ({ 
        lists: [...state.lists, newList],
        currentList: newList,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error creating list:', error);
      set({ 
        error: (error as Error).message,
        loading: false 
      });
      throw error;
    }
  },

  updateListDescription: async (listId: string, description: string) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User must be logged in');

      // Check if user is a member of the list
      const memberId = `${user.uid}_${listId}`;
      const memberDoc = await getDoc(doc(db, COLLECTIONS.LIST_MEMBERS, memberId));
      
      if (!memberDoc.exists()) {
        throw new Error('You are not a member of this list.');
      }

      // Update the list description
      const listRef = doc(db, COLLECTIONS.LISTS, listId);
      await updateDoc(listRef, {
        description,
        updatedAt: serverTimestamp()
      });

      // Update local state
      set(state => ({
        lists: state.lists.map(list => 
          list.id === listId ? { ...list, description } : list
        ),
        currentList: state.currentList?.id === listId 
          ? { ...state.currentList, description }
          : state.currentList,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error updating list description:', error);
      set({ 
        error: (error as Error).message,
        loading: false 
      });
      throw error;
    }
  },

  deleteList: async (listId: string) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User must be logged in');

      // Check if user is the creator of the list
      const listDoc = await getDoc(doc(db, COLLECTIONS.LISTS, listId));
      if (!listDoc.exists()) {
        throw new Error('List not found.');
      }

      if (listDoc.data().createdBy !== user.uid) {
        throw new Error('Only the list creator can delete this list.');
      }

      // Delete all list members
      const membersQuery = query(
        collection(db, COLLECTIONS.LIST_MEMBERS),
        where('listId', '==', listId)
      );
      const memberDocs = await getDocs(membersQuery);
      
      for (const memberDoc of memberDocs.docs) {
        await deleteDoc(doc(db, COLLECTIONS.LIST_MEMBERS, memberDoc.id));
      }

      // Delete all presents in the list
      const presentsQuery = query(
        collection(db, COLLECTIONS.PRESENTS),
        where('listId', '==', listId)
      );
      const presentDocs = await getDocs(presentsQuery);
      
      for (const presentDoc of presentDocs.docs) {
        await deleteDoc(doc(db, COLLECTIONS.PRESENTS, presentDoc.id));
      }

      // Delete the list itself
      await deleteDoc(doc(db, COLLECTIONS.LISTS, listId));

      // Update local state
      set(state => ({
        lists: state.lists.filter(list => list.id !== listId),
        currentList: state.currentList?.id === listId ? null : state.currentList,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error deleting list:', error);
      set({ 
        error: (error as Error).message,
        loading: false 
      });
      throw error;
    }
  },

  joinList: async (name: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User must be logged in');

      // Find list by name
      const q = query(
        collection(db, COLLECTIONS.LISTS),
        where('name', '==', name)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('List not found. Please check the name and try again.');
      }

      const listDoc = snapshot.docs[0];
      const listData = listDoc.data();
      const hashedPassword = SHA256(password).toString();
      
      if (listData.password !== hashedPassword) {
        throw new Error('Incorrect password. Please check the password and try again.');
      }

      // Check if user is already a member
      const memberId = `${user.uid}_${listDoc.id}`;
      const memberDoc = await getDoc(doc(db, COLLECTIONS.LIST_MEMBERS, memberId));
      
      if (memberDoc.exists()) {
        throw new Error('You are already a member of this list.');
      }

      // Add user as a member
      await setDoc(doc(db, COLLECTIONS.LIST_MEMBERS, memberId), {
        listId: listDoc.id,
        userId: user.uid,
        role: 'viewer',
        joinedAt: serverTimestamp()
      });

      const list: DBList = {
        id: listDoc.id,
        name: listData.name,
        description: listData.description,
        password: listData.plainPassword, // Use plain password for sharing
        createdBy: listData.createdBy,
        createdAt: listData.createdAt.toDate(),
        updatedAt: listData.updatedAt.toDate()
      };

      set(state => ({ 
        lists: [...state.lists, list],
        currentList: list,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error joining list:', error);
      set({ 
        error: (error as Error).message,
        loading: false 
      });
      throw error;
    }
  },

  fetchUserLists: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User must be logged in');

      // Get all lists where user is a member
      const memberQuery = query(
        collection(db, COLLECTIONS.LIST_MEMBERS),
        where('userId', '==', user.uid)
      );
      const memberDocs = await getDocs(memberQuery);
      
      const lists: DBList[] = [];

      // Fetch each list's details
      for (const memberDoc of memberDocs.docs) {
        const listId = memberDoc.data().listId;
        const listDoc = await getDoc(doc(db, COLLECTIONS.LISTS, listId));
        
        if (listDoc.exists()) {
          const data = listDoc.data();
          lists.push({
            id: listId,
            name: data.name,
            description: data.description,
            password: data.plainPassword, // Use plain password for sharing
            createdBy: data.createdBy,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          });
        }
      }

      set({ lists, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching lists:', error);
      set({ 
        error: 'Failed to fetch lists. Please try again.',
        loading: false,
        lists: []
      });
    }
  },

  setCurrentList: async (listId: string) => {
    try {
      if (!listId) {
        set({ currentList: null });
        return;
      }

      const list = get().lists.find(l => l.id === listId);
      if (list) {
        set({ currentList: list });
      } else {
        const listDoc = await getDoc(doc(db, COLLECTIONS.LISTS, listId));
        if (listDoc.exists()) {
          const data = listDoc.data();
          const list: DBList = {
            id: listId,
            name: data.name,
            description: data.description,
            password: data.plainPassword, // Use plain password for sharing
            createdBy: data.createdBy,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          };
          set({ currentList: list });
        }
      }
    } catch (error) {
      console.error('Error setting current list:', error);
      set({ error: 'Failed to set current list' });
    }
  }
}));