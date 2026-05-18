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
  isOutOfStock: boolean;
  outOfStockDate?: Date;
  outOfStockBy?: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: FamilyMember[];
  familyCode: string;
  passwordHash?: string;
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

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  familyId?: string;
  theme?: 'light' | 'dark';
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  type: LogType;
  userId: string;
  userName: string;
  description: string;
  familyId: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ShoppingItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  addedBy: string;
  addedByName: string;
  familyId: string;
  createdAt: Date;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
}

export type LogType =
  | 'medicine_added'
  | 'medicine_updated'
  | 'medicine_deleted'
  | 'medicine_out_of_stock'
  | 'medicine_back_in_stock'
  | 'user_signin'
  | 'user_signup'
  | 'family_created'
  | 'member_added'
  | 'member_removed'
  | 'member_invited'
  | 'invitation_accepted'
  | 'settings_updated'
  | 'password_changed'
  | 'shopping_item_added'
  | 'shopping_item_removed';
