import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  LISTS: 'lists',
  LIST_MEMBERS: 'list_members',
  PRESENTS: 'presents'
} as const;

// Types
export interface DBList {
  id: string;
  name: string;
  description?: string;
  password?: string; // Plain password for sharing
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBListMember {
  listId: string;
  userId: string;
  role: 'owner' | 'viewer';
  joinedAt: Date;
}