import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, user, signOut, cfPlatform } = useAuthStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [contestAlerts, setContestAlerts] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Settings" subtitle="Preferences & account control" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{profile?.display_name || 'Nexora User'}</Text>
              <Text style={styles.rowSubtitle}>{user?.email || 'user@example.com'}</Text>
            </View>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedText}>Active</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>CONNECTED PLATFORMS</Text>
          <View style={styles.row}>
            <View style={styles.platformLeft}>
              <Ionicons name="code-slash" size={20} color="#1F8ACB" />
              <View>
                <Text style={styles.rowTitle}>Codeforces</Text>
                <Text style={styles.rowSubtitle}>
                  {cfPlatform?.handle ? `@${cfPlatform.handle}` : 'Not connected'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.linkText}>{cfPlatform ? 'Manage' : 'Connect'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Ionicons name="moon-outline" size={20} color={Colors.dark.textSecondary} />
              <View>
                <Text style={styles.rowTitle}>Dark Mode</Text>
                <Text style={styles.rowSubtitle}>Optimized for competitive programming</Text>
              </View>
            </View>
            <Switch
              value={darkTheme}
              onValueChange={setDarkTheme}
              thumbColor={darkTheme ? Colors.dark.primaryLight : '#F4F3F4'}
              trackColor={{ false: '#374151', true: Colors.dark.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.dark.textSecondary} />
              <View>
                <Text style={styles.rowTitle}>Contest Reminders</Text>
                <Text style={styles.rowSubtitle}>Notify 30 mins before live rounds start</Text>
              </View>
            </View>
            <Switch
              value={contestAlerts}
              onValueChange={setContestAlerts}
              thumbColor={contestAlerts ? Colors.dark.primaryLight : '#F4F3F4'}
              trackColor={{ false: '#374151', true: Colors.dark.primary }}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>ARCHITECTURE & INTEGRATIONS</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Mobile Client</Text>
            <Text style={styles.infoVal}>React Native 0.88 (Expo SDK 58)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Database & Auth</Text>
            <Text style={styles.infoVal}>Supabase PostgreSQL + RLS</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>External APIs</Text>
            <Text style={styles.infoVal}>Codeforces API & Gemini AI</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Core Domain Engine</Text>
            <Text style={styles.infoVal}>Preserved C++17 OOP Architecture</Text>
          </View>
        </Card>

        <Button
          title="Log Out of Nexora"
          variant="danger"
          size="md"
          onPress={handleSignOut}
          style={styles.signOutBtn}
        />

        <Text style={styles.versionText}>Nexora v1.0.0 (Android Production Build)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 13,
    color: Colors.dark.primaryLight,
    fontWeight: '600',
  },
  verifiedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoKey: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  signOutBtn: {
    marginTop: 6,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
});
