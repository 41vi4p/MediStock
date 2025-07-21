'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  onSnapshot,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Family, FamilyMember, FamilyInvitation } from '@/types';
import ActivityLogger from '@/lib/activityLogger';

interface FamilyContextType {
  family: Family | null;
  loading: boolean;
  createFamily: (name: string, description?: string) => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  joinFamily: (familyId: string) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.familyId) {
      setFamily(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'families', user.familyId),
      (doc) => {
        if (doc.exists()) {
          const familyData = doc.data();
          setFamily({
            id: doc.id,
            ...familyData,
            createdAt: familyData.createdAt?.toDate() || new Date(),
            updatedAt: familyData.updatedAt?.toDate() || new Date(),
            members: familyData.members?.map((member: FamilyMember & { joinedAt: { toDate(): Date } }) => ({
              ...member,
              joinedAt: member.joinedAt?.toDate() || new Date(),
            })) || [],
            invitations: familyData.invitations?.map((invitation: FamilyInvitation & { createdAt: { toDate(): Date }, expiresAt: { toDate(): Date } }) => ({
              ...invitation,
              createdAt: invitation.createdAt?.toDate() || new Date(),
              expiresAt: invitation.expiresAt?.toDate() || new Date(),
            })) || [],
          } as Family);
        } else {
          setFamily(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching family:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.familyId]);

  const createFamily = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    const now = new Date();
    const familyData = {
      name,
      description,
      createdBy: user.id,
      members: [{
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'admin' as const,
        joinedAt: now,
      }],
      invitations: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const familyRef = await addDoc(collection(db, 'families'), familyData);

    // Update user with familyId
    await updateDoc(doc(db, 'users', user.id), {
      familyId: familyRef.id,
      updatedAt: serverTimestamp(),
    });

    // Log family creation
    await ActivityLogger.logFamilyCreated(
      user.id,
      user.displayName,
      familyRef.id,
      name
    );
  };

  const inviteMember = async (email: string) => {
    if (!family || !user) throw new Error('Family or user not found');

    // Check if user is already a member
    const existingMember = family.members.find(member => member.email === email);
    if (existingMember) {
      throw new Error('User is already a family member');
    }

    // Check if there's already a pending invitation
    const existingInvitation = family.invitations?.find(
      inv => inv.email === email && inv.status === 'pending'
    );
    if (existingInvitation) {
      throw new Error('Invitation already sent to this email');
    }

    const now = new Date();
    const invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      invitedBy: user.id,
      status: 'pending' as const,
      createdAt: now,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    const updatedInvitations = [...(family.invitations || []), invitation];

    await updateDoc(doc(db, 'families', family.id), {
      invitations: updatedInvitations,
      updatedAt: serverTimestamp(),
    });

    // Log member invitation
    await ActivityLogger.logMemberInvited(
      user.id,
      user.displayName,
      family.id,
      email
    );
  };

  const removeMember = async (userId: string) => {
    if (!family || !user) throw new Error('Family or user not found');

    // Check if current user is admin
    const currentUserMember = family.members.find(member => member.userId === user.id);
    if (currentUserMember?.role !== 'admin') {
      throw new Error('Only admins can remove members');
    }

    // Cannot remove yourself if you're the creator
    if (userId === family.createdBy) {
      throw new Error('Family creator cannot be removed');
    }

    const memberToRemove = family.members.find(member => member.userId === userId);
    const updatedMembers = family.members.filter(member => member.userId !== userId);

    await updateDoc(doc(db, 'families', family.id), {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    // Remove familyId from the user's profile
    await updateDoc(doc(db, 'users', userId), {
      familyId: null,
      updatedAt: serverTimestamp(),
    });

    // Log member removal
    if (memberToRemove) {
      await ActivityLogger.logMemberRemoved(
        user.id,
        user.displayName,
        family.id,
        memberToRemove.displayName
      );
    }
  };

  const leaveFamily = async () => {
    if (!family || !user) throw new Error('Family or user not found');

    // If user is the creator, they cannot leave unless they transfer ownership
    if (user.id === family.createdBy) {
      throw new Error('Family creator cannot leave. Transfer ownership first.');
    }

    const updatedMembers = family.members.filter(member => member.userId !== user.id);

    await updateDoc(doc(db, 'families', family.id), {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    // Remove familyId from user's profile
    await updateDoc(doc(db, 'users', user.id), {
      familyId: null,
      updatedAt: serverTimestamp(),
    });
  };

  const joinFamily = async (familyId: string) => {
    if (!user) throw new Error('User not authenticated');

    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (!familyDoc.exists()) {
      throw new Error('Family not found');
    }

    const familyData = familyDoc.data() as Family;
    
    // Check if user has a pending invitation
    const invitation = familyData.invitations?.find(
      inv => inv.email === user.email && inv.status === 'pending'
    );

    if (!invitation) {
      throw new Error('No pending invitation found');
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    const newMember: FamilyMember = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'member',
      joinedAt: new Date(),
    };

    const updatedMembers = [...familyData.members, newMember];
    const updatedInvitations = familyData.invitations?.map(inv => 
      inv.email === user.email ? { ...inv, status: 'accepted' as const } : inv
    ) || [];

    await updateDoc(doc(db, 'families', familyId), {
      members: updatedMembers,
      invitations: updatedInvitations,
      updatedAt: serverTimestamp(),
    });

    // Update user with familyId
    await updateDoc(doc(db, 'users', user.id), {
      familyId,
      updatedAt: serverTimestamp(),
    });

    // Log invitation acceptance
    await ActivityLogger.logInvitationAccepted(
      user.id,
      user.displayName,
      familyId
    );
  };

  const value = {
    family,
    loading,
    createFamily,
    inviteMember,
    removeMember,
    leaveFamily,
    joinFamily,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}