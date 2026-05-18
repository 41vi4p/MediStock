import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/contexts/ThemeContext';

const getLogIcon = (type: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  switch (type) {
    case 'medicine_added': return { name: 'add-circle', color: '#22c55e' };
    case 'medicine_updated': return { name: 'create', color: '#3b82f6' };
    case 'medicine_deleted': return { name: 'trash', color: '#ef4444' };
    case 'user_signin': return { name: 'log-in', color: '#6366f1' };
    case 'user_signup': return { name: 'person-add', color: '#8b5cf6' };
    case 'family_created': return { name: 'people', color: '#0ea5e9' };
    case 'member_added': return { name: 'person-add', color: '#22c55e' };
    case 'member_removed': return { name: 'person-remove', color: '#ef4444' };
    case 'member_invited': return { name: 'mail', color: '#f59e0b' };
    case 'shopping_item_added': return { name: 'cart', color: '#7c3aed' };
    case 'shopping_item_removed': return { name: 'cart-outline', color: '#64748b' };
    default: return { name: 'ellipse', color: '#94a3b8' };
  }
};

export default function ActivityLogsScreen() {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.familyId) { setLoading(false); return; }
    const q = query(
      collection(db, 'activityLogs'),
      where('familyId', '==', user.familyId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      } as ActivityLog)));
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.familyId]);

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1e293b" /></TouchableOpacity>
        <Text style={styles.title}>Activity Logs</Text>
        <View style={{ width: 24 }} />
      </View>

      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>No activity logs yet</Text>
        </View>
      ) : (
        logs.map(log => {
          const icon = getLogIcon(log.type);
          return (
            <View key={log.id} style={styles.logCard}>
              <View style={[styles.iconCircle, { backgroundColor: icon.color + '20' }]}>
                <Ionicons name={icon.name} size={18} color={icon.color} />
              </View>
              <View style={styles.logInfo}>
                <Text style={styles.logDesc}>{log.description}</Text>
                <View style={styles.logMeta}>
                  <Text style={styles.logUser}>{log.userName}</Text>
                  <Text style={styles.logDate}>{formatDate(log.createdAt)}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#94a3b8', marginTop: 12 },
  logCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12, backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logInfo: { flex: 1 },
  logDesc: { fontSize: 14, color: '#1e293b', lineHeight: 20 },
  logMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  logUser: { fontSize: 12, color: '#64748b' },
  logDate: { fontSize: 12, color: '#94a3b8' },
});
