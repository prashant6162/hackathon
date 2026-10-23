import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import {
  getUsers,
  getUserById,
  updateUser,
  initializeStorageIfNeeded,
  resetDemoDataToDefaults,
  subscribeToDataChanges,
} from '../services/storageService';
import { isFirebaseConfigured, auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseMode: boolean;
  demoUsers: User[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoUser: (userId: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetDemoData: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  locality: string;
  city?: string;
  bio: string;
  teachSkills: string[];
  learnSkills: string[];
  preferredMode: 'online' | 'in-person' | 'both';
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_ID_KEY = 'skillconnect_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  useEffect(() => {
    initializeStorageIfNeeded();

    const loadUsers = async () => {
      const allUsers = await getUsers();
      setDemoUsers(allUsers);

      if (isFirebaseConfigured && auth) {
        // Real Firebase Auth listener
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const userProfile = await getUserById(fbUser.uid);
            if (userProfile) {
              setCurrentUser(userProfile);
            } else {
              // fallback user if doc missing
              setCurrentUser({
                id: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
                email: fbUser.email || '',
                avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                locality: 'Local Community',
                bio: 'Passionate community learner & mentor.',
                teachSkills: ['General Mentorship'],
                learnSkills: ['New Skills'],
                preferredMode: 'both',
                rating: 5.0,
                reviewCount: 0,
                completedSessions: 0,
                role: 'user',
                createdAt: new Date().toISOString(),
              });
            }
          } else {
            setCurrentUser(null);
          }
          setLoading(false);
        });
        return unsubscribe;
      } else {
        // Demo Mode: Check stored active user ID or default to Maya Patel for immediate rich demo
        const savedUserId = localStorage.getItem(CURRENT_USER_ID_KEY) || 'user-maya';
        const user = allUsers.find((u) => u.id === savedUserId) || allUsers[0] || null;
        setCurrentUser(user);
        if (user) {
          localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
        }
        setLoading(false);
      }
    };

    loadUsers();

    // Re-sync if data changes locally
    const unsubscribeChanges = subscribeToDataChanges(async () => {
      const all = await getUsers();
      setDemoUsers(all);
      setCurrentUser((prev) => {
        if (!prev) return null;
        return all.find((u) => u.id === prev.id) || prev;
      });
    });

    return () => {
      unsubscribeChanges();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isFirebaseConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed. Please check your credentials.' };
      }
    }

    // Demo Mode login check
    const users = await getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(CURRENT_USER_ID_KEY, found.id);
      return { success: true };
    }

    return {
      success: false,
      error: 'User not found with this email. You can use one of the Quick Demo Logins below or create a new account.',
    };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const avatarUrl =
      data.avatar ||
      `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50000)}?w=200&auto=format&fit=crop&q=80`;

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, data.email, data.password || 'password123');
        const newUser: User = {
          id: cred.user.uid,
          name: data.name,
          email: data.email,
          avatar: avatarUrl,
          locality: data.locality,
          city: data.city || data.locality.split(',')[0],
          bio: data.bio,
          teachSkills: data.teachSkills,
          learnSkills: data.learnSkills,
          preferredMode: data.preferredMode,
          rating: 5.0,
          reviewCount: 0,
          completedSessions: 0,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        await updateUser(newUser);
        setCurrentUser(newUser);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to create account.' };
      }
    }

    // Demo Mode registration
    const users = await getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name,
      email: data.email,
      avatar: avatarUrl,
      locality: data.locality,
      city: data.city || data.locality.split(',')[0],
      bio: data.bio,
      teachSkills: data.teachSkills,
      learnSkills: data.learnSkills,
      preferredMode: data.preferredMode,
      rating: 5.0,
      reviewCount: 0,
      completedSessions: 0,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    await updateUser(newUser);
    setCurrentUser(newUser);
    localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);
    return { success: true };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  };

  const switchDemoUser = async (userId: string) => {
    const users = await getUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(CURRENT_USER_ID_KEY, target.id);
    }
  };

  const updateUserProfile = async (partial: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...partial };
    await updateUser(updated);
    setCurrentUser(updated);
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: `Password reset instructions sent to ${email}` };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to send reset email.' };
      }
    }
    return {
      success: true,
      message: `[Demo Mode] A simulated password reset link has been dispatched to ${email}.`,
    };
  };

  const resetDemoData = () => {
    resetDemoDataToDefaults();
    localStorage.setItem(CURRENT_USER_ID_KEY, 'user-maya');
    getUserById('user-maya').then((u) => setCurrentUser(u));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirebaseMode: isFirebaseConfigured,
        demoUsers,
        login,
        register,
        logout,
        switchDemoUser,
        updateUserProfile,
        sendPasswordReset,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
