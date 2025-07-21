'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  Users, 
  Plus, 
  UserMinus, 
  Crown, 
  Calendar,
  AlertCircle,
  Copy,
  Key,
  RefreshCw,
  Info,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export default function FamilyManagement() {
  const { user } = useAuth();
  const { family, loading, createFamily, removeMember, regenerateFamilyCode, joinFamilyWithCode, changeFamilyPassword } = useFamily();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [familyName, setFamilyName] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showCodeInfo, setShowCodeInfo] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await createFamily(familyName, familyDescription, familyPassword || undefined);
      setShowCreateForm(false);
      setFamilyName('');
      setFamilyDescription('');
      setFamilyPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create family');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!confirm('Are you sure you want to regenerate the family code? The old code will no longer work.')) {
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      await regenerateFamilyCode();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to regenerate code');
    } finally {
      setFormLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a family code');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      await joinFamilyWithCode(joinCode.trim(), joinPassword || undefined);
      setShowJoinForm(false);
      setJoinCode('');
      setJoinPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join family');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      await changeFamilyPassword(newPassword || undefined);
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setFormLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the family?`)) {
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      await removeMember(userId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setFormLoading(false);
    }
  };

  const currentUserMember = family?.members.find(member => member.userId === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Family Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {family ? 'Manage your family members and medicine inventory access' : 'Create a family to share your medicine inventory'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {!family && (
          <div className="text-center py-8">
            <div className="flex justify-center space-x-4">
              {!showCreateForm && !showJoinForm && (
                <>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create Family
                  </button>
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Join Family
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Join Family Form */}
        {!family && showJoinForm && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Join a Family
              </h2>
            </div>
            <form onSubmit={handleJoinFamily} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Family Code *
                  </label>
                  <input
                    type="text"
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center text-lg font-mono tracking-wider"
                    placeholder="ABC123"
                  />
                </div>
                
                <div>
                  <label htmlFor="joinPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password (if required)
                  </label>
                  <input
                    type="password"
                    id="joinPassword"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter password if family is protected"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false);
                    setJoinCode('');
                    setJoinPassword('');
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
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
        )}

        {((!family && showCreateForm) || (family && showCreateForm)) && (
          /* Create Family Form */
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Create Your Family
              </h2>
            </div>
            <form onSubmit={handleCreateFamily} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Family Name *
                  </label>
                  <input
                    type="text"
                    id="familyName"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., The Smith Family"
                  />
                </div>
                
                <div>
                  <label htmlFor="familyDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="familyDescription"
                    value={familyDescription}
                    onChange={(e) => setFamilyDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of your family group"
                  />
                </div>
                
                <div>
                  <label htmlFor="familyPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    id="familyPassword"
                    value={familyPassword}
                    onChange={(e) => setFamilyPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Leave blank for no password"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Setting a password will require new members to enter it when joining
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                {family && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFamilyName('');
                      setFamilyDescription('');
                      setFamilyPassword('');
                      setError('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {formLoading ? 'Creating...' : 'Create Family'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Family Management Interface - Only show if user has a family */}
        {family && (
          <div className="space-y-6">
            {/* Family Info */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {family?.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowCodeInfo(!showCodeInfo)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <Info className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Family </span>Code
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <Lock className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Password</span>
                          <span className="sm:hidden">Pass</span>
                        </button>
                        <button
                          onClick={handleRegenerateCode}
                          disabled={formLoading}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">New </span>Code
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {family?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {family?.description}
                  </p>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span>Created on {formatDate(family?.createdAt || new Date())}</span>
                    <span className="hidden sm:inline mx-2">•</span>
                    <span>{family?.members.length || 0} member{(family?.members.length || 0) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Code Info */}
            {showCodeInfo && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Family Code & Instructions
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Family Code
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <code className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md text-lg font-mono font-bold tracking-wider text-center sm:text-left flex-1 sm:flex-none">
                          {family?.familyCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(family?.familyCode || '')}
                          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </button>
                      </div>
                    </div>
                    
                    {family?.passwordHash && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                        <div className="flex">
                          <Key className="h-5 w-5 text-yellow-400 mr-2" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            This family is password protected. Members will need the password to join.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">How to invite members:</h4>
                      <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                        <li>Share the family code: <strong>{family?.familyCode}</strong></li>
                        {family?.passwordHash && <li>Share the family password (if set)</li>}
                        <li>Ask them to go to Family Management and click Join Family</li>
                        <li>They enter the code{family?.passwordHash ? ' and password' : ''} to join</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Form */}
            {showPasswordForm && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Change Family Password
                  </h3>
                </div>
                <form onSubmit={handleChangePassword} className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      <div className="flex">
                        <Info className="h-5 w-5 text-blue-400 mr-2" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <p className="font-medium mb-1">Password Options:</p>
                          <ul className="space-y-1">
                            <li>• Enter a new password to update protection</li>
                            <li>• Leave blank to remove password protection</li>
                            <li>• Minimum 6 characters if setting a password</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password (Optional)
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter new password or leave blank to remove"
                      />
                    </div>
                    
                    {newPassword && (
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setError('');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {formLoading ? 'Updating...' : (newPassword ? 'Update Password' : 'Remove Password')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Family Members */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Family Members ({family?.members.length || 0})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {family?.members.map((member) => (
                  <div key={member.userId} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                      {member.photoURL ? (
                        <Image
                          className="h-12 w-12 rounded-full"
                          src={member.photoURL}
                          alt={member.displayName}
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {member.displayName}
                          </h4>
                          {member.role === 'admin' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          {member.userId === user?.id && (
                            <span className="text-sm text-blue-600 dark:text-blue-400">(You)</span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{member.email}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDate(member.joinedAt)}</span>
                        </div>
                      </div>
                      </div>
                      
                      {isAdmin && member.userId !== user?.id && member.userId !== family?.createdBy && (
                        <button
                          onClick={() => handleRemoveMember(member.userId, member.displayName)}
                          disabled={formLoading}
                          className="inline-flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}