import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { UserStatistics } from '../../types/user';
import { Card } from '../common/Card';

interface StatsOverviewProps {
  stats: UserStatistics | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const total = stats?.total_solved || 0;
  const easy = stats?.easy_solved || 0;
  const medium = stats?.medium_solved || 0;
  const hard = stats?.hard_solved || 0;
  const streak = stats?.current_streak || 0;
  const contests = stats?.contests_participated || 0;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Practice & Activity</Text>

      <View style={styles.grid}>
        <View style={styles.statItem}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="checkmark-done" size={20} color={Colors.dark.primaryLight} />
          </View>
          <View>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Problems Solved</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="flame" size={20} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.statNumber}>{streak} days</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Ionicons name="trophy-outline" size={20} color={Colors.dark.accent} />
          </View>
          <View>
            <Text style={styles.statNumber}>{contests}</Text>
            <Text style={styles.statLabel}>Contests Attended</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.statNumber}>
              {total > 0 ? `${Math.min(100, Math.round(total * 0.8))}%` : '0%'}
            </Text>
            <Text style={styles.statLabel}>Goal Progress</Text>
          </View>
        </View>
      </View>

      <View style={styles.breakdownSection}>
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownLabel}>Difficulty Breakdown</Text>
          <Text style={styles.breakdownSummary}>
            {easy} Easy · {medium} Medium · {hard} Hard
          </Text>
        </View>

        <View style={styles.progressTrack}>
          {total > 0 ? (
            <>
              <View
                style={[
                  styles.progressSegment,
                  {
                    flex: Math.max(1, easy),
                    backgroundColor: '#10B981',
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                  },
                ]}
              />
              <View
                style={[
                  styles.progressSegment,
                  {
                    flex: Math.max(1, medium),
                    backgroundColor: '#3B82F6',
                  },
                ]}
              />
              <View
                style={[
                  styles.progressSegment,
                  {
                    flex: Math.max(1, hard),
                    backgroundColor: '#EF4444',
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  },
                ]}
              />
            </>
          ) : (
            <View
              style={[
                styles.progressSegment,
                { flex: 1, backgroundColor: Colors.dark.surfaceElevated },
              ]}
            />
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.dark.surfaceElevated,
    padding: 10,
    borderRadius: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  breakdownSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  breakdownSummary: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  progressTrack: {
    height: 8,
    flexDirection: 'row',
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
});
