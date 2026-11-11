import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getRatingColor } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { CodeforcesService } from '../../services/codeforces';
import { CFRatingChange } from '../../types/codeforces';

export default function AnalyticsScreen() {
  const { cfPlatform, statistics, syncCodeforcesData } = useAuthStore();
  const [ratingHistory, setRatingHistory] = useState<CFRatingChange[]>([]);
  const [tagDistribution, setTagDistribution] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    if (!cfPlatform?.handle) return;

    try {
      const history = await CodeforcesService.getUserRatingHistory(cfPlatform.handle);
      setRatingHistory(history.slice(-10).reverse());

      const subs = await CodeforcesService.getUserSubmissions(cfPlatform.handle, 150);
      const accepted = subs.filter((s) => s.verdict === 'OK');

      const tagsMap: Record<string, number> = {};
      const seen = new Set<string>();

      for (const s of accepted) {
        const key = `${s.problem.contestId}-${s.problem.index}`;
        if (seen.has(key)) continue;
        seen.add(key);

        for (const t of s.problem.tags || []) {
          tagsMap[t] = (tagsMap[t] || 0) + 1;
        }
      }

      setTagDistribution(tagsMap);
    } catch (e) {
      console.warn('[AnalyticsScreen] load error:', e);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [cfPlatform?.handle]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await syncCodeforcesData();
    await loadAnalytics();
    setIsRefreshing(false);
  };

  const total = statistics?.total_solved || 0;
  const easy = statistics?.easy_solved || 0;
  const medium = statistics?.medium_solved || 0;
  const hard = statistics?.hard_solved || 0;

  const topTopics = Object.entries(tagDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const maxTopicCount = topTopics[0]?.[1] || 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Analytics" subtitle="Rating performance & topic insights" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primaryLight}
          />
        }
      >
        {!cfPlatform ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="analytics-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No Account Linked</Text>
            <Text style={styles.emptySubtitle}>
              Connect your Codeforces handle on the Home or Profile tab to view rating trends and
              algorithmic strength analysis.
            </Text>
          </Card>
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.sectionLabel}>CODEFORCES PROGRESSION</Text>
                  <Text style={[styles.ratingMain, { color: getRatingColor(cfPlatform.rating) }]}>
                    {cfPlatform.rating > 0 ? cfPlatform.rating : 'Unrated'}
                  </Text>
                  <Text style={styles.rankText}>{cfPlatform.rank.toUpperCase()}</Text>
                </View>

                <View style={styles.statPills}>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniLabel}>Max Rating</Text>
                    <Text style={styles.miniValue}>{cfPlatform.max_rating || '-'}</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniLabel}>Peak Rank</Text>
                    <Text style={styles.miniValue}>{cfPlatform.max_rank || '-'}</Text>
                  </View>
                </View>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Solved Problems Distribution</Text>
              <Text style={styles.cardSubtitle}>{total} unique problems solved</Text>

              <View style={styles.difficultyGrid}>
                <View style={[styles.diffCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Text style={[styles.diffValue, { color: '#10B981' }]}>{easy}</Text>
                  <Text style={styles.diffLabel}>Easy</Text>
                  <Text style={styles.diffRange}>&lt; 1200</Text>
                </View>

                <View style={[styles.diffCard, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Text style={[styles.diffValue, { color: '#3B82F6' }]}>{medium}</Text>
                  <Text style={styles.diffLabel}>Medium</Text>
                  <Text style={styles.diffRange}>1200 - 1600</Text>
                </View>

                <View style={[styles.diffCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={[styles.diffValue, { color: '#EF4444' }]}>{hard}</Text>
                  <Text style={styles.diffLabel}>Hard</Text>
                  <Text style={styles.diffRange}>&gt; 1600</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Top Algorithmic Topics</Text>
              <Text style={styles.cardSubtitle}>Based on your solved submission history</Text>

              {topTopics.length > 0 ? (
                <View style={styles.topicList}>
                  {topTopics.map(([topic, count]) => {
                    const ratio = count / maxTopicCount;
                    return (
                      <View key={topic} style={styles.topicRow}>
                        <View style={styles.topicInfo}>
                          <Text style={styles.topicName}>{topic}</Text>
                          <Text style={styles.topicCount}>{count} solved</Text>
                        </View>
                        <View style={styles.topicTrack}>
                          <View
                            style={[
                              styles.topicFill,
                              {
                                width: `${Math.round(ratio * 100)}%`,
                                backgroundColor: Colors.dark.primaryLight,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>Sync your account to see topic insights.</Text>
              )}
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Recent Contest Performance</Text>
              <Text style={styles.cardSubtitle}>Latest official Codeforces rounds</Text>

              {ratingHistory.length > 0 ? (
                <View style={styles.historyList}>
                  {ratingHistory.map((item) => {
                    const diff = item.newRating - item.oldRating;
                    const isPositive = diff >= 0;
                    return (
                      <View key={item.contestId} style={styles.historyItem}>
                        <View style={styles.contestTextCol}>
                          <Text style={styles.historyContestName} numberOfLines={1}>
                            {item.contestName}
                          </Text>
                          <Text style={styles.historyRank}>Rank #{item.rank}</Text>
                        </View>

                        <View style={styles.ratingChangeCol}>
                          <Text style={styles.newRatingText}>{item.newRating}</Text>
                          <Badge
                            label={`${isPositive ? '+' : ''}${diff}`}
                            color={isPositive ? '#10B981' : '#EF4444'}
                            backgroundColor={
                              isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                            }
                            size="sm"
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>No contest rating history available yet.</Text>
              )}
            </Card>
          </>
        )}
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#121A2D',
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ratingMain: {
    fontSize: 36,
    fontWeight: '900',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  statPills: {
    gap: 8,
  },
  miniStat: {
    backgroundColor: Colors.dark.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  miniLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
  miniValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  card: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 14,
  },
  difficultyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  diffCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  diffValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  diffLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  diffRange: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  topicList: {
    gap: 12,
  },
  topicRow: {
    gap: 4,
  },
  topicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
    textTransform: 'capitalize',
  },
  topicCount: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  topicTrack: {
    height: 6,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  topicFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  contestTextCol: {
    flex: 1,
    marginRight: 12,
  },
  historyContestName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  historyRank: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  ratingChangeCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  newRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontStyle: 'italic',
  },
});
