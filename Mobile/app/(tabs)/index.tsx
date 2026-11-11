import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { RatingBanner } from '../../components/dashboard/RatingBanner';
import { StatsOverview } from '../../components/dashboard/StatsOverview';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useContestStore } from '../../store/useContestStore';
import { useBookmarkStore } from '../../store/useBookmarkStore';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, cfPlatform, statistics, user, linkCodeforcesHandle, syncCodeforcesData } =
    useAuthStore();
  const { contests, fetchContests, isRefreshing, refreshContests } = useContestStore();
  const { fetchBookmarks } = useBookmarkStore();

  const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchContests();
    if (user?.id) {
      fetchBookmarks(user.id);
    }
  }, [fetchContests, fetchBookmarks, user?.id]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncCodeforcesData();
    setIsSyncing(false);
  };

  const handleLinkSubmit = async () => {
    if (!handleInput.trim()) {
      setLinkError('Please enter a handle');
      return;
    }
    setLinkError('');
    setIsLinking(true);
    const result = await linkCodeforcesHandle(handleInput.trim());
    setIsLinking(false);
    if (result.success) {
      setIsConnectModalVisible(false);
      setHandleInput('');
    } else {
      setLinkError(result.error || 'Failed to connect handle.');
    }
  };

  const upcomingContests = contests
    .filter((c) => c.phase === 'BEFORE')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const nextContest = upcomingContests[0];

  const greetingName = profile?.display_name || profile?.username || 'Programmer';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Nexora"
        subtitle="Competitive Programming Hub"
        showAI
        showSettings
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              await Promise.all([refreshContests(), user?.id ? syncCodeforcesData() : null]);
            }}
            tintColor={Colors.dark.primaryLight}
          />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{greetingName} 👋</Text>
        </View>

        <RatingBanner
          platform={cfPlatform}
          onConnectPress={() => setIsConnectModalVisible(true)}
          onSyncPress={handleSync}
          isSyncing={isSyncing}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/recommendations')}
          style={styles.aiActionCard}
        >
          <View style={styles.aiGlow} />
          <View style={styles.aiContent}>
            <View style={styles.aiIconWrapper}>
              <Ionicons name="sparkles" size={24} color="#818CF8" />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiCardTitle}>Gemini AI Practice Mentor</Text>
              <Text style={styles.aiCardSubtitle}>
                Get strategic, topic-targeted problem recommendations crafted for your rating.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#818CF8" />
          </View>
        </TouchableOpacity>

        <StatsOverview stats={statistics} />

        {nextContest && (
          <Card style={styles.nextContestCard}>
            <View style={styles.nextContestHeader}>
              <View style={styles.badgeRow}>
                <Ionicons name="flame" size={16} color="#F59E0B" />
                <Text style={styles.nextContestLabel}>NEXT UPCOMING ROUND</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/contests')}>
                <Text style={styles.viewAllText}>View All Contests</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.nextContestTitle} numberOfLines={2}>
              {nextContest.name}
            </Text>

            <View style={styles.nextContestMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={Colors.dark.textSecondary} />
                <Text style={styles.metaText}>
                  {new Date(nextContest.start_time).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.dark.textSecondary} />
                <Text style={styles.metaText}>
                  {Math.floor(nextContest.duration_seconds / 3600)}h duration
                </Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => router.push('/(tabs)/problems')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Ionicons name="library-outline" size={20} color={Colors.dark.accent} />
            </View>
            <Text style={styles.shortcutTitle}>Problemset</Text>
            <Text style={styles.shortcutDesc}>Filter by rating & tags</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => router.push('/bookmarks')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="bookmarks-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.shortcutTitle}>Bookmarks</Text>
            <Text style={styles.shortcutDesc}>Your saved challenges</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isConnectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConnectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect Codeforces</Text>
              <TouchableOpacity onPress={() => setIsConnectModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Enter your public Codeforces handle. We'll automatically sync your rating, rank, and
              solved problems.
            </Text>

            {linkError ? <Text style={styles.modalError}>{linkError}</Text> : null}

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
                onPress={() => setIsConnectModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Verify & Link"
                loading={isLinking}
                onPress={handleLinkSubmit}
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
  welcomeSection: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  aiActionCard: {
    backgroundColor: '#161938',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    padding: 14,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  aiGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  aiCardSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  nextContestCard: {
    marginBottom: 16,
    backgroundColor: '#121A2D',
  },
  nextContestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  nextContestLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primaryLight,
  },
  nextContestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  nextContestMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  shortcutIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  shortcutDesc: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
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
