import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  doc, updateDoc, collection, onSnapshot, serverTimestamp, addDoc, query, where, getDocs,
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

const generateFamilyCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

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
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFamily({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            members: data.members?.map((m: any) => ({ ...m, joinedAt: m.joinedAt?.toDate?.() || new Date() })) || [],
          } as Family);
        } else {
          setFamily(null);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [user?.familyId]);

  const createFamily = async (name: string, description?: string, password?: string) => {
    if (!user) throw new Error('Not authenticated');
    let familyCode = generateFamilyCode();
    const familiesRef = collection(db, 'families');
    let codeExists = true;
    while (codeExists) {
      const q = query(familiesRef, where('familyCode', '==', familyCode));
      const snap = await getDocs(q);
      codeExists = !snap.empty;
      if (codeExists) familyCode = generateFamilyCode();
    }
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const familyData = {
      name, description, createdBy: user.id, familyCode, passwordHash,
      members: [{ userId: user.id, email: user.email, displayName: user.displayName, photoURL: user.photoURL, role: 'admin' as const, joinedAt: new Date() }],
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    };
    const familyRef = await addDoc(collection(db, 'families'), familyData);
    await updateDoc(doc(db, 'users', user.id), { familyId: familyRef.id, updatedAt: serverTimestamp() });
    await ActivityLogger.logFamilyCreated(user.id, user.displayName, familyRef.id, name);
  };

  const removeMember = async (userId: string) => {
    if (!family || !user) throw new Error('Family or user not found');
    const currentMember = family.members.find(m => m.userId === user.id);
    if (currentMember?.role !== 'admin') throw new Error('Only admins can remove members');
    if (userId === family.createdBy) throw new Error('Cannot remove family creator');
    const removed = family.members.find(m => m.userId === userId);
    const updatedMembers = family.members.filter(m => m.userId !== userId);
    await updateDoc(doc(db, 'families', family.id), { members: updatedMembers, updatedAt: serverTimestamp() });
    await updateDoc(doc(db, 'users', userId), { familyId: null, updatedAt: serverTimestamp() });
    if (removed) await ActivityLogger.logMemberRemoved(user.id, user.displayName, family.id, removed.displayName);
  };

  const leaveFamily = async () => {
    if (!family || !user) throw new Error('Family or user not found');
    if (user.id === family.createdBy) throw new Error('Creator cannot leave');
    const updatedMembers = family.members.filter(m => m.userId !== user.id);
    await updateDoc(doc(db, 'families', family.id), { members: updatedMembers, updatedAt: serverTimestamp() });
    await updateDoc(doc(db, 'users', user.id), { familyId: null, updatedAt: serverTimestamp() });
  };

  const joinFamilyWithCode = async (familyCode: string, password?: string) => {
    if (!user) throw new Error('Not authenticated');
    const q = query(collection(db, 'families'), where('familyCode', '==', familyCode.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Family not found with this code');
    const familyDoc = snap.docs[0];
    const familyData = familyDoc.data() as Family;
    if (familyData.members.find(m => m.userId === user.id)) throw new Error('Already a member');
    if (familyData.passwordHash) {
      if (!password) throw new Error('This family requires a password');
      const valid = await bcrypt.compare(password, familyData.passwordHash);
      if (!valid) throw new Error('Incorrect password');
    }
    const newMember: FamilyMember = { userId: user.id, email: user.email, displayName: user.displayName, photoURL: user.photoURL, role: 'member', joinedAt: new Date() };
    await updateDoc(doc(db, 'families', familyDoc.id), { members: [...familyData.members, newMember], updatedAt: serverTimestamp() });
    await updateDoc(doc(db, 'users', user.id), { familyId: familyDoc.id, updatedAt: serverTimestamp() });
    await ActivityLogger.logMemberAdded(user.id, user.displayName, familyDoc.id, user.displayName);
  };

  const regenerateFamilyCode = async () => {
    if (!family || !user) throw new Error('Family or user not found');
    const currentMember = family.members.find(m => m.userId === user.id);
    if (currentMember?.role !== 'admin') throw new Error('Only admins can regenerate code');
    let newCode = generateFamilyCode();
    let codeExists = true;
    while (codeExists) {
      const q = query(collection(db, 'families'), where('familyCode', '==', newCode));
      const snap = await getDocs(q);
      codeExists = !snap.empty;
      if (codeExists) newCode = generateFamilyCode();
    }
    await updateDoc(doc(db, 'families', family.id), { familyCode: newCode, updatedAt: serverTimestamp() });
  };

  const changeFamilyPassword = async (newPassword?: string) => {
    if (!family || !user) throw new Error('Family or user not found');
    const currentMember = family.members.find(m => m.userId === user.id);
    if (currentMember?.role !== 'admin') throw new Error('Only admins can change password');
    const passwordHash = newPassword ? await bcrypt.hash(newPassword, 10) : null;
    await updateDoc(doc(db, 'families', family.id), { passwordHash, updatedAt: serverTimestamp() });
  };

  return (
    <FamilyContext.Provider value={{ family, loading, createFamily, removeMember, leaveFamily, joinFamilyWithCode, regenerateFamilyCode, changeFamilyPassword }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within FamilyProvider');
  return context;
}
