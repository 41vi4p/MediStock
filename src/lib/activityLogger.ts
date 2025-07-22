import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

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

export interface LogEntry {
  type: LogType;
  userId: string;
  userName: string;
  familyId: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export class ActivityLogger {
  static async log(entry: LogEntry): Promise<void> {
    try {
      // Remove undefined values from the entry
      const cleanEntry: Record<string, unknown> = {
        type: entry.type,
        userId: entry.userId,
        userName: entry.userName,
        familyId: entry.familyId,
        description: entry.description,
        createdAt: serverTimestamp(),
      };

      // Only add metadata if it exists and has properties
      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        cleanEntry.metadata = entry.metadata;
      }

      await addDoc(collection(db, 'activityLogs'), cleanEntry);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Medicine-related logs
  static async logMedicineAdded(
    userId: string, 
    userName: string, 
    familyId: string, 
    medicineName: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'medicine_added',
      userId,
      userName,
      familyId,
      description: `Added ${medicineName} to medicine inventory`,
      metadata: { medicineName, ...(metadata || {}) }
    });
  }

  static async logMedicineUpdated(
    userId: string, 
    userName: string, 
    familyId: string, 
    medicineName: string,
    changes: string[],
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'medicine_updated',
      userId,
      userName,
      familyId,
      description: `Updated ${medicineName} (${changes.join(', ')})`,
      metadata: { medicineName, changes, ...(metadata || {}) }
    });
  }

  static async logMedicineDeleted(
    userId: string, 
    userName: string, 
    familyId: string, 
    medicineName: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'medicine_deleted',
      userId,
      userName,
      familyId,
      description: `Deleted ${medicineName} from inventory`,
      metadata: { medicineName, ...(metadata || {}) }
    });
  }

  // Authentication logs
  static async logUserSignin(
    userId: string, 
    userName: string, 
    familyId: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'user_signin',
      userId,
      userName,
      familyId,
      description: `${userName} signed in to the application`,
      ...(metadata && { metadata })
    });
  }

  static async logUserSignup(
    userId: string, 
    userName: string, 
    familyId: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'user_signup',
      userId,
      userName,
      familyId,
      description: `${userName} created a new account`,
      ...(metadata && { metadata })
    });
  }

  // Family-related logs
  static async logFamilyCreated(
    userId: string, 
    userName: string, 
    familyId: string, 
    familyName: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'family_created',
      userId,
      userName,
      familyId,
      description: `Created family group "${familyName}"`,
      metadata: { familyName, ...(metadata || {}) }
    });
  }

  static async logMemberInvited(
    userId: string, 
    userName: string, 
    familyId: string, 
    invitedEmail: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'member_invited',
      userId,
      userName,
      familyId,
      description: `Invited ${invitedEmail} to join the family`,
      metadata: { invitedEmail, ...(metadata || {}) }
    });
  }

  static async logMemberAdded(
    userId: string, 
    userName: string, 
    familyId: string, 
    newMemberName: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'member_added',
      userId,
      userName,
      familyId,
      description: `${newMemberName} joined the family`,
      metadata: { newMemberName, ...(metadata || {}) }
    });
  }

  static async logMemberRemoved(
    userId: string, 
    userName: string, 
    familyId: string, 
    removedMemberName: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'member_removed',
      userId,
      userName,
      familyId,
      description: `Removed ${removedMemberName} from the family`,
      metadata: { removedMemberName, ...(metadata || {}) }
    });
  }

  static async logInvitationAccepted(
    userId: string, 
    userName: string, 
    familyId: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'invitation_accepted',
      userId,
      userName,
      familyId,
      description: `${userName} accepted family invitation`,
      ...(metadata && { metadata })
    });
  }

  // Settings logs
  static async logSettingsUpdated(
    userId: string, 
    userName: string, 
    familyId: string, 
    settingType: string,
    metadata?: Record<string, unknown>
  ) {
    await this.log({
      type: 'settings_updated',
      userId,
      userName,
      familyId,
      description: `Updated ${settingType} settings`,
      metadata: { settingType, ...(metadata || {}) }
    });
  }
}

// Convenience function for direct logging
export const logActivity = ActivityLogger.log.bind(ActivityLogger);

export default ActivityLogger;