'use client';

import { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  Users, 
  Plus, 
  UserMinus, 
  Mail, 
  Crown, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export default function FamilyManagement() {
  const { user } = useAuth();
  const { family, loading, createFamily, inviteMember, removeMember } = useFamily();
  
  const [showCreateForm, setShowCreateForm] = useState(!family);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [familyName, setFamilyName] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await createFamily(familyName, familyDescription);
      setShowCreateForm(false);
      setFamilyName('');
      setFamilyDescription('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create family');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await inviteMember(inviteEmail);
      setShowInviteForm(false);
      setInviteEmail('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setFormLoading(false);
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

        {!family || showCreateForm ? (
          /* Create Family Form */
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Create Your Family
              </h2>
            </div>
            <form onSubmit={handleCreateFamily} className="p-6">
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
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                {family && (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {formLoading ? 'Creating...' : 'Create Family'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Family Management Interface */
          <div className="space-y-6">
            {/* Family Info */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {family.name}
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={() => setShowInviteForm(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Member
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {family.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {family.description}
                  </p>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created on {formatDate(family.createdAt)} • {family.members.length} member{family.members.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Invite Form */}
            {showInviteForm && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Invite Family Member
                  </h3>
                </div>
                <form onSubmit={handleInviteMember} className="p-6">
                  <div className="mb-4">
                    <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {formLoading ? 'Sending...' : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Family Members */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Family Members ({family.members.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {family.members.map((member) => (
                  <div key={member.userId} className="p-6 flex items-center justify-between">
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
                    
                    {isAdmin && member.userId !== user?.id && member.userId !== family.createdBy && (
                      <button
                        onClick={() => handleRemoveMember(member.userId, member.displayName)}
                        disabled={formLoading}
                        className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invitations */}
            {family.invitations && family.invitations.filter(inv => inv.status === 'pending').length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pending Invitations
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {family.invitations
                    .filter(inv => inv.status === 'pending')
                    .map((invitation, index) => (
                      <div key={index} className="p-6 flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {invitation.email}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>Invited {formatDate(invitation.createdAt)}</span>
                            <span>•</span>
                            <span>Expires {formatDate(invitation.expiresAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}