import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { LogType } from '@/types';

interface LogEntry {
  type: LogType;
  userId: string;
  userName: string;
  familyId: string;
  description: string;
  metadata?: Record<string, unknown>;
}

class ActivityLogger {
  static async log(entry: LogEntry): Promise<void> {
    try {
      const cleanEntry: Record<string, unknown> = {
        type: entry.type,
        userId: entry.userId,
        userName: entry.userName,
        familyId: entry.familyId,
        description: entry.description,
        createdAt: serverTimestamp(),
      };
      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        cleanEntry.metadata = entry.metadata;
      }
      await addDoc(collection(db, 'activityLogs'), cleanEntry);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  static async logMedicineAdded(userId: string, userName: string, familyId: string, medicineName: string, metadata?: Record<string, unknown>) {
    await this.log({ type: 'medicine_added', userId, userName, familyId, description: `Added ${medicineName} to inventory`, metadata: { medicineName, ...(metadata || {}) } });
  }

  static async logMedicineUpdated(userId: string, userName: string, familyId: string, medicineName: string, changes: string[]) {
    await this.log({ type: 'medicine_updated', userId, userName, familyId, description: `Updated ${medicineName} (${changes.join(', ')})`, metadata: { medicineName, changes } });
  }

  static async logMedicineDeleted(userId: string, userName: string, familyId: string, medicineName: string) {
    await this.log({ type: 'medicine_deleted', userId, userName, familyId, description: `Deleted ${medicineName} from inventory`, metadata: { medicineName } });
  }

  static async logUserSignin(userId: string, userName: string, familyId: string) {
    await this.log({ type: 'user_signin', userId, userName, familyId, description: `${userName} signed in` });
  }

  static async logFamilyCreated(userId: string, userName: string, familyId: string, familyName: string) {
    await this.log({ type: 'family_created', userId, userName, familyId, description: `Created family "${familyName}"`, metadata: { familyName } });
  }

  static async logMemberAdded(userId: string, userName: string, familyId: string, memberName: string) {
    await this.log({ type: 'member_added', userId, userName, familyId, description: `${memberName} joined the family`, metadata: { memberName } });
  }

  static async logMemberRemoved(userId: string, userName: string, familyId: string, removedName: string) {
    await this.log({ type: 'member_removed', userId, userName, familyId, description: `Removed ${removedName} from family`, metadata: { removedName } });
  }
}

export default ActivityLogger;
