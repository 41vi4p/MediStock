import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, useColorScheme } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useThemeColors, useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { family } = useFamily();
  const colors = useThemeColors();
  const { mode, isDark, setMode } = useTheme();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth/signin'); } },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/auth/signin')}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user.displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: colors.text }]}>{user.displayName}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user.email}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Family</Text>
        {family ? (
          <>
            <Text style={[styles.infoText, { color: colors.text }]}>{family.name}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{family.members.length} member{family.members.length !== 1 ? 's' : ''}</Text>
          </>
        ) : (
          <Text style={{ fontSize: 13, color: colors.textMuted }}>Not in a family</Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <View style={styles.themeRow}>
          {(['light', 'dark', 'system'] as const).map(opt => (
            <TouchableOpacity key={opt} style={[styles.themeBtn, { backgroundColor: mode === opt ? colors.primary : colors.background, borderColor: colors.border }]} onPress={() => setMode(opt)}>
              <Ionicons name={opt === 'light' ? 'sunny' : opt === 'dark' ? 'moon' : 'phone-portrait'} size={18} color={mode === opt ? '#fff' : colors.textSecondary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: mode === opt ? '#fff' : colors.textSecondary, textTransform: 'capitalize' }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/medicines/shopping')}>
          <Ionicons name="cart-outline" size={20} color={colors.purple} />
          <Text style={[styles.menuText, { color: colors.text }]}>Shopping List</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/medicines/logs')}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={[styles.menuText, { color: colors.text }]}>Activity Logs</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.signOutBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger + '40' }]} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={{ color: colors.danger, fontSize: 16, fontWeight: '600' }}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textMuted }]}>MediStock v2.0.0 (Expo)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  profileName: { fontSize: 17, fontWeight: '600' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  infoText: { fontSize: 15, fontWeight: '500' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  menuText: { flex: 1, fontSize: 15 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1 },
  primaryBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 24 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
});
