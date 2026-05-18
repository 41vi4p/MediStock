import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity, Image } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const c = useThemeColors();

  return (
    <ScrollView style={[s.container, { backgroundColor: c.background }]} contentContainerStyle={s.content}>
      <View style={s.header}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: c.card, borderColor: c.border }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: c.text }]}>About</Text>
      </View>

      {/* App Info */}
      <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[s.appName, { color: c.text }]}>💊 MediStock</Text>
        <Text style={[s.version, { color: c.primary }]}>Version 2.2.0</Text>
        <Text style={[s.desc, { color: c.textSecondary }]}>
          A comprehensive mobile application for managing home medicine inventory with expiry tracking, family sharing, and intelligent notifications.
        </Text>
        <TouchableOpacity style={[s.socialBtn, { backgroundColor: c.background, marginTop: 12, alignSelf: 'flex-start' }]} onPress={() => Linking.openURL('https://github.com/Project-Cell-CRCE/MediStock')}>
          <Ionicons name="logo-github" size={18} color={c.text} />
          <Text style={[s.socialText, { color: c.text }]}>View on GitHub</Text>
        </TouchableOpacity>
      </View>

      {/* Team */}
      <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={s.sectionHeader}>
          <Image source={require('@/assets/cir_logo.webp')} style={s.logo} />
          <View>
            <Text style={[s.sectionTitle, { color: c.text }]}>Project Cell CRCE</Text>
            <Text style={{ fontSize: 12, color: c.textSecondary }}>Fr. Conceicao Rodrigues College of Engineering</Text>
          </View>
        </View>
        <Text style={[s.desc, { color: c.textSecondary }]}>
          Project Cell is the innovation and development hub at Fr. Conceicao Rodrigues College of Engineering, Mumbai. We are a team of passionate students dedicated to building impactful technology solutions that solve real-world problems.
        </Text>
      </View>

      {/* Developer */}
      <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={s.sectionHeader}>
          <Ionicons name="code-slash" size={18} color={c.purple} />
          <Text style={[s.sectionTitle, { color: c.text }]}>Developer</Text>
        </View>
        <Text style={[s.devName, { color: c.text }]}>David Porathur</Text>
        <Text style={[s.devRole, { color: c.textSecondary }]}>Project Cell CRCE</Text>
        <View style={s.socialRow}>
          <TouchableOpacity style={[s.socialBtn, { backgroundColor: c.background }]} onPress={() => Linking.openURL('https://github.com/41vi4p')}>
            <Ionicons name="logo-github" size={18} color={c.text} />
            <Text style={[s.socialText, { color: c.text }]}>GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.socialBtn, { backgroundColor: c.background }]} onPress={() => Linking.openURL('https://www.linkedin.com/in/david-porathur-33780228a/')}>
            <Ionicons name="logo-linkedin" size={18} color="#0a66c2" />
            <Text style={[s.socialText, { color: c.text }]}>LinkedIn</Text>
          </TouchableOpacity>
        </View>

        <View style={s.devDivider} />
        <Text style={[s.devName, { color: c.text }]}>Ayush Ghara</Text>
        <Text style={[s.devRole, { color: c.textSecondary }]}>Project Cell CRCE</Text>

        <View style={s.devDivider} />
        <Text style={[s.devName, { color: c.text }]}>Swar Churi</Text>
        <Text style={[s.devRole, { color: c.textSecondary }]}>Project Cell CRCE</Text>
      </View>

      {/* Tech Stack */}
      <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={s.sectionHeader}>
          <Ionicons name="layers" size={18} color={c.success} />
          <Text style={[s.sectionTitle, { color: c.text }]}>Tech Stack</Text>
        </View>
        <View style={s.techRow}>
          {['Expo', 'React Native', 'TypeScript', 'Firebase', 'Firestore'].map(t => (
            <View key={t} style={[s.techChip, { backgroundColor: c.primaryLight }]}>
              <Text style={[s.techText, { color: c.primary }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[s.footer, { color: c.textMuted }]}>Made with ❤️ by Project Cell CRCE</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  title: { fontSize: 22, fontWeight: 'bold' },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1 },
  appName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  version: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  desc: { fontSize: 14, lineHeight: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  logo: { width: 36, height: 36, borderRadius: 8 },
  orgName: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  devName: { fontSize: 16, fontWeight: '600' },
  devRole: { fontSize: 13, marginTop: 2 },
  devDivider: { height: 1, backgroundColor: '#e2e8f020', marginVertical: 12 },
  socialRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  socialText: { fontSize: 13, fontWeight: '500' },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techChip: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  techText: { fontSize: 13, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 13, marginTop: 20 },
});
