# MediStock - Project Documentation

## Problem Statement

Most households lack a system to track medicine expiry dates, quantities, and storage locations. This leads to consumption of expired medicines, wastage, and duplicate purchases. Family members have no shared visibility of available medicines.

MediStock provides a family-shared digital medicine inventory with real-time expiry tracking and collaborative management.

---

## Block Diagram

```
┌───────────────────────────────────────────┐
│           MediStock Mobile App            │
│          (Expo / React Native)            │
├───────────────────────────────────────────┤
│  Dashboard │ Search │ Family │ Settings   │
├───────────────────────────────────────────┤
│  AuthContext │ FamilyContext │ ThemeContext│
├───────────────────────────────────────────┤
│            Firebase Backend               │
│  ┌─────────────┐  ┌───────────────────┐  │
│  │ Firebase Auth│  │ Firestore DB      │  │
│  │ (Google +   │  │ (Medicines,       │  │
│  │  Email)     │  │  Families, Logs)  │  │
│  └─────────────┘  └───────────────────┘  │
└───────────────────────────────────────────┘
```

---

## Description

MediStock is a cross-platform mobile app built with Expo and React Native. It enables families to collaboratively manage home medicine inventory.

Key capabilities include real-time expiry monitoring with color-coded alerts, family sharing via unique join codes, role-based access control, a shared shopping list, and activity logging.

The app uses Firebase Firestore for real-time sync and Firebase Auth for secure authentication.

---

## Use Cases

| # | Actor | Use Case |
|---|-------|----------|
| 1 | User | Sign up / Sign in (Email or Google) |
| 2 | User | Create family group with optional password |
| 3 | User | Join family using 6-character code |
| 4 | Member | Add medicine with details (name, qty, expiry, category, location) |
| 5 | Member | View dashboard with stats and expiry alerts |
| 6 | Member | Search and filter medicines |
| 7 | Member | Mark medicine as out of stock |
| 8 | Member | Delete medicine from inventory |
| 9 | Member | Add/complete items on shared shopping list |
| 10 | Member | View activity logs |
| 11 | Admin | Remove members, regenerate codes, manage passwords |
| 12 | User | Toggle between light/dark/system theme |

---

## Components Used

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Expo SDK 55 + React Native 0.83 | Cross-platform mobile UI |
| Navigation | Expo Router | File-based screen routing |
| Database | Firebase Firestore | Real-time NoSQL storage |
| Auth | Firebase Auth | Email/password + Google OAuth |
| State | React Context API | Auth, Family, Theme state |
| Language | TypeScript | Type safety |
| Icons | Ionicons (@expo/vector-icons) | UI icons |
| Encryption | bcryptjs | Password hashing |
| Local Storage | AsyncStorage | Theme preference |

---

## Detailed Description of Components

### Authentication Module
Manages Firebase Auth state. Listens to user document in real-time for immediate updates. Supports email/password and Google Sign-In.

### Family Management Module
Creates families with unique 6-character codes. Supports optional bcrypt-hashed passwords. Admins can remove members, regenerate codes, and manage passwords.

### Medicine Management
Real-time Firestore listener ordered by expiry. Color-coded indicators: green (safe), yellow (≤30 days), red (expired). Grouped form with bottom-sheet pickers.

### Search & Filter Engine
Client-side filtering on snapshot data. Text search, category chips, status filters, and sort options.

### Shopping List
Shared family list with priority levels. Toggle completion with user attribution. Real-time sync.

### Activity Logger
Logs all actions (medicine CRUD, auth events, family events) to Firestore with server timestamps.

### Theme System
Three modes: Light, Dark, System. 17 semantic colors per theme. Persisted to AsyncStorage.

---

## Full Circuit Diagram

MediStock is a purely software-based application with no hardware components.

```
┌──────────────┐       HTTPS/WebSocket       ┌────────────────┐
│  Mobile App  │ ◄─────────────────────────► │ Firebase Cloud  │
│  (Expo)      │                             │ - Firestore     │
│              │                             │ - Auth          │
└──────┬───────┘                             └────────────────┘
       │ Local
       ▼
┌──────────────┐
│ AsyncStorage │
│ (Theme Pref) │
└──────────────┘
```

---

## Implementation Details

**Stack**: Expo SDK 55, React Native 0.83, TypeScript, Firebase JS SDK.

**Routing**: Expo Router with file-based navigation. Auth-gated routing redirects unauthenticated users.

**Real-time sync**: All data uses `onSnapshot` listeners for instant updates across family members.

**Password security**: bcryptjs (pure JS) for family password hashing — no native dependencies needed.

**State management**: Three React Contexts (Auth, Family, Theme) cover all global state.

**Search**: Client-side filtering since family inventories are typically <100 items.

**Build**:
```bash
npx expo start          # Development
eas build --platform android  # Production
```

---

## Future Scope

- Push notifications for expiry alerts (7 days, 3 days, 1 day before)
- Barcode scanner to auto-fill medicine details
- Dosage reminders with local notifications
- Photo capture for medicine packaging
- PDF export of inventory for doctor visits
- Multi-language support (Hindi, Marathi)
- Offline mode with Firestore persistence
- AI-powered medicine alternative suggestions
- Pharmacy integration for direct ordering
- Health records linking medicines to conditions

---

## Unique Selling Point (USP)

**Family-first design** — Built around collaboration, not individual use. Real-time sync, shared lists, and activity visibility across all members.

**Zero-friction onboarding** — Join a family with just a 6-character code. No invitations or approvals needed.

**Expiry intelligence** — Color-coded visual system makes it instantly clear which medicines need attention.

**Cross-platform** — Single codebase runs on Android, iOS, and Web via Expo.

**Privacy-conscious** — No data shared outside the family group. Optional password protection for access control.

---

## References

1. Expo Documentation — https://docs.expo.dev/
2. React Native — https://reactnative.dev/docs/getting-started
3. Firebase — https://firebase.google.com/docs
4. Cloud Firestore — https://firebase.google.com/docs/firestore
5. Expo Router — https://docs.expo.dev/router/introduction/
6. TypeScript — https://www.typescriptlang.org/docs/
7. bcryptjs — https://github.com/dcodeIO/bcrypt.js
8. AsyncStorage — https://react-native-async-storage.github.io/async-storage/
9. WHO Guidelines on Medicine Storage — https://www.who.int/publications
