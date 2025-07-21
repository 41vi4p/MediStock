'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  Users, 
  Key, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function JoinFamily() {
  const { user } = useAuth();
  const { joinFamilyWithCode } = useFamily();
  const router = useRouter();
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [password, setPassword] = useState('');

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyCode.trim()) {
      setError('Please enter a family code');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      await joinFamilyWithCode(familyCode.trim(), password || undefined);
      router.push('/family');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join family');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Please sign in to join a family.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            href="/family"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Family Management
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join a Family
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter the family code to join an existing family
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Join Family
            </h2>
          </div>
          
          <form onSubmit={handleJoinFamily} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="familyCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Family Code *
                </label>
                <input
                  type="text"
                  id="familyCode"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                  required
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-lg font-mono tracking-wider"
                  placeholder="ABC123"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password (if required)
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter password if family is protected"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="h-4 w-4 mr-2" />
                {formLoading ? 'Joining...' : 'Join Family'}
              </button>
            </div>
          </form>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-2">
              <Key className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">Need a family code?</p>
                <p>Ask a family admin to share their 6-character family code with you.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}