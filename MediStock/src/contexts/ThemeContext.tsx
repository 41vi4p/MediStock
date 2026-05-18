import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightColors = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  primary: '#2563eb',
  primaryLight: '#eff6ff',
  danger: '#ef4444',
  dangerLight: '#fef2f2',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  success: '#22c55e',
  successLight: '#f0fdf4',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
  inputBg: '#ffffff',
};

const darkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#334155',
  primary: '#3b82f6',
  primaryLight: '#1e3a5f',
  danger: '#f87171',
  dangerLight: '#3b1c1c',
  warning: '#fbbf24',
  warningLight: '#3b2f1c',
  success: '#4ade80',
  successLight: '#1c3b2a',
  purple: '#a78bfa',
  purpleLight: '#2e1f5e',
  inputBg: '#1e293b',
};

export type ThemeColors = typeof lightColors;
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  mode: 'system',
  isDark: false,
  setMode: () => {},
});

const THEME_KEY = '@medistock_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode);
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeColors() {
  return useContext(ThemeContext).colors;
}

export function useTheme() {
  return useContext(ThemeContext);
}
