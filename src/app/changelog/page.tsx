'use client';

export const dynamic = 'force-dynamic';

import Layout from '@/components/Layout/Layout';
import { APP_VERSION } from '@/lib/version';
import { FileText, ArrowLeft, Calendar, Code, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Changelog() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Changelog
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track the development and feature additions to MediStock
          </p>
        </div>

        <div className="space-y-8">
          {/* Version 1.0.0 */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Version {APP_VERSION.version}
                </h2>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {APP_VERSION.releaseDate}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    🎉 Initial Release
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Welcome to MediStock v1.0.0! This is the first stable release of our medicine inventory management system.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Core Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {APP_VERSION.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="h-1.5 w-1.5 bg-green-600 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Family Features
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></div>
                      Create and manage family groups
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></div>
                      Invite family members via email
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></div>
                      Role-based permissions (admin/member)
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></div>
                      Shared medicine inventory access
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security & Privacy
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-purple-600 rounded-full mr-2"></div>
                      Firebase Authentication with Google OAuth
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-purple-600 rounded-full mr-2"></div>
                      Secure Firestore database with access rules
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-purple-600 rounded-full mr-2"></div>
                      Family-based data isolation
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-purple-600 rounded-full mr-2"></div>
                      Comprehensive activity logging
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Technical Details
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Framework:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Next.js 15 with App Router</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Language:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">TypeScript</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Database:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Firebase Firestore</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Styling:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Tailwind CSS</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Icons:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Lucide React</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Authentication:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Firebase Auth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Future Versions Placeholder */}
          <div className="bg-gray-50 dark:bg-gray-800/50 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 border-dashed">
            <div className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Future Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                New versions and features will be documented here as they are released.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}