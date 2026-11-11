import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, cfPlatform, statistics, user, signOut, linkCodeforcesHandle } =
    useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const displayName = profile?.display_name || profile?.username || 'Competitive Programmer';
  const username = profile?.username || 'user';
  const email = profile?.email || user?.email || '';

  const handleLink = async () => {
    if (!handleInput.trim()) {
      setErrorMsg('Please enter a handle.');
      return;
    }
    setErrorMsg('');
    setIsLinking(true);
    const res = await linkCodeforcesHandle(handleInput.trim());
    setIsLinking(false);
    if (res.success) {
      setIsModalOpen(false);
      setHandleInput('');
    } else {
      setErrorMsg(res.error || 'Failed to link account.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Nexora?', [
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

  const badges = [
    {
      title: 'Nexora Pioneer',
      desc: 'Early member of Nexora CP platform',
      icon: 'sparkles',
      unlocked: true,
      color: '#818CF8',
    },
    {
      title: 'First AC',
      desc: 'Solved first verified problem',
      icon: 'checkmark-circle',
      unlocked: (statistics?.total_solved || 0) > 0,
      color: '#10B981',
    },
    {
      title: 'Century Solver',
      desc: 'Solved 100+ coding problems',
      icon: 'trophy',
      unlocked: (statistics?.total_solved || 0) >= 100,
      color: '#F59E0B',
    },
    {
      title: 'Specialist Rank',
      desc: 'Achieved rating >= 1400',
      icon: 'medal',
      unlocked: (cfPlatform?.rating || 0) >= 1400,
      color: '#06B6D4',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Profile"
        subtitle="Manage your identity & platforms"
        showSettings
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.username}>@{username}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connected Coding Platforms</Text>
          <TouchableOpacity onPress={() => setIsModalOpen(true)}>
            <Text style={styles.actionText}>+ Link Handle</Text>
          </TouchableOpacity>
        </View>

        {cfPlatform ? (
          <Card style={styles.platformCard}>
            <View style={styles.platformHeader}>
              <View style={styles.platformLeft}>
                <Ionicons name="code-slash" size={20} color="#1F8ACB" />
                <View>
                  <Text style={styles.platformName}>Codeforces</Text>
                  <Text style={styles.platformHandle}>@{cfPlatform.handle}</Text>
                </View>
              </View>

              <Badge
                label={cfPlatform.rank.toUpperCase()}
                color="#818CF8"
                backgroundColor="rgba(99, 102, 241, 0.15)"
              />
            </View>

            <View style={styles.platformStats}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Rating</Text>
                <Text style={styles.statVal}>{cfPlatform.rating || 'Unrated'}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Max Rating</Text>
                <Text style={styles.statVal}>{cfPlatform.max_rating || '-'}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={[styles.statVal, { color: '#10B981' }]}>Verified</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyPlatformCard}>
            <Text style={styles.emptyPlatformText}>No external platform linked yet.</Text>
            <Button
              title="Connect Codeforces Account"
              variant="outline"
              size="sm"
              onPress={() => setIsModalOpen(true)}
              style={{ marginTop: 8 }}
            />
          </Card>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 10 }]}>
          Achievements & Milestones
        </Text>
        <View style={styles.badgeGrid}>
          {badges.map((b) => (
            <Card
              key={b.title}
              style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}
            >
              <View
                style={[
                  styles.badgeIcon,
                  { backgroundColor: b.unlocked ? `${b.color}22` : '#1F2937' },
                ]}
              >
                <Ionicons
                  name={b.icon as any}
                  size={22}
                  color={b.unlocked ? b.color : Colors.dark.textMuted}
                />
              </View>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </Card>
          ))}
        </View>

        <Button
          title="Sign Out of Nexora"
          variant="danger"
          size="md"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>

      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect Platform</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            {errorMsg ? <Text style={styles.modalError}>{errorMsg}</Text> : null}

            <Input
              label="Codeforces Handle"
              placeholder="e.g. tourist, Benq, riyaziya"
              value={handleInput}
              onChangeText={setHandleInput}
              autoCapitalize="none"
              autoCorrect={false}
              icon="code-slash"
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setIsModalOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Link Account"
                loading={isLinking}
                onPress={handleLink}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  profileCard: {
    marginBottom: 16,
    backgroundColor: '#121A2D',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  username: {
    fontSize: 13,
    color: Colors.dark.primaryLight,
    fontWeight: '600',
    marginTop: 2,
  },
  email: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  actionText: {
    fontSize: 13,
    color: Colors.dark.primaryLight,
    fontWeight: '600',
  },
  platformCard: {
    marginBottom: 12,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  platformHandle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  platformStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 2,
  },
  emptyPlatformCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  emptyPlatformText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  badgeCard: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
  },
  badgeLocked: {
    opacity: 0.45,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 3,
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  modalError: {
    color: Colors.dark.error,
    fontSize: 12,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
