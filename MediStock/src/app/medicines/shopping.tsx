import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingItem } from '@/types';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/contexts/ThemeContext';

const categories = ['General', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Cold & Flu', 'Digestive', 'Other'];
const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

export default function ShoppingListScreen() {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.familyId) { setLoading(false); return; }
    const q = query(collection(db, 'shoppingList'), where('familyId', '==', user.familyId));
    const unsubscribe = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        completedAt: d.data().completedAt?.toDate() || undefined,
      } as ShoppingItem)));
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.familyId]);

  const handleAdd = async () => {
    if (!name.trim() || !user?.familyId) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'shoppingList'), {
        name, description, category, priority,
        addedBy: user.id, addedByName: user.displayName,
        familyId: user.familyId, createdAt: serverTimestamp(),
        isCompleted: false,
      });
      setName(''); setDescription(''); setShowAdd(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSubmitting(false); }
  };

  const toggleComplete = async (item: ShoppingItem) => {
    await updateDoc(doc(db, 'shoppingList', item.id), {
      isCompleted: !item.isCompleted,
      completedBy: !item.isCompleted ? user?.id : null,
      completedAt: !item.isCompleted ? serverTimestamp() : null,
    });
  };

  const handleDelete = (item: ShoppingItem) => {
    Alert.alert('Delete', `Remove "${item.name}" from shopping list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDoc(doc(db, 'shoppingList', item.id)) },
    ]);
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return '#ef4444';
    if (p === 'medium') return '#f59e0b';
    return '#22c55e';
  };

  const pendingItems = items.filter(i => !i.isCompleted);
  const completedItems = items.filter(i => i.isCompleted);

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.purple} /></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1e293b" /></TouchableOpacity>
        <Text style={styles.title}>Shopping List</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}><Ionicons name={showAdd ? 'close' : 'add'} size={24} color="#7c3aed" /></TouchableOpacity>
      </View>

      {/* Add Form */}
      {showAdd && (
        <View style={styles.addForm}>
          <TextInput style={styles.input} placeholder="Item name *" value={name} onChangeText={setName} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Description (optional)" value={description} onChangeText={setDescription} placeholderTextColor="#999" />
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipRow}>
            {priorities.map(p => (
              <TouchableOpacity key={p} style={[styles.chip, priority === p && { backgroundColor: getPriorityColor(p) }]} onPress={() => setPriority(p)}>
                <Text style={[styles.chipText, priority === p && { color: '#fff' }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map(c => (
              <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add to List</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Pending Items */}
      <Text style={styles.sectionTitle}>To Buy ({pendingItems.length})</Text>
      {pendingItems.length === 0 ? (
        <Text style={styles.emptyText}>No items in shopping list</Text>
      ) : (
        pendingItems.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <TouchableOpacity style={styles.checkbox} onPress={() => toggleComplete(item)}>
              <Ionicons name="square-outline" size={22} color="#94a3b8" />
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemMeta}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemBy}>by {item.addedByName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color="#ef4444" /></TouchableOpacity>
          </View>
        ))
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Completed ({completedItems.length})</Text>
          {completedItems.map(item => (
            <View key={item.id} style={[styles.itemCard, { opacity: 0.6 }]}>
              <TouchableOpacity style={styles.checkbox} onPress={() => toggleComplete(item)}>
                <Ionicons name="checkbox" size={22} color="#22c55e" />
              </TouchableOpacity>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { textDecorationLine: 'line-through' }]}>{item.name}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color="#ef4444" /></TouchableOpacity>
            </View>
          ))}
        </>
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
  addForm: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 10, color: '#1e293b' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#7c3aed' },
  chipText: { fontSize: 13, color: '#475569', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  addBtn: { backgroundColor: '#7c3aed', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 10, marginTop: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 },
  itemCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  checkbox: { padding: 2 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: '#1e293b' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  itemCategory: { fontSize: 12, color: '#64748b' },
  itemBy: { fontSize: 11, color: '#94a3b8' },
});
