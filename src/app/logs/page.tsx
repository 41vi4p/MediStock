'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import Layout from '@/components/Layout/Layout';
import { ActivityLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  FileText, 
  Calendar, 
  User, 
  Settings, 
  Plus, 
  Users,
  Filter,
  X,
  Trash2,
  Edit,
  UserPlus,
  UserMinus,
  Mail,
  Shield,
  Pill,
  LogIn,
  UserCheck,
  Home
} from 'lucide-react';

type FilterType = 'all' | 'medicine' | 'family' | 'auth' | 'settings';

const iconMap = {
  medicine_added: Plus,
  medicine_updated: Edit,
  medicine_deleted: Trash2,
  user_signin: LogIn,
  user_signup: UserCheck,
  family_created: Home,
  member_added: UserPlus,
  member_removed: UserMinus,
  member_invited: Mail,
  invitation_accepted: UserCheck,
  settings_updated: Settings,
  password_changed: Shield,
};

const colorMap = {
  medicine_added: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
  medicine_updated: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
  medicine_deleted: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
  user_signin: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
  user_signup: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
  family_created: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20',
  member_added: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
  member_removed: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
  member_invited: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
  invitation_accepted: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
  settings_updated: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20',
  password_changed: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20',
};

const categoryMap = {
  medicine_added: 'medicine',
  medicine_updated: 'medicine',
  medicine_deleted: 'medicine',
  user_signin: 'auth',
  user_signup: 'auth',
  family_created: 'family',
  member_added: 'family',
  member_removed: 'family',
  member_invited: 'family',
  invitation_accepted: 'family',
  settings_updated: 'settings',
  password_changed: 'settings',
};

export default function ActivityLogs() {
  const { user } = useAuth();
  const { family } = useFamily();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');

  useEffect(() => {
    if (!user?.familyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'activityLogs'),
      where('familyId', '==', user.familyId),
      orderBy('createdAt', 'desc'),
      limit(100) // Limit to last 100 logs for performance
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ActivityLog[];
      
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching logs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.familyId]);

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filter by category
    if (filter !== 'all') {
      filtered = filtered.filter(log => categoryMap[log.type as keyof typeof categoryMap] === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (selectedDateRange) {
        case '24h':
          cutoff.setHours(now.getHours() - 24);
          break;
        case '7d':
          cutoff.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoff.setDate(now.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(log => log.createdAt >= cutoff);
    }

    return filtered;
  }, [logs, filter, searchTerm, selectedDateRange]);

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setSelectedDateRange('all');
  };

  const hasActiveFilters = filter !== 'all' || searchTerm || selectedDateRange !== 'all';

  const getCategoryCount = (category: FilterType) => {
    if (category === 'all') return logs.length;
    return logs.filter(log => categoryMap[log.type as keyof typeof categoryMap] === category).length;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user?.familyId) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Family Setup
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to create or join a family to view activity logs.
            </p>
            <a
              href="/family"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Set Up Family
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Activity Logs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track all activities and changes in your medicine inventory
          </p>
          {family && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing activities for {family.name}
            </p>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          {/* Search Bar */}
          <div className="relative mb-4">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activities by description, user, or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {hasActiveFilters && '(Active)'}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="space-y-2">
                    {([
                      { key: 'all', label: 'All Activities', icon: FileText },
                      { key: 'medicine', label: 'Medicine', icon: Pill },
                      { key: 'family', label: 'Family', icon: Users },
                      { key: 'auth', label: 'Authentication', icon: User },
                      { key: 'settings', label: 'Settings', icon: Settings },
                    ] as const).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          filter === key
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {label} ({getCategoryCount(key)})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Range
                  </label>
                  <div className="space-y-2">
                    {([
                      { key: 'all', label: 'All Time' },
                      { key: '24h', label: 'Last 24 Hours' },
                      { key: '7d', label: 'Last 7 Days' },
                      { key: '30d', label: 'Last 30 Days' },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setSelectedDateRange(key)}
                        className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedDateRange === key
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Activity Timeline ({filteredLogs.length})
            </h2>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more activities.'
                  : 'Activities will appear here as you use the application.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => {
                const Icon = iconMap[log.type as keyof typeof iconMap] || FileText;
                const colorClass = colorMap[log.type as keyof typeof colorMap] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';

                return (
                  <div key={log.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.description}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(log.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {log.userName}
                          </span>
                          <span className="capitalize">
                            {log.type.replace('_', ' ')}
                          </span>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              Details available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {logs.length >= 100 && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Activity Limit Reached
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Showing the most recent 100 activities. Older activities are archived for performance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}