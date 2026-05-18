import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Medicine } from '@/types';
import { formatDate, isExpired, isExpiringSoon, getDaysUntilExpiry } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';

const categories = ['All', 'General', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Cold & Flu', 'Digestive', 'Heart & Blood', 'Diabetes', 'Skin Care', 'Eye Care', 'First Aid', 'Other'];
const sortOptions = ['Expiry Date', 'Name', 'Quantity', 'Category'];
const statusFilters = ['All', 'In Stock', 'Out of Stock', 'Expired', 'Expiring Soon'];

export default function SearchScreen() {
  const { user } = useAuth();
  const colors = useThemeColors();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Expiry Date');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user?.familyId) { setLoading(false); return; }
    const q = query(collection(db, 'medicines'), where('familyId', '==', user.familyId));
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

  const filteredMedicines = useMemo(() => {
    let result = [...medicines];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'All') result = result.filter(m => m.category === selectedCategory);
    if (selectedStatus === 'In Stock') result = result.filter(m => !m.isOutOfStock);
    else if (selectedStatus === 'Out of Stock') result = result.filter(m => m.isOutOfStock);
    else if (selectedStatus === 'Expired') result = result.filter(m => isExpired(m.expiryDate));
    else if (selectedStatus === 'Expiring Soon') result = result.filter(m => isExpiringSoon(m.expiryDate));
    if (sortBy === 'Expiry Date') result.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
    else if (sortBy === 'Name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'Quantity') result.sort((a, b) => b.quantity - a.quantity);
    else if (sortBy === 'Category') result.sort((a, b) => a.category.localeCompare(b.category));
    return result;
  }, [medicines, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const getExpiryColor = (med: Medicine) => {
    if (isExpired(med.expiryDate)) return colors.danger;
    if (isExpiringSoon(med.expiryDate)) return colors.warning;
    return colors.success;
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search medicines..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.textMuted} />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options" size={22} color={showFilters ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {categories.map(cat => (
              <TouchableOpacity key={cat} style={[styles.chip, { backgroundColor: selectedCategory === cat ? colors.primary : colors.card, borderColor: colors.border, borderWidth: 1 }]} onPress={() => setSelectedCategory(cat)}>
                <Text style={{ fontSize: 13, color: selectedCategory === cat ? '#fff' : colors.textSecondary }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {statusFilters.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, { backgroundColor: selectedStatus === s ? colors.primary : colors.card, borderColor: colors.border, borderWidth: 1 }]} onPress={() => setSelectedStatus(s)}>
                <Text style={{ fontSize: 13, color: selectedStatus === s ? '#fff' : colors.textSecondary }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {sortOptions.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, { backgroundColor: sortBy === s ? colors.primary : colors.card, borderColor: colors.border, borderWidth: 1 }]} onPress={() => setSortBy(s)}>
                <Text style={{ fontSize: 13, color: sortBy === s ? '#fff' : colors.textSecondary }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
        <Text style={[styles.resultCount, { color: colors.textMuted }]}>{filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? 's' : ''} found</Text>
        {filteredMedicines.map(med => (
          <View key={med.id} style={[styles.medCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.medCardHeader}>
              <View style={[styles.expiryDot, { backgroundColor: getExpiryColor(med) }]} />
              <Text style={[styles.medName, { color: colors.text }]}>{med.name}</Text>
              {med.isOutOfStock && <View style={[styles.oosTag, { backgroundColor: colors.dangerLight }]}><Text style={{ fontSize: 10, color: colors.danger, fontWeight: '600' }}>OOS</Text></View>}
            </View>
            <View style={styles.medDetails}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{med.quantity} {med.unit}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{med.category}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{med.location}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '500', marginTop: 4, color: getExpiryColor(med) }}>
              {isExpired(med.expiryDate) ? `Expired ${formatDate(med.expiryDate)}` : `Expires ${formatDate(med.expiryDate)} (${getDaysUntilExpiry(med.expiryDate)} days)`}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1 },
  searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 16 },
  filtersContainer: { padding: 16, paddingTop: 12 },
  filterLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  chipRow: { flexDirection: 'row', marginBottom: 4 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  results: { flex: 1 },
  resultsContent: { padding: 16 },
  resultCount: { fontSize: 13, marginBottom: 12 },
  medCard: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  medCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  expiryDot: { width: 8, height: 8, borderRadius: 4 },
  medName: { fontSize: 15, fontWeight: '600', flex: 1 },
  oosTag: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  medDetails: { flexDirection: 'row', gap: 12, marginBottom: 4 },
});
