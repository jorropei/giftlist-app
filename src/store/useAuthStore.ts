import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../types';

interface AuthStore {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  error: null,

  signUp: async (email, password, name) => {
    try {
      set({ error: null });
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      set({ userProfile });
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email address.';
      }
      
      set({ error: errorMessage });
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      set({ error: null });
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        set({ userProfile: userDoc.data() as UserProfile });
      }
    } catch (error: any) {
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password. Please try again.';
      }
      
      set({ error: errorMessage });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, userProfile: null, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));

// Set up auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Fetch user profile when auth state changes
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      useAuthStore.setState({ 
        user, 
        userProfile: userDoc.data() as UserProfile,
        loading: false 
      });
    } else {
      useAuthStore.setState({ user, loading: false });
    }
  } else {
    useAuthStore.setState({ user: null, userProfile: null, loading: false });
  }
});