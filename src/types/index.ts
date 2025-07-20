export interface Medicine {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  purchaseDate: Date;
  category: string;
  location: string;
  addedBy: string;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: FamilyMember[];
  invitations?: FamilyInvitation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface FamilyInvitation {
  id: string;
  email: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  familyId?: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  type: 'medicine_added' | 'medicine_updated' | 'medicine_deleted' | 'user_signin' | 'user_signup' | 'family_created' | 'member_added';
  userId: string;
  userName: string;
  description: string;
  familyId: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}