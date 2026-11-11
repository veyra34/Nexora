import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { ContestCard } from '../../components/contests/ContestCard';
import { Input } from '../../components/common/Input';
import { useContestStore } from '../../store/useContestStore';
import { ContestFilter, PlatformFilter } from '../../types/contest';

export default function ContestsScreen() {
  const {
    contests,
    isLoading,
    isRefreshing,
    fetchContests,
    refreshContests,
    phaseFilter,
    setPhaseFilter,
    platformFilter,
    setPlatformFilter,
    searchQuery,
    setSearchQuery,
    getFilteredContests,
  } = useContestStore();

  useEffect(() => {
    if (contests.length === 0) {
      fetchContests();
    }
  }, [contests.length, fetchContests]);

  const filtered = getFilteredContests();

  const phaseTabs: { label: string; value: ContestFilter }[] = [
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Live Now', value: 'ONGOING' },
    { label: 'Past Rounds', value: 'FINISHED' },
  ];

  const platforms: { label: string; value: PlatformFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Codeforces', value: 'codeforces' },
    { label: 'LeetCode', value: 'leetcode' },
    { label: 'AtCoder', value: 'atcoder' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Contests Radar" subtitle="Explore competitive coding rounds" />

      <View style={styles.tabContainer}>
        {phaseTabs.map((tab) => {
          const isActive = phaseFilter === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setPhaseFilter(tab.value)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchSection}>
        <Input
          placeholder="Search by contest name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          rightIcon={searchQuery ? 'close-circle' : undefined}
          onRightIconPress={() => setSearchQuery('')}
          style={{ height: 42 }}
        />
      </View>

      <View style={styles.platformRow}>
        {platforms.map((p) => {
          const isSelected = platformFilter === p.value;
          return (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPlatformFilter(p.value)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primaryLight} />
          <Text style={styles.loadingText}>Fetching contests from Codeforces...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContestCard contest={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshContests}
              tintColor={Colors.dark.primaryLight}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={48} color={Colors.dark.textMuted} />
              <Text style={styles.emptyTitle}>No Contests Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No contests match your current search query.'
                  : 'No rounds found for this category.'}
              </Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surfaceElevated,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: -8,
  },
  platformRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  chipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: Colors.dark.primaryLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  chipTextActive: {
    color: Colors.dark.primaryLight,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
