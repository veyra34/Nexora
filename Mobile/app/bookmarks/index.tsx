import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getDifficultyColor } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function BookmarksScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bookmarks, isLoading, fetchBookmarks, toggleBookmark } = useBookmarkStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchBookmarks(user.id);
    }
  }, [user?.id]);

  const filtered = bookmarks.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.problem_id.toLowerCase().includes(q);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Saved Bookmarks" subtitle={`${bookmarks.length} problems saved`} showBack />

      <View style={styles.searchSection}>
        <Input
          placeholder="Filter bookmarks..."
          value={search}
          onChangeText={setSearch}
          icon="search-outline"
          rightIcon={search ? 'close-circle' : undefined}
          onRightIconPress={() => setSearch('')}
          style={{ height: 40 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              if (user?.id) fetchBookmarks(user.id);
            }}
            tintColor={Colors.dark.primaryLight}
          />
        }
        renderItem={({ item }) => {
          const diff = getDifficultyColor(item.rating);
          const cfUrl =
            item.url ||
            `https://codeforces.com/problemset/problem/${item.problem_id.replace('cf-', '').replace('-', '/')}`;

          return (
            <Card style={styles.card}>
              <View style={styles.rowTop}>
                <View style={styles.titleCol}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.id}>{item.problem_id.toUpperCase()}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (user?.id) {
                      toggleBookmark(user.id, {
                        id: item.problem_id,
                        name: item.title,
                        index: '',
                        rating: item.rating,
                        tags: item.tags,
                        platform: item.platform as any,
                        url: cfUrl,
                      });
                    }
                  }}
                  style={styles.trashBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.dark.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.rowBottom}>
                {item.rating ? (
                  <Badge
                    label={`${item.rating}`}
                    color={diff.text}
                    backgroundColor={diff.bg}
                    size="sm"
                  />
                ) : (
                  <Badge label="Unrated" color="#9CA3AF" backgroundColor="#1F2937" size="sm" />
                )}

                <TouchableOpacity
                  onPress={() => Linking.openURL(cfUrl).catch(() => {})}
                  style={styles.openBtn}
                >
                  <Text style={styles.openBtnText}>Open in CF</Text>
                  <Ionicons name="open-outline" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No Saved Problems</Text>
            <Text style={styles.emptySubtitle}>
              Browse the Problemset tab and tap the bookmark icon on any problem to save it for
              targeted practice.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: -6,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 10,
    padding: 14,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  id: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  trashBtn: {
    padding: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  openBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    maxWidth: 260,
  },
});
