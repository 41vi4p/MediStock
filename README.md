# 💊 MediStock - Mobile App

**Version 2.2.0** - A comprehensive mobile application for managing home medicine inventory with expiry tracking, family sharing, and intelligent notifications. Built with Expo, React Native, TypeScript, and Firebase.

## ✨ Features

### 🏠 Family Medicine Management
- **Family Groups** with 6-character join codes
- **Optional Password Protection** (bcrypt-encrypted)
- **Role-Based Access** (Admin/Member)
- **Real-time Sync** across all family members
- **Code Regeneration** and password management

### 💊 Medicine Tracking
- **Add/Delete Medicines** with full details
- **Expiry Monitoring** with color-coded indicators (green/yellow/red)
- **Smart Categories** (Pain Relief, Antibiotics, Vitamins, etc.)
- **Location Tracking** (Medicine Cabinet, Refrigerator, etc.)
- **Out of Stock** marking and tracking

### 🔍 Search & Filtering
- **Text Search** by name, description, or category
- **Category Filters** with horizontal chip selection
- **Status Filters** (All, In Stock, Out of Stock, Expired, Expiring Soon)
- **Sort Options** (Expiry Date, Name, Quantity, Category)

### 🛒 Shopping List
- **Add Items** with priority (low/medium/high) and category
- **Mark Complete** with toggle
- **Family-shared** list with attribution

### 📋 Activity Logs
- **Track All Actions** (medicine added/deleted, members joined, etc.)
- **Icon-coded** log entries
- **Family-wide** visibility

### 🌓 Theme Support
- **Light Mode** / **Dark Mode** / **System** toggle
- **Persisted** preference via AsyncStorage
- **Full adaptation** of all UI elements

### 🔐 Authentication
- **Email/Password** sign in and sign up
- **Google Sign-In** via Firebase Auth
- **Auto-redirect** based on auth state

## 🚀 Tech Stack

- **Framework**: Expo SDK 55, React Native 0.83
- **Navigation**: Expo Router (file-based)
- **Backend**: Firebase Firestore, Firebase Auth
- **Icons**: @expo/vector-icons (Ionicons)
- **State**: React Context API
- **Language**: TypeScript

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd MediStock
npm install
```

### 2. Configure Firebase
Copy your Firebase config into `.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run
```bash
npx expo start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── _layout.tsx           # Root layout (providers + auth routing)
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tab navigation
│   │   ├── index.tsx         # Dashboard
│   │   ├── search.tsx        # Search & filter
│   │   ├── family.tsx        # Family management
│   │   └── settings.tsx      # Settings & theme toggle
│   ├── auth/
│   │   ├── signin.tsx        # Sign in
│   │   └── signup.tsx        # Sign up
│   └── medicines/
│       ├── add.tsx           # Add medicine form
│       ├── shopping.tsx      # Shopping list
│       └── logs.tsx          # Activity logs
├── contexts/
│   ├── AuthContext.tsx       # Firebase auth state
│   ├── FamilyContext.tsx     # Family CRUD operations
│   └── ThemeContext.tsx      # Dark/light theme toggle
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   ├── activityLogger.ts     # Activity log helper
│   └── utils.ts              # Date/expiry utilities
└── types/
    └── index.ts              # TypeScript interfaces
```

## 📱 Screens

| Screen | Description |
|--------|-------------|
| Dashboard | Stats overview, medicine list, quick actions |
| Search | Full-text search with category/status/sort filters |
| Family | Create/join family, manage members and codes |
| Settings | Profile, theme toggle, navigation links |
| Add Medicine | Grouped form with bottom-sheet pickers |
| Shopping List | Priority-based shared shopping list |
| Activity Logs | Chronological family activity feed |

## 🔧 Scripts

```bash
npx expo start          # Start dev server
npx expo start --android  # Android
npx expo start --ios      # iOS
npx expo start --web      # Web
```

## 📄 License

MIT License

---

**Made with ❤️ for better medicine management**
