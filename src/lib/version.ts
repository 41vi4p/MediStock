export const APP_VERSION = {
  version: 'v1.0.0',
  releaseDate: 'January 21, 2024',
  buildType: 'stable' as 'stable' | 'beta' | 'alpha',
  buildNumber: '1.0.0',
  codename: 'Genesis',
  features: [
    'Family medicine sharing',
    'Expiry date tracking',
    'Advanced search & filters',
    'Mobile-responsive design',
    'Google OAuth integration',
    'Real-time synchronization',
    'Role-based permissions',
    'Comprehensive medicine database'
  ],
  changelog: {
    major: [
      'Initial stable release',
      'Complete family management system',
      'Full medicine inventory tracking',
      'Responsive mobile design',
      'Firebase integration'
    ],
    minor: [],
    patches: []
  },
  technical: {
    framework: 'Next.js 15',
    runtime: 'React 18',
    language: 'TypeScript',
    styling: 'Tailwind CSS',
    backend: 'Firebase',
    deployment: 'Vercel Ready'
  }
} as const;

export const getVersionInfo = () => {
  return {
    fullVersion: APP_VERSION.version,
    shortVersion: APP_VERSION.version.replace('v', ''),
    releaseDate: APP_VERSION.releaseDate,
    buildType: APP_VERSION.buildType,
    isStable: APP_VERSION.buildType === 'stable',
    isBeta: APP_VERSION.buildType === 'beta',
    isAlpha: APP_VERSION.buildType === 'alpha'
  };
};

export const getFeatureList = () => APP_VERSION.features;

export const getTechnicalStack = () => APP_VERSION.technical;