import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Contest } from '../../types/contest';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ContestCardProps {
  contest: Contest;
}

export const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  const startDate = new Date(contest.start_time);
  const now = new Date();
  const diffMs = startDate.getTime() - now.getTime();

  let timeString = '';
  if (contest.phase === 'BEFORE') {
    if (diffMs > 0) {
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) timeString = `Starts in ${days}d ${hours}h`;
      else if (hours > 0) timeString = `Starts in ${hours}h ${mins}m`;
      else timeString = `Starts in ${mins}m`;
    } else {
      timeString = 'Starting soon';
    }
  } else if (contest.phase === 'CODING') {
    timeString = 'LIVE NOW';
  } else {
    timeString = 'Ended';
  }

  const durationHours = Math.floor(contest.duration_seconds / 3600);
  const durationMins = Math.floor((contest.duration_seconds % 3600) / 60);
  const durationStr = `${durationHours}h ${durationMins > 0 ? `${durationMins}m` : ''}`.trim();

  const handleOpen = () => {
    if (contest.website_url) {
      Linking.openURL(contest.website_url).catch(() => {});
    }
  };

  const getPhaseBadge = () => {
    if (contest.phase === 'CODING') {
      return <Badge label="LIVE" color="#EF4444" backgroundColor="rgba(239, 68, 68, 0.15)" />;
    }
    if (contest.phase === 'BEFORE') {
      return <Badge label="UPCOMING" color="#10B981" backgroundColor="rgba(16, 185, 129, 0.15)" />;
    }
    return <Badge label="FINISHED" color="#9CA3AF" backgroundColor="rgba(156, 163, 175, 0.15)" />;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.platformBadge}>
          <Ionicons name="code-slash" size={13} color="#1F8ACB" />
          <Text style={styles.platformText}>Codeforces</Text>
        </View>
        {getPhaseBadge()}
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {contest.name}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={Colors.dark.textSecondary} />
          <Text style={styles.detailText}>{durationStr}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.dark.textSecondary} />
          <Text style={styles.detailText}>
            {startDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.timeTag}>
          <Ionicons
            name={contest.phase === 'CODING' ? 'radio' : 'timer-outline'}
            size={14}
            color={contest.phase === 'CODING' ? '#EF4444' : Colors.dark.accent}
          />
          <Text
            style={[
              styles.timeString,
              contest.phase === 'CODING' && { color: '#EF4444', fontWeight: '700' },
            ]}
          >
            {timeString}
          </Text>
        </View>

        <TouchableOpacity onPress={handleOpen} style={styles.actionButton}>
          <Text style={styles.actionText}>
            {contest.phase === 'BEFORE' ? 'Register' : 'Enter'}
          </Text>
          <Ionicons name="open-outline" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F8ACB',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeString: {
    fontSize: 13,
    color: Colors.dark.accent,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
