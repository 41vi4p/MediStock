'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  doc, 
  updateDoc, 
  collection, 
  onSnapshot,
  serverTimestamp,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Family, FamilyMember } from '@/types';
import bcrypt from 'bcryptjs';
import ActivityLogger from '@/lib/activityLogger';

interface FamilyContextType {
  family: Family | null;
  loading: boolean;
  createFamily: (name: string, description?: string, password?: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  joinFamilyWithCode: (familyCode: string, password?: string) => Promise<void>;
  regenerateFamilyCode: () => Promise<void>;
  changeFamilyPassword: (newPassword?: string) => Promise<void>;
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

  const generateFamilyCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createFamily = async (name: string, description?: string, password?: string) => {
    if (!user) throw new Error('User not authenticated');

    const now = new Date();
    let familyCode = generateFamilyCode();
    
    // Ensure family code is unique
    const familiesRef = collection(db, 'families');
    let codeExists = true;
    while (codeExists) {
      const q = query(familiesRef, where('familyCode', '==', familyCode));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        codeExists = false;
      } else {
        familyCode = generateFamilyCode();
      }
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const familyData = {
      name,
      description,
      createdBy: user.id,
      familyCode,
      passwordHash,
      members: [{
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'admin' as const,
        joinedAt: now,
      }],
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

  const joinFamilyWithCode = async (familyCode: string, password?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Find family by code
    const familiesRef = collection(db, 'families');
    const q = query(familiesRef, where('familyCode', '==', familyCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Family not found with this code');
    }

    const familyDoc = querySnapshot.docs[0];
    const familyData = familyDoc.data() as Family;
    
    // Check if user is already a member
    const existingMember = familyData.members.find(member => member.userId === user.id);
    if (existingMember) {
      throw new Error('You are already a member of this family');
    }

    // Validate password if family has one
    if (familyData.passwordHash) {
      if (!password) {
        throw new Error('This family requires a password');
      }
      const isPasswordValid = await bcrypt.compare(password, familyData.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Incorrect password');
      }
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

    await updateDoc(doc(db, 'families', familyDoc.id), {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    // Update user with familyId
    await updateDoc(doc(db, 'users', user.id), {
      familyId: familyDoc.id,
      updatedAt: serverTimestamp(),
    });

    // Log member joining
    await ActivityLogger.logMemberInvited(
      user.id,
      user.displayName,
      familyDoc.id,
      user.email
    );
  };

  const regenerateFamilyCode = async () => {
    if (!family || !user) throw new Error('Family or user not found');
    
    // Check if current user is admin
    const currentUserMember = family.members.find(member => member.userId === user.id);
    if (currentUserMember?.role !== 'admin') {
      throw new Error('Only admins can regenerate family code');
    }

    let newFamilyCode = generateFamilyCode();
    
    // Ensure new family code is unique
    const familiesRef = collection(db, 'families');
    let codeExists = true;
    while (codeExists) {
      const q = query(familiesRef, where('familyCode', '==', newFamilyCode));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        codeExists = false;
      } else {
        newFamilyCode = generateFamilyCode();
      }
    }

    await updateDoc(doc(db, 'families', family.id), {
      familyCode: newFamilyCode,
      updatedAt: serverTimestamp(),
    });
  };

  const changeFamilyPassword = async (newPassword?: string) => {
    if (!family || !user) throw new Error('Family or user not found');
    
    // Check if current user is admin
    const currentUserMember = family.members.find(member => member.userId === user.id);
    if (currentUserMember?.role !== 'admin') {
      throw new Error('Only admins can change family password');
    }

    const passwordHash = newPassword ? await bcrypt.hash(newPassword, 10) : undefined;

    if (newPassword) {
      await updateDoc(doc(db, 'families', family.id), {
        passwordHash,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Remove password protection
      await updateDoc(doc(db, 'families', family.id), {
        passwordHash: null,
        updatedAt: serverTimestamp(),
      });
    }

    // Log password change
    await ActivityLogger.logMemberInvited(
      user.id,
      user.displayName,
      family.id,
      `Family password ${newPassword ? 'updated' : 'removed'}`
    );
  };

  const value = {
    family,
    loading,
    createFamily,
    removeMember,
    leaveFamily,
    joinFamilyWithCode,
    regenerateFamilyCode,
    changeFamilyPassword,
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