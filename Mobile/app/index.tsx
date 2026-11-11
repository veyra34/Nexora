import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/useAuthStore';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { session, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && session) {
      router.replace('/(tabs)');
    }
  }, [session, isInitialized, router]);

  const features = [
    {
      icon: 'trophy',
      color: '#6366F1',
      title: 'Unified Contest Radar',
      desc: 'Real-time schedules, countdowns, and alerts for upcoming Codeforces & global rounds.',
    },
    {
      icon: 'code-slash',
      color: '#06B6D4',
      title: 'Targeted Problemset',
      desc: 'Browse, filter by rating & topic tags, bookmark challenges, and track solved tasks.',
    },
    {
      icon: 'sparkles',
      color: '#A855F7',
      title: 'Gemini AI Mentor',
      desc: 'Personalized practice recommendations based on your rating weaknesses and history.',
    },
    {
      icon: 'analytics',
      color: '#10B981',
      title: 'Performance Analytics',
      desc: 'Automated rating curves, category breakdowns, and streak monitoring in one app.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="terminal" size={32} color="#818CF8" />
          </View>
          <Text style={styles.brandTitle}>NEXORA</Text>
          <Text style={styles.brandSubtitle}>
            Transform your competitive programming practice with precision analytics & AI guidance.
          </Text>
        </View>

        <View style={styles.featureList}>
          {features.map((item, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${item.color}22` }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionSection}>
          <Button
            title="Get Started"
            size="lg"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.primaryButton}
          />
          <Button
            title="Log In"
            variant="secondary"
            size="md"
            onPress={() => router.push('/(auth)/login')}
            style={styles.secondaryButton}
          />
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: width * 0.85,
  },
  featureList: {
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  actionSection: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
