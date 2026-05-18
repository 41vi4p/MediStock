# 📋 Version Changelog

## v2.2.0 - UI Polish & About Page (2026-05-18)

### ✨ New Features
- **About Page** with project info, team credits, and social links
- **Theme Toggle** — switch between Light, Dark, and System modes (persisted)
- **Improved Add Medicine UI** — grouped card sections with icons and bottom-sheet pickers
- **Real-time user sync** — AuthContext now listens to user doc changes via onSnapshot
- **Google Sign-In** via Firebase Auth (signInWithPopup)

### 🎨 UI Improvements
- Full dark/light theme support across all screens
- Modern bottom tab bar with outlined/filled icon states
- Auth-gated routing with automatic redirects
- Status bar adapts to theme

### 👥 Team
- David Porathur
- Ayush Ghara
- Swar Churi

---

## v2.0.0 - Expo Migration (2026-05-18)

### 🚀 Major Changes
- **Complete rewrite** from Next.js to Expo React Native
- **Mobile-first** native app with bottom tab navigation
- **Expo Router** file-based navigation system
- **React Native** components replacing web HTML/CSS

### ✨ New Features
- **Dark/Light/System theme toggle** with AsyncStorage persistence
- **Bottom sheet pickers** for medicine form selections
- **Grouped card UI** for Add Medicine form with icons
- **Auth-gated routing** — automatic redirect based on login state
- **Native status bar** adapts to theme

### 🔄 Ported Features (from v1.5.8 web)
- Email/Password authentication
- Google Sign-In via Firebase Auth
- Family management (create, join with 6-char codes, password protection)
- Medicine CRUD (add, delete, mark out of stock)
- Dashboard with stats cards (total, expired, expiring, items)
- Search with category/status/sort filters
- Shopping list with priorities and completion tracking
- Activity logs with icon-coded entries
- Real-time Firestore sync across family members
- Expiry color indicators (green/yellow/red)

### 🏗️ Architecture
- **Expo SDK 55** with React Native 0.83
- **Firebase JS SDK** (getAuth, getFirestore)
- **React Context** for state (Auth, Family, Theme)
- **TypeScript** strict mode
- **@expo/vector-icons** (Ionicons) replacing lucide-react

### 📱 Platform Support
- Android (via Expo Go or build)
- iOS (via Expo Go or build)
- Web (via Expo web export)

---

## Previous Versions (Next.js Web App)

### v1.5.8
- Shopping List integration on dashboard
- Enhanced mobile dashboard with CSS grid
- Out of Stock management
- Delete functionality with confirmations

### v1.5.0
- Family Code System (6-character codes)
- Password Protection (bcrypt-encrypted)
- Enhanced Mobile UI
- Improved Security

### v1.0.0
- Initial release with medicine tracking
- Firebase authentication
- Family sharing
- Expiry monitoring
