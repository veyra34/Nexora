import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getRatingColor } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useProblemStore } from '../../store/useProblemStore';
import { GeminiService } from '../../services/gemini';
import { AIRecommendation } from '../../types/problem';

export default function RecommendationsScreen() {
  const router = useRouter();
  const { user, cfPlatform, statistics } = useAuthStore();
  const { problems, fetchProblems } = useProblemStore();

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (problems.length === 0) {
      fetchProblems();
    }
    if (user?.id) {
      loadStoredRecs();
    }
  }, [user?.id, problems.length]);

  const loadStoredRecs = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const existing = await GeminiService.getStoredRecommendations(user.id);
    setRecommendations(existing);
    setIsLoading(false);
  };

  const generateNewRecommendations = async () => {
    if (!user?.id) return;
    setIsGenerating(true);

    try {
      const userRating = cfPlatform?.rating || 1200;
      const recs = await GeminiService.generateRecommendations({
        userId: user.id,
        userRating,
        solvedProblemIds: [],
        solvedTagsCount: {},
        weakTopics: ['dp', 'graphs', 'binary search'],
        candidateProblems: problems,
      });

      setRecommendations(recs);
    } catch (e) {
      console.warn('[RecommendationsScreen] error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Gemini AI Practice" subtitle="Personalized algorithmic roadmap" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.mentorBanner}>
          <View style={styles.mentorHeader}>
            <View style={styles.sparkleIcon}>
              <Ionicons name="sparkles" size={24} color="#818CF8" />
            </View>
            <View style={styles.mentorInfo}>
              <Text style={styles.mentorTitle}>Strategic Problem Ladder</Text>
              <Text style={styles.mentorDesc}>
                Targeted practice based on your Codeforces rating (
                <Text style={{ color: getRatingColor(cfPlatform?.rating), fontWeight: '700' }}>
                  {cfPlatform?.rating || 'Unrated'}
                </Text>
                ) and algorithmic growth areas.
              </Text>
            </View>
          </View>

          <Button
            title={recommendations.length > 0 ? 'Regenerate Recommendations' : 'Generate Practice Plan'}
            icon={<Ionicons name="refresh" size={16} color="#FFFFFF" />}
            size="md"
            loading={isGenerating}
            onPress={generateNewRecommendations}
            style={styles.generateBtn}
          />
        </Card>

        <Text style={styles.listSectionTitle}>Recommended Problems in Sequence</Text>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primaryLight} />
            <Text style={styles.loadingText}>Loading recommendations...</Text>
          </View>
        ) : recommendations.length > 0 ? (
          <View style={styles.recsList}>
            {recommendations.map((rec) => {
              const cfUrl = `https://codeforces.com/problemset/problem/${rec.problem_id.replace('cf-', '').replace('-', '/')}`;
              return (
                <Card key={rec.id} style={styles.recCard}>
                  <View style={styles.recHeader}>
                    <View style={styles.stepCircle}>
                      <Text style={styles.stepText}>#{rec.practice_sequence}</Text>
                    </View>
                    <View style={styles.recTitleCol}>
                      <Text style={styles.recTitle}>{rec.problem_title}</Text>
                      <Text style={styles.recId}>{rec.problem_id.toUpperCase()}</Text>
                    </View>
                    <Badge
                      label={`${rec.suggested_rating}`}
                      color="#818CF8"
                      backgroundColor="rgba(99, 102, 241, 0.15)"
                      size="sm"
                    />
                  </View>

                  <View style={styles.reasonBox}>
                    <Ionicons name="bulb-outline" size={16} color="#F59E0B" style={styles.reasonIcon} />
                    <Text style={styles.reasonText}>{rec.reason}</Text>
                  </View>

                  <View style={styles.recFooter}>
                    <View style={styles.topicBadge}>
                      <Ionicons name="pricetag" size={12} color={Colors.dark.textSecondary} />
                      <Text style={styles.topicText}>{rec.topic}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => Linking.openURL(cfUrl).catch(() => {})}
                      style={styles.solveBtn}
                    >
                      <Text style={styles.solveBtnText}>Solve Now</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="sparkles-outline" size={44} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No Recommendations Generated Yet</Text>
            <Text style={styles.emptyDesc}>
              Tap the button above to have Gemini AI analyze your coding history and generate a
              custom practice sequence.
            </Text>
          </Card>
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
  mentorBanner: {
    backgroundColor: '#161938',
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  mentorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sparkleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorInfo: {
    flex: 1,
  },
  mentorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  mentorDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  generateBtn: {
    width: '100%',
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 4,
  },
  recsList: {
    gap: 12,
  },
  recCard: {
    padding: 14,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.primaryDark,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.dark.primaryLight,
  },
  recTitleCol: {
    flex: 1,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  recId: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  reasonBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    gap: 8,
  },
  reasonIcon: {
    marginTop: 1,
  },
  reasonText: {
    fontSize: 12,
    color: Colors.dark.text,
    lineHeight: 16,
    flex: 1,
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.dark.surfaceElevated,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  topicText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  solveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  solveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
