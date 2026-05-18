import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ActivityLogger from '@/lib/activityLogger';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/contexts/ThemeContext';

const units = ['tablets', 'capsules', 'ml', 'mg', 'g', 'bottles', 'boxes', 'pieces'];
const categories = ['General', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Cold & Flu', 'Digestive', 'Heart & Blood', 'Diabetes', 'Skin Care', 'Eye Care', 'First Aid', 'Other'];
const locations = ['Medicine Cabinet', 'Refrigerator', 'Bedroom', 'Bathroom', 'Kitchen', 'First Aid Kit', 'Other'];

export default function AddMedicineScreen() {
  const { user } = useAuth();
  const c = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('tablets');
  const [expiryDate, setExpiryDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('General');
  const [location, setLocation] = useState('Medicine Cabinet');
  const [picker, setPicker] = useState<{ options: string[]; selected: string; onSelect: (v: string) => void } | null>(null);

  const handleSubmit = async () => {
    if (!name || !quantity || !expiryDate) { Alert.alert('Missing Fields', 'Please fill in name, quantity, and expiry date'); return; }
    if (!user?.familyId) { Alert.alert('Error', 'Please join a family first'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'medicines'), {
        name, description, quantity: parseInt(quantity), unit,
        expiryDate: new Date(expiryDate), purchaseDate: new Date(purchaseDate),
        category, location, addedBy: user.id, familyId: user.familyId,
        isOutOfStock: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      await ActivityLogger.logMedicineAdded(user.id, user.displayName, user.familyId, name, { category, quantity: parseInt(quantity), unit });
      router.back();
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const Field = ({ icon, label, children }: { icon: keyof typeof Ionicons.glyphMap; label: string; children: React.ReactNode }) => (
    <View style={[s.fieldGroup, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={s.fieldHeader}>
        <Ionicons name={icon} size={16} color={c.primary} />
        <Text style={[s.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      </View>
      {children}
    </View>
  );

  const Selector = ({ value, onPress }: { value: string; onPress: () => void }) => (
    <TouchableOpacity style={[s.selector, { borderColor: c.border, backgroundColor: c.background }]} onPress={onPress}>
      <Text style={[s.selectorText, { color: c.text }]}>{value}</Text>
      <Ionicons name="chevron-down" size={18} color={c.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[s.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: c.card, borderColor: c.border }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={c.text} />
          </TouchableOpacity>
          <View>
            <Text style={[s.title, { color: c.text }]}>Add Medicine</Text>
            <Text style={[s.subtitle, { color: c.textSecondary }]}>Fill in the details below</Text>
          </View>
        </View>

        {/* Name & Description */}
        <Field icon="medical" label="Medicine Info">
          <TextInput style={[s.input, { borderColor: c.border, backgroundColor: c.background, color: c.text }]} placeholder="Medicine Name *" value={name} onChangeText={setName} placeholderTextColor={c.textMuted} />
          <TextInput style={[s.input, s.inputMultiline, { borderColor: c.border, backgroundColor: c.background, color: c.text }]} placeholder="Description (optional)" value={description} onChangeText={setDescription} placeholderTextColor={c.textMuted} multiline numberOfLines={2} />
        </Field>

        {/* Quantity & Unit */}
        <Field icon="layers" label="Quantity">
          <View style={s.row}>
            <TextInput style={[s.input, { flex: 1, borderColor: c.border, backgroundColor: c.background, color: c.text }]} placeholder="Amount *" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholderTextColor={c.textMuted} />
            <View style={{ flex: 1 }}>
              <Selector value={unit} onPress={() => setPicker({ options: units, selected: unit, onSelect: setUnit })} />
            </View>
          </View>
        </Field>

        {/* Category & Location */}
        <Field icon="pricetag" label="Category & Location">
          <Selector value={category} onPress={() => setPicker({ options: categories, selected: category, onSelect: setCategory })} />
          <View style={{ height: 8 }} />
          <Selector value={location} onPress={() => setPicker({ options: locations, selected: location, onSelect: setLocation })} />
        </Field>

        {/* Dates */}
        <Field icon="calendar" label="Dates">
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={[s.dateLabel, { color: c.textMuted }]}>Expiry *</Text>
              <TextInput style={[s.input, { borderColor: c.border, backgroundColor: c.background, color: c.text }]} placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} placeholderTextColor={c.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.dateLabel, { color: c.textMuted }]}>Purchased</Text>
              <TextInput style={[s.input, { borderColor: c.border, backgroundColor: c.background, color: c.text }]} placeholder="YYYY-MM-DD" value={purchaseDate} onChangeText={setPurchaseDate} placeholderTextColor={c.textMuted} />
            </View>
          </View>
        </Field>

        {/* Submit */}
        <TouchableOpacity style={[s.submitBtn, { backgroundColor: c.primary }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={s.submitInner}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={s.submitText}>Add Medicine</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Picker Modal */}
      <Modal visible={!!picker} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setPicker(null)}>
          <View style={[s.modalContent, { backgroundColor: c.card }]}>
            <View style={[s.modalHandle, { backgroundColor: c.border }]} />
            <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
              {picker?.options.map(opt => (
                <TouchableOpacity key={opt} style={[s.modalItem, opt === picker.selected && { backgroundColor: c.primaryLight }]} onPress={() => { picker.onSelect(opt); setPicker(null); }}>
                  <Text style={[s.modalItemText, { color: opt === picker.selected ? c.primary : c.text }]}>{opt}</Text>
                  {opt === picker.selected && <Ionicons name="checkmark" size={20} color={c.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 2 },
  fieldGroup: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10 },
  selector: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorText: { fontSize: 15 },
  dateLabel: { fontSize: 11, fontWeight: '500', marginBottom: 4 },
  submitBtn: { borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  submitInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 34, maxHeight: '60%' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalScroll: { paddingHorizontal: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4 },
  modalItemText: { fontSize: 16 },
});
