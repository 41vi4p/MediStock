'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  AlertTriangle, 
  Search, 
  Settings, 
  LogOut,
  Pill,
  Users,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Add Medicine', href: '/medicines/add', icon: Plus },
  { name: 'Expired', href: '/medicines/expired', icon: AlertTriangle },
  { name: 'Search', href: '/medicines/search', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { family } = useFamily();
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const ProfileDropdown = () => (
    <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            {user?.photoURL ? (
              <Image
                className="h-8 w-8 rounded-full"
                src={user.photoURL}
                alt={user.displayName}
                width={32}
                height={32}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        
        <Link
          href="/family"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Users className="h-4 w-4 mr-3" />
          Family Management
          {!family && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
              Setup
            </span>
          )}
        </Link>
        
        <Link
          href="/settings"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Link>
        
        <Link
          href="/logs"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FileText className="h-4 w-4 mr-3" />
          Activity Logs
        </Link>
        
        <button
          onClick={() => {
            setIsProfileOpen(false);
            handleSignOut();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Pill className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MediStock
              </span>
            </Link>
            {family && (
              <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-600 hidden md:block">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {family.name}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200 dark:border-gray-600">
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user?.photoURL ? (
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={user.photoURL}
                      alt={user.displayName}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden lg:block truncate max-w-32">{user?.displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isProfileOpen && <ProfileDropdown />}
              </div>
            </div>
          </div>

          {/* Mobile Profile Button */}
          <div className="md:hidden flex items-center">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {user?.photoURL ? (
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
              
              {isProfileOpen && <ProfileDropdown />}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}