import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getDifficultyColor } from '../../constants/Colors';
import { Problem } from '../../types/problem';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ProblemCardProps {
  problem: Problem;
  isBookmarked: boolean;
  onPress: () => void;
  onBookmarkToggle: () => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  isBookmarked,
  onPress,
  onBookmarkToggle,
}) => {
  const diff = getDifficultyColor(problem.rating);

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {problem.isSolved && (
              <View style={styles.solvedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            )}
            <Text style={styles.index}>{problem.index}.</Text>
            <Text style={styles.title} numberOfLines={1}>
              {problem.name}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onBookmarkToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#F59E0B' : Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          {problem.rating ? (
            <Badge
              label={`${problem.rating}`}
              color={diff.text}
              backgroundColor={diff.bg}
              size="sm"
            />
          ) : (
            <Badge label="Unrated" color="#9CA3AF" backgroundColor="#1F2937" size="sm" />
          )}

          <View style={styles.tagsContainer}>
            {problem.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {problem.tags.length > 3 && (
              <Text style={styles.moreTags}>+{problem.tags.length - 3}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  solvedBadge: {
    marginRight: 6,
  },
  index: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark.primaryLight,
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  bookmarkButton: {
    padding: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: Colors.dark.surfaceElevated,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  moreTags: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
});
