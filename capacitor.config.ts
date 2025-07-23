import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medistock.app',
  appName: 'MediStock',
  webDir: 'out',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: process.env.NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
