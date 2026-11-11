import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { ProblemCard } from '../../components/problems/ProblemCard';
import { Input } from '../../components/common/Input';
import { useProblemStore } from '../../store/useProblemStore';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useAuthStore } from '../../store/useAuthStore';
import { COMMON_TOPICS } from '../../constants/Platforms';

export default function ProblemsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    problems,
    isLoading,
    isRefreshing,
    fetchProblems,
    refreshProblems,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    ratingMin,
    ratingMax,
    setRatingRange,
    sortBy,
    setSortBy,
    getFilteredProblems,
  } = useProblemStore();

  const { isBookmarked, toggleBookmark } = useBookmarkStore();

  useEffect(() => {
    if (problems.length === 0) {
      fetchProblems();
    }
  }, [problems.length, fetchProblems]);

  const filtered = getFilteredProblems();

  const difficultyPresets = [
    { label: 'All Ratings', min: 800, max: 3500 },
    { label: 'Easy (<1200)', min: 800, max: 1199 },
    { label: 'Medium (1200-1600)', min: 1200, max: 1600 },
    { label: 'Hard (1600-2000)', min: 1601, max: 2000 },
    { label: 'Expert (>2000)', min: 2001, max: 3500 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Problemset"
        subtitle="Practice algorithms & data structures"
        showAI
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/bookmarks')}
            style={styles.bookmarkNavButton}
          >
            <Ionicons name="bookmark" size={20} color="#F59E0B" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchSection}>
        <Input
          placeholder="Search problem title or ID (e.g. 1950A)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          rightIcon={searchQuery ? 'close-circle' : undefined}
          onRightIconPress={() => setSearchQuery('')}
          style={{ height: 42 }}
        />
      </View>

      <View style={styles.tagsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
          <TouchableOpacity
            onPress={() => setSelectedTag(null)}
            style={[styles.tagPill, !selectedTag && styles.tagPillActive]}
          >
            <Text style={[styles.tagText, !selectedTag && styles.tagTextActive]}>All Topics</Text>
          </TouchableOpacity>
          {COMMON_TOPICS.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setSelectedTag(isActive ? null : tag)}
                style={[styles.tagPill, isActive && styles.tagPillActive]}
              >
                <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {difficultyPresets.map((preset) => {
            const isSelected = ratingMin === preset.min && ratingMax === preset.max;
            return (
              <TouchableOpacity
                key={preset.label}
                onPress={() => setRatingRange(preset.min, preset.max)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.countBar}>
        <Text style={styles.countText}>{filtered.length} problems</Text>
        <TouchableOpacity
          onPress={() => {
            if (sortBy === 'RATING_ASC') setSortBy('RATING_DESC');
            else if (sortBy === 'RATING_DESC') setSortBy('NAME');
            else setSortBy('RATING_ASC');
          }}
          style={styles.sortToggle}
        >
          <Ionicons name="swap-vertical" size={14} color={Colors.dark.primaryLight} />
          <Text style={styles.sortText}>
            {sortBy === 'RATING_ASC' ? 'Rating ↑' : sortBy === 'RATING_DESC' ? 'Rating ↓' : 'Name'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primaryLight} />
          <Text style={styles.loadingText}>Fetching Codeforces problems...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered.slice(0, 100)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProblemCard
              problem={item}
              isBookmarked={isBookmarked(item.id)}
              onPress={() =>
                router.push({
                  pathname: '/problem/[id]',
                  params: {
                    id: item.id,
                    name: item.name,
                    index: item.index,
                    rating: item.rating ? item.rating.toString() : '',
                    tags: item.tags.join(','),
                    url: item.url,
                    contestId: item.contest_id ? item.contest_id.toString() : '',
                  },
                })
              }
              onBookmarkToggle={() => {
                if (user?.id) {
                  toggleBookmark(user.id, item);
                }
              }}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshProblems}
              tintColor={Colors.dark.primaryLight}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Colors.dark.textMuted} />
              <Text style={styles.emptyTitle}>No Problems Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search query, topic, or rating filter.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  bookmarkNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: -8,
  },
  tagsSection: {
    paddingVertical: 8,
  },
  tagsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tagPillActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primaryLight,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    paddingBottom: 6,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterChipActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  filterChipText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.dark.accent,
  },
  countBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: '600',
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    color: Colors.dark.primaryLight,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
});
