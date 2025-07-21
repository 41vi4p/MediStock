'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import ActivityLogger from '@/lib/activityLogger';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);

  // Load theme preference from localStorage initially, then from Firestore
  useEffect(() => {
    const savedTheme = localStorage.getItem('medistock-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    setLoading(false);
  }, []);

  // Load theme from Firestore when user is available
  useEffect(() => {
    const loadUserTheme = async () => {
      if (!user?.id) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userTheme = userData.theme as Theme;
          if (userTheme && (userTheme === 'light' || userTheme === 'dark')) {
            setThemeState(userTheme);
            document.documentElement.classList.toggle('dark', userTheme === 'dark');
            localStorage.setItem('medistock-theme', userTheme);
          }
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
      }
    };

    loadUserTheme();
  }, [user?.id]);

  // Update theme and save to Firestore
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('medistock-theme', newTheme);

    // Save to Firestore if user is authenticated
    if (user?.id) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          theme: newTheme,
          updatedAt: new Date(),
        });

        // Log theme change activity
        if (user.familyId) {
          await ActivityLogger.logSettingsUpdated(
            user.id,
            user.displayName,
            user.familyId,
            'theme',
            { newTheme, previousTheme: theme }
          );
        }
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}