import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getRatingColor } from '../../constants/Colors';
import { ConnectedPlatform } from '../../types/user';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface RatingBannerProps {
  platform: ConnectedPlatform | null;
  onConnectPress: () => void;
  onSyncPress?: () => void;
  isSyncing?: boolean;
}

export const RatingBanner: React.FC<RatingBannerProps> = ({
  platform,
  onConnectPress,
  onSyncPress,
  isSyncing = false,
}) => {
  if (!platform) {
    return (
      <Card style={styles.card}>
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="link-outline" size={28} color={Colors.dark.primaryLight} />
          </View>
          <View style={styles.emptyInfo}>
            <Text style={styles.emptyTitle}>Connect Codeforces</Text>
            <Text style={styles.emptySubtitle}>
              Link your handle to track your rating, submissions, and get AI recommendations.
            </Text>
          </View>
          <TouchableOpacity onPress={onConnectPress} style={styles.connectButton}>
            <Text style={styles.connectText}>Connect</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  const ratingColor = getRatingColor(platform.rating);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.platformBadge}>
            <Ionicons name="code-slash" size={14} color="#1F8ACB" />
            <Text style={styles.platformText}>Codeforces</Text>
          </View>
          <Text style={styles.handle}>@{platform.handle}</Text>
        </View>
        {onSyncPress && (
          <TouchableOpacity
            onPress={onSyncPress}
            disabled={isSyncing}
            style={styles.syncButton}
          >
            <Ionicons
              name={isSyncing ? 'refresh' : 'sync'}
              size={16}
              color={Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        <View>
          <Text style={styles.ratingLabel}>Current Rating</Text>
          <View style={styles.ratingValueRow}>
            <Text style={[styles.ratingNumber, { color: ratingColor }]}>
              {platform.rating > 0 ? platform.rating : 'Unrated'}
            </Text>
            <Badge
              label={platform.rank.toUpperCase()}
              color={ratingColor}
              backgroundColor={`${ratingColor}22`}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text style={styles.ratingLabel}>Max Rating</Text>
          <Text style={styles.secondaryValue}>
            {platform.max_rating > 0 ? platform.max_rating : '-'}
          </Text>
          <Text style={styles.maxRankText}>({platform.max_rank})</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#121A2D',
    borderWidth: 1,
    borderColor: '#243254',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyInfo: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  connectText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 138, 203, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  platformText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F8ACB',
  },
  handle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  syncButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.border,
  },
  statBox: {
    alignItems: 'flex-start',
  },
  secondaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  maxRankText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
});
