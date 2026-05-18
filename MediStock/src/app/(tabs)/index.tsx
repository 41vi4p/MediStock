import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Medicine } from '@/types';
import { formatDate, isExpired, isExpiringSoon, getDaysUntilExpiry } from '@/lib/utils';
import ActivityLogger from '@/lib/activityLogger';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { family } = useFamily();
  const colors = useThemeColors();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    if (!user?.familyId) { setLoading(false); return; }
    const q = query(collection(db, 'medicines'), where('familyId', '==', user.familyId), orderBy('expiryDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMedicines(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        expiryDate: d.data().expiryDate?.toDate() || new Date(),
        purchaseDate: d.data().purchaseDate?.toDate() || new Date(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        updatedAt: d.data().updatedAt?.toDate() || new Date(),
      } as Medicine)));
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.familyId]);

  if (!user?.familyId) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="people-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Family Yet</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Join or create a family to start tracking medicines</Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/(tabs)/family')}>
          <Text style={styles.primaryBtnText}>Go to Family</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const expired = medicines.filter(m => isExpired(m.expiryDate));
  const expiringSoon = medicines.filter(m => isExpiringSoon(m.expiryDate));
  const totalQty = medicines.reduce((s, m) => s + m.quantity, 0);

  const handleDelete = async (med: Medicine) => {
    await deleteDoc(doc(db, 'medicines', med.id));
    await ActivityLogger.logMedicineDeleted(user!.id, user!.displayName, user!.familyId!, med.name);
    setSelectedMedicine(null);
  };

  const toggleOutOfStock = async (med: Medicine) => {
    await updateDoc(doc(db, 'medicines', med.id), {
      isOutOfStock: !med.isOutOfStock,
      outOfStockDate: !med.isOutOfStock ? new Date() : null,
      outOfStockBy: !med.isOutOfStock ? user!.id : null,
      updatedAt: serverTimestamp(),
    });
    setSelectedMedicine(null);
  };

  const getExpiryColor = (med: Medicine) => {
    if (isExpired(med.expiryDate)) return colors.danger;
    if (isExpiringSoon(med.expiryDate)) return colors.warning;
    return colors.success;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.greeting, { color: colors.text }]}>Welcome, {user?.displayName}!</Text>
      <Text style={[styles.familyName, { color: colors.textSecondary }]}>{family?.name}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>  
          <Ionicons name="medical" size={22} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{medicines.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.dangerLight }]}>  
          <Ionicons name="alert-circle" size={22} color={colors.danger} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{expired.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Expired</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.warningLight }]}>  
          <Ionicons name="warning" size={22} color={colors.warning} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{expiringSoon.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Expiring</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>  
          <Ionicons name="cube" size={22} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{totalQty}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Items</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/medicines/add')}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Add Medicine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.purple }]} onPress={() => router.push('/medicines/shopping')}>
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Shopping List</Text>
        </TouchableOpacity>
      </View>

      {/* Medicine List */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Medicines</Text>
      {medicines.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No medicines added yet</Text>
      ) : (
        medicines.slice(0, 15).map(med => (
          <TouchableOpacity key={med.id} style={[styles.medCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setSelectedMedicine(med)}>
            <View style={styles.medCardLeft}>
              <View style={[styles.expiryDot, { backgroundColor: getExpiryColor(med) }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.medName, { color: colors.text }]}>{med.name}</Text>
                <Text style={[styles.medInfo, { color: colors.textSecondary }]}>{med.quantity} {med.unit} • {med.category}</Text>
              </View>
            </View>
            <Text style={[styles.medExpiry, { color: getExpiryColor(med) }]}>
              {isExpired(med.expiryDate) ? 'Expired' : `${getDaysUntilExpiry(med.expiryDate)}d`}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* Detail Modal */}
      <Modal visible={!!selectedMedicine} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedMedicine && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedMedicine.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedMedicine(null)}><Ionicons name="close" size={24} color={colors.textSecondary} /></TouchableOpacity>
                </View>
                {selectedMedicine.description ? <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>{selectedMedicine.description}</Text> : null}
                <View style={[styles.modalRow, { borderBottomColor: colors.border }]}><Text style={{ color: colors.textSecondary }}>Quantity</Text><Text style={{ color: colors.text, fontWeight: '500' }}>{selectedMedicine.quantity} {selectedMedicine.unit}</Text></View>
                <View style={[styles.modalRow, { borderBottomColor: colors.border }]}><Text style={{ color: colors.textSecondary }}>Category</Text><Text style={{ color: colors.text, fontWeight: '500' }}>{selectedMedicine.category}</Text></View>
                <View style={[styles.modalRow, { borderBottomColor: colors.border }]}><Text style={{ color: colors.textSecondary }}>Location</Text><Text style={{ color: colors.text, fontWeight: '500' }}>{selectedMedicine.location}</Text></View>
                <View style={[styles.modalRow, { borderBottomColor: colors.border }]}><Text style={{ color: colors.textSecondary }}>Expiry</Text><Text style={{ color: getExpiryColor(selectedMedicine), fontWeight: '500' }}>{formatDate(selectedMedicine.expiryDate)}</Text></View>
                <View style={[styles.modalRow, { borderBottomColor: colors.border }]}><Text style={{ color: colors.textSecondary }}>Purchased</Text><Text style={{ color: colors.text, fontWeight: '500' }}>{formatDate(selectedMedicine.purchaseDate)}</Text></View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.warning }]} onPress={() => toggleOutOfStock(selectedMedicine)}>
                    <Text style={styles.modalBtnText}>{selectedMedicine.isOutOfStock ? 'In Stock' : 'Out of Stock'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.danger }]} onPress={() => handleDelete(selectedMedicine)}>
                    <Text style={styles.modalBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold' },
  familyName: { fontSize: 14, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  primaryBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statLabel: { fontSize: 11 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  medCard: { borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
  medCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  expiryDot: { width: 10, height: 10, borderRadius: 5 },
  medName: { fontSize: 15, fontWeight: '500' },
  medInfo: { fontSize: 12, marginTop: 2 },
  medExpiry: { fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalDesc: { fontSize: 14, marginBottom: 16 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '600' },
});
