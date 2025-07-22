# 💊 MediStock - Medicine Inventory Management

**Version 1.5.8** - A comprehensive web application for managing home medicine inventory with expiry tracking, family sharing, and intelligent notifications. Built with Next.js, TypeScript, and Firebase.

🔗 **[View Changelog](VERSION_CHANGELOG.md)** 


## ✨ Features

### 🏠 **Family Medicine Management**
- **Family Groups**: Create and manage medicine inventory for your entire family
- **6-Character Family Codes**: Simple, secure family joining system (no email required)
- **Optional Password Protection**: Secure families with bcrypt-encrypted passwords
- **Role-Based Access**: Admin and member roles with appropriate permissions
- **Real-time Sync**: All family members see inventory updates instantly
- **Code Regeneration**: Admins can generate new family codes anytime

### 💊 **Medicine Tracking**
- **Comprehensive Database**: Store medicine details, quantities, categories, and locations
- **Expiry Monitoring**: Track expiration dates with visual warnings and alerts
- **Smart Categories**: Organize medicines by type (Pain Relief, Antibiotics, Vitamins, etc.)
- **Location Tracking**: Know exactly where each medicine is stored

### 🔍 **Advanced Search & Filtering**
- **Powerful Search**: Find medicines by name, description, or category
- **Multiple Filters**: Filter by category, location, stock status, expiry status
- **Out of Stock Management**: Mark medicines as out of stock with tracking
- **Sorting Options**: Sort by name, expiry date, quantity, or category
- **Quick Access**: Dedicated expired medicines page with filtering
- **Delete Functionality**: Remove medicines with confirmation dialogs

### 📱 **Enhanced Mobile Experience**
- **Mobile-First**: Fully optimized for phones and tablets
- **Responsive Dashboard**: Shopping list integration with tiled button layouts
- **Touch-Friendly Forms**: Large tap targets and intuitive layouts
- **Improved Dropdown**: Email overflow handling with proper text truncation
- **Adaptive Navigation**: Desktop navbar transforms to bottom navigation on mobile
- **Professional Mobile UI**: Clean interface that works perfectly on small screens
- **Grid-Based Layout**: Modern CSS grid for reliable responsive design

### 🔐 **Authentication & Security**
- **Google OAuth**: Quick sign-in with Google account
- **Email/Password**: Traditional authentication option
- **Secure Sessions**: Firebase authentication with automatic session management
- **Protected Routes**: Family-based access control

### 🌓 **Modern UI/UX**
- **Dark/Light Theme**: Toggle between themes (system coming soon)
- **Modern Icons**: Beautiful Lucide React icons throughout
- **Responsive Cards**: Clean, card-based interface with mobile optimization
- **Loading States**: Smooth loading animations and states
- **Shopping List Integration**: Quick access from dashboard with purple theming
- **Confirmation Modals**: Safe deletion and action confirmations

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Firestore, Firebase Auth
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)
- **Build Tool**: Turbopack (Next.js)

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project setup
- Google OAuth credentials (optional but recommended)

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/medistock.git
cd medistock
npm install
```

### 2. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication (Email/Password and Google Sign-in)
   - Create a Firestore database

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Enable Google Sign-in (optional)
   - Add your domain to authorized domains

3. **Set Up Firestore**
   - Create a Firestore database in production mode
   - Configure security rules (see below)

### 3. Environment Configuration

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Family members can read/write medicines in their family
    match /medicines/{medicineId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/families/$(resource.data.familyId)) &&
        request.auth.uid in get(/databases/$(database)/documents/families/$(resource.data.familyId)).data.members[].userId;
    }
    
    // Family management - members can read, admins can write
    match /families/{familyId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.members[].userId;
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.members[?(@.role == 'admin')].userId;
    }
    
    // Activity logs - family members can read, system can write
    match /activityLogs/{logId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/families/$(resource.data.familyId)) &&
        request.auth.uid in get(/databases/$(database)/documents/families/$(resource.data.familyId)).data.members[].userId;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   ├── dashboard/         # Main dashboard
│   ├── family/            # Family management
│   ├── logs/              # Activity logs
│   ├── medicines/         # Medicine management
│   │   ├── add/          # Add medicine form
│   │   ├── expired/      # Expired medicines view
│   │   └── search/       # Search and filter
│   ├── settings/          # User settings
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page redirect
├── components/            # React components
│   └── Layout/           # Layout components
│       ├── BottomNav.tsx # Mobile bottom navigation
│       ├── Layout.tsx    # Main layout wrapper
│       └── Navbar.tsx    # Desktop navigation
├── contexts/             # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── FamilyContext.tsx # Family management state
├── lib/                  # Utility functions
│   ├── firebase.ts      # Firebase configuration
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
    └── index.ts         # Application types
```

## 🎯 Core Features Guide

### Family Management (v1.5.0 Enhanced)
1. **Create Family**: Set up family group with optional password protection
2. **Generate Family Code**: Get unique 6-character code for easy sharing
3. **Invite Members**: Share family code (and password if set) with family members
4. **Join Family**: Enter family code and optional password to join
5. **Manage Security**: Change or remove family passwords anytime (admins only)
6. **Regenerate Codes**: Create new family codes when needed
7. **View Members**: See all family members with their roles and join dates

### Medicine Management
1. **Add Medicines**: Comprehensive form with all details
2. **Track Expiry**: Visual indicators for expired/expiring medicines
3. **Organize**: Categories and storage locations
4. **Search**: Find medicines quickly with filters

### Mobile Experience
1. **Bottom Navigation**: Easy thumb navigation on mobile
2. **Profile Menu**: Access family, settings, and logs from profile icon
3. **Responsive Design**: Adapts to all screen sizes
4. **Touch-Friendly**: Large tap targets and smooth interactions

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Add all Firebase config variables in Vercel dashboard
   - Set production domains in Firebase console

3. **Custom Domain** (Optional)
   - Add custom domain in Vercel dashboard
   - Update Firebase authorized domains

### Other Platforms

The application can be deployed to:
- **Netlify**: Static hosting with serverless functions
- **AWS Amplify**: Full-stack deployment
- **Google Cloud Platform**: Native Firebase integration
- **Self-hosted**: Docker container deployment

## 📱 Mobile App Potential

The responsive design makes this web app perfect for:
- **PWA Conversion**: Add to home screen functionality
- **Mobile Wrapper**: Cordova/PhoneGap integration
- **React Native**: Code sharing opportunities

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Development Guidelines

- **TypeScript**: Maintain strict type safety
- **ESLint**: Follow linting rules
- **Responsive**: Test on multiple screen sizes
- **Accessibility**: Ensure keyboard and screen reader support

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Configuration**
   ```bash
   # Check environment variables
   echo $NEXT_PUBLIC_FIREBASE_API_KEY
   ```

2. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

3. **Authentication Issues**
   - Verify Firebase project settings
   - Check authorized domains
   - Confirm OAuth configuration

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/41vi4p/medistock/issues)
- **Discussions**: [GitHub Discussions](https://github.com/41vi4p/medistock/discussions)
- **Documentation**: Check Firebase and Next.js docs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: Amazing React framework
- **Firebase Team**: Powerful backend services
- **Tailwind CSS**: Beautiful utility-first CSS
- **Lucide**: Gorgeous icon library
- **Vercel**: Excellent deployment platform

## 🔍 What's New in v1.5.8

✅ **Shopping List Integration**: Quick access shopping button on dashboard
✅ **Enhanced Mobile Dashboard**: Proper button tiling with CSS grid layout
✅ **Responsive Design**: Optimized layouts from mobile to desktop
✅ **Out of Stock Management**: Mark and filter medicines by stock status
✅ **Delete Functionality**: Safe medicine deletion with confirmations
✅ **Bulk Operations**: Manage expired medicines and shopping lists efficiently

### Previous in v1.5.0
✅ **Family Code System**: No more email dependencies - simple 6-character codes
✅ **Password Protection**: Optional bcrypt-encrypted family passwords
✅ **Enhanced Mobile UI**: Perfect mobile experience with responsive design
✅ **Improved Security**: Better validation and admin-only operations
✅ **Cleaner Interface**: Conditional content display and better form handling

## 🔮 Roadmap

- [ ] **Dark Theme**: Complete dark mode implementation
- [ ] **Push Notifications**: Expiry reminders
- [ ] **Barcode Scanner**: Quick medicine addition
- [ ] **Analytics Dashboard**: Usage insights
- [ ] **Backup/Export**: Data portability
- [ ] **Multiple Languages**: Internationalization
- [ ] **Medicine Database**: Auto-complete from database
- [ ] **Doctor Integration**: Share with healthcare providers

---

**Made with ❤️ for better medicine management**

*Keep your family healthy with organized medicine tracking!*