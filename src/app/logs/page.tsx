'use client';

import Layout from '@/components/Layout/Layout';
import { FileText, Calendar, User, Settings, Plus, AlertTriangle } from 'lucide-react';

export default function ActivityLogs() {
  // Mock data for demonstration
  const logs = [
    {
      id: '1',
      type: 'medicine_added',
      user: 'John Doe',
      description: 'Added Paracetamol to medicine inventory',
      timestamp: new Date('2024-01-15T10:30:00'),
      icon: Plus,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      id: '2',
      type: 'user_signin',
      user: 'Jane Smith',
      description: 'Signed in to the application',
      timestamp: new Date('2024-01-15T09:15:00'),
      icon: User,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      id: '3',
      type: 'medicine_expired',
      user: 'System',
      description: 'Aspirin has expired',
      timestamp: new Date('2024-01-14T00:00:00'),
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      id: '4',
      type: 'settings_updated',
      user: 'John Doe',
      description: 'Updated notification preferences',
      timestamp: new Date('2024-01-13T16:45:00'),
      icon: Settings,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    },
  ];

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Activity Logs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track all activities and changes in your medicine inventory
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Activity
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No activity logs
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Activity logs will appear here as you use the application
                </p>
              </div>
            ) : (
              logs.map((log) => {
                const Icon = log.icon;
                return (
                  <div key={log.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${log.bgColor}`}>
                        <Icon className={`h-5 w-5 ${log.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.description}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          by {log.user}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Coming Soon
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Activity logging system is currently in development. This page shows sample data for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}