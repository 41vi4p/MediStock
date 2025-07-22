'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { APP_VERSION, getVersionInfo } from '@/lib/version';
import ActivityLogger from '@/lib/activityLogger';
import { 
  User, 
  Users, 
  Moon, 
  Sun, 
  FileText, 
  Bell,
  Shield,
  HelpCircle,
  Info,
  Pill,
  Code,
  Heart,
  ExternalLink
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const versionInfo = getVersionInfo();

  const handleNotificationToggle = async () => {
    setNotifications(!notifications);
    
    // Log notification settings change
    if (user?.familyId) {
      await ActivityLogger.logSettingsUpdated(
        user.id,
        user.displayName,
        user.familyId,
        'notifications',
        { enabled: !notifications }
      );
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account and application preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                {user?.photoURL ? (
                  <Image
                    className="h-16 w-16 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName}
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {user?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {user?.displayName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Family Management */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Family Management
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage family members who can access your medicine inventory
              </p>
              <Link
                href="/family"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Manage Family Members
              </Link>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                {theme === 'dark' ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
                Appearance
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  aria-label="Toggle dark mode"
                  title="Toggle dark mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Expiry Notifications
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get notified when medicines are about to expire
                    </p>
                  </div>
                  <button
                    onClick={handleNotificationToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    title={notifications ? "Disable expiry notifications" : "Enable expiry notifications"}
                    aria-label={notifications ? "Disable expiry notifications" : "Enable expiry notifications"}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Activity Logs
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View all activities and changes made to your medicine inventory
              </p>
              <Link
                href="/logs"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                View Activity Logs
              </Link>
            </div>
          </div>

         

          

          {/* About & Version */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Info className="h-5 w-5 mr-2" />
                About MediStock
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* App Info */}
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                    <Pill className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      MediStock {versionInfo.fullVersion}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      A comprehensive medicine inventory management system for families
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Code className="h-4 w-4 mr-1" />
                        Built with Next.js & Firebase
                      </span>
                      
                    </div>
                  </div>
                </div>

                {/* Version Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Version Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Version:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{versionInfo.fullVersion}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Release Date:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{versionInfo.releaseDate}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Build:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{versionInfo.buildType}</span>
                    </div>
                  
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Key Features in {versionInfo.fullVersion}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {APP_VERSION.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button 
                    onClick={() => window.open('/changelog', '_blank')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Changelog
                  </button>
                  <button 
                    onClick={() => window.open('https://github.com/41vi4p/MediStock', '_blank')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    GitHub Repository
                  </button>
                  <button 
                    onClick={() => window.open('https://github.com/41vi4p/MediStock/issues', '_blank')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Report Issues
                  </button>
                </div>

                {/* Copyright */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    © 2025 MediStock by David Porathur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}