import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useThemeColors } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FamilyScreen() {
  const { user } = useAuth();
  const { family, loading, createFamily, joinFamilyWithCode, removeMember, leaveFamily, regenerateFamilyCode, changeFamilyPassword } = useFamily();
  const colors = useThemeColors();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyDesc, setFamilyDesc] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const isAdmin = family?.members.find(m => m.userId === user?.id)?.role === 'admin';

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    setSubmitting(true);
    try {
      await createFamily(familyName, familyDesc || undefined, familyPassword || undefined);
      setShowCreate(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setSubmitting(true);
    try {
      await joinFamilyWithCode(joinCode, joinPassword || undefined);
      setShowJoin(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleRemoveMember = (userId: string, name: string) => {
    Alert.alert('Remove Member', `Remove ${name} from the family?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMember(userId).catch(e => Alert.alert('Error', e.message)) },
    ]);
  };

  const handleLeave = () => {
    Alert.alert('Leave Family', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => leaveFamily().catch(e => Alert.alert('Error', e.message)) },
    ]);
  };

  const handleRegenerateCode = () => {
    Alert.alert('Regenerate Code', 'This will invalidate the current code.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Regenerate', onPress: () => regenerateFamilyCode().catch(e => Alert.alert('Error', e.message)) },
    ]);
  };

  const handleChangePassword = async () => {
    setSubmitting(true);
    try {
      await changeFamilyPassword(newPassword || undefined);
      setShowPasswordChange(false);
      setNewPassword('');
      Alert.alert('Success', newPassword ? 'Password updated' : 'Password removed');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSubmitting(false); }
  };

  // No family - show create/join options
  if (!family) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Family</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create or join a family to manage medicines together</Text>

        {!showCreate && !showJoin && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowCreate(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Create Family</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowJoin(true)}>
              <Ionicons name="people-outline" size={20} color="#2563eb" />
              <Text style={styles.secondaryBtnText}>Join Family</Text>
            </TouchableOpacity>
          </View>
        )}

        {showCreate && (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Family Name *" value={familyName} onChangeText={setFamilyName} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Description (optional)" value={familyDesc} onChangeText={setFamilyDesc} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Password (optional)" value={familyPassword} onChangeText={setFamilyPassword} secureTextEntry placeholderTextColor="#999" />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCreate(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        )}

        {showJoin && (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Family Code (6 characters)" value={joinCode} onChangeText={setJoinCode} autoCapitalize="characters" maxLength={6} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Password (if required)" value={joinPassword} onChangeText={setJoinPassword} secureTextEntry placeholderTextColor="#999" />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleJoin} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Join</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowJoin(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  // Has family - show family details
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{family.name}</Text>
      {family.description ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{family.description}</Text> : null}

      {/* Family Code */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Family Code</Text>
        <Text style={[styles.codeText, { color: colors.primary }]}>{family.familyCode}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Share this code with family members to join</Text>
        {isAdmin && (
          <TouchableOpacity style={styles.smallBtn} onPress={handleRegenerateCode}>
            <Text style={styles.smallBtnText}>Regenerate Code</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Password Management */}
      {isAdmin && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Password Protection</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{family.passwordHash ? 'Password is set' : 'No password set'}</Text>
          {!showPasswordChange ? (
            <TouchableOpacity style={styles.smallBtn} onPress={() => setShowPasswordChange(true)}>
              <Text style={styles.smallBtnText}>{family.passwordHash ? 'Change Password' : 'Set Password'}</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <TextInput style={styles.input} placeholder="New password (leave empty to remove)" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholderTextColor="#999" />
              <TouchableOpacity style={styles.smallBtn} onPress={handleChangePassword} disabled={submitting}>
                <Text style={styles.smallBtnText}>{submitting ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPasswordChange(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Members */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Members ({family.members.length})</Text>
        {family.members.map(member => (
          <View key={member.userId} style={[styles.memberRow, { borderBottomColor: colors.border }]}>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.text }]}>{member.displayName}</Text>
              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
            </View>
            {isAdmin && member.userId !== user?.id && member.userId !== family.createdBy && (
              <TouchableOpacity onPress={() => handleRemoveMember(member.userId, member.displayName)}>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Leave Family */}
      {user?.id !== family.createdBy && (
        <TouchableOpacity style={[styles.dangerBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger + '40' }]} onPress={handleLeave}>
          <Text style={styles.dangerBtnText}>Leave Family</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 24 },
  buttonGroup: { gap: 12 },
  primaryBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  secondaryBtnText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  form: { marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#475569', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12 },
  cancelText: { textAlign: 'center', marginTop: 12, color: '#94a3b8' },
  card: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  codeText: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', textAlign: 'center', letterSpacing: 4, marginVertical: 8 },
  hint: { fontSize: 13, marginBottom: 8 },
  smallBtn: { borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  smallBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '500' },
  memberRole: { fontSize: 12, textTransform: 'capitalize' },
  dangerBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, borderWidth: 1 },
  dangerBtnText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
