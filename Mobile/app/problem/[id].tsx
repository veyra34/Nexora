import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getDifficultyColor } from '../../constants/Colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../services/supabase';

export default function ProblemDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    index: string;
    rating: string;
    tags: string;
    url: string;
    contestId: string;
  }>();

  const { user } = useAuthStore();
  const { isBookmarked, toggleBookmark } = useBookmarkStore();

  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const problemId = params.id || '';
  const problemName = params.name || 'Problem Details';
  const problemIndex = params.index || '';
  const ratingNum = params.rating ? parseInt(params.rating, 10) : undefined;
  const tagsList = params.tags ? params.tags.split(',') : [];
  const problemUrl =
    params.url ||
    (params.contestId
      ? `https://codeforces.com/problemset/problem/${params.contestId}/${problemIndex}`
      : 'https://codeforces.com/problemset');

  const diff = getDifficultyColor(ratingNum);
  const bookmarked = isBookmarked(problemId);

  const handleToggleBookmark = async () => {
    if (!user?.id) {
      Alert.alert('Sign In Required', 'Please log in to bookmark problems.');
      return;
    }
    await toggleBookmark(user.id, {
      id: problemId,
      name: problemName,
      index: problemIndex,
      rating: ratingNum,
      tags: tagsList,
      platform: 'codeforces',
      url: problemUrl,
    });
  };

  const handleOpenProblem = () => {
    Linking.openURL(problemUrl).catch(() => {
      Alert.alert('Error', 'Unable to open external browser link.');
    });
  };

  const handleSaveNotes = async () => {
    if (!user?.id || !notes.trim()) return;
    setIsSavingNotes(true);
    try {
      await supabase
        .from('bookmarked_problems')
        .update({ notes: notes.trim() })
        .eq('user_id', user.id)
        .eq('problem_id', problemId);
      Alert.alert('Success', 'Personal practice notes updated.');
    } catch {
      Alert.alert('Error', 'Could not save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`${problemIndex}. ${problemName}`}
        showBack
        rightAction={
          <TouchableOpacity onPress={handleToggleBookmark} style={styles.bookmarkHeaderBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? '#F59E0B' : Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.metaTop}>
            <View style={styles.platformBadge}>
              <Ionicons name="code-slash" size={14} color="#1F8ACB" />
              <Text style={styles.platformText}>Codeforces</Text>
            </View>

            {ratingNum ? (
              <Badge
                label={diff.label}
                color={diff.text}
                backgroundColor={diff.bg}
                size="md"
              />
            ) : (
              <Badge label="Unrated" color="#9CA3AF" backgroundColor="#1F2937" size="md" />
            )}
          </View>

          <Text style={styles.title}>{problemName}</Text>
          <Text style={styles.contestRef}>
            Contest #{params.contestId || 'Global'} · Problem {problemIndex}
          </Text>

          <Button
            title="Open Problem on Codeforces"
            icon={<Ionicons name="open-outline" size={18} color="#FFFFFF" />}
            size="md"
            onPress={handleOpenProblem}
            style={styles.openButton}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Algorithmic Categories & Tags</Text>
          <View style={styles.tagsContainer}>
            {tagsList.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Ionicons name="pricetag-outline" size={12} color={Colors.dark.primaryLight} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Solution Notes</Text>
          <Text style={styles.sectionSubtitle}>
            Record algorithmic insights, time complexity analysis, or edge cases.
          </Text>

          <TextInput
            placeholder="e.g. Requires prefix sum array + binary search over queries O(N log N)..."
            placeholderTextColor={Colors.dark.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />

          <Button
            title="Save Notes"
            variant="secondary"
            size="sm"
            loading={isSavingNotes}
            onPress={handleSaveNotes}
            style={{ alignSelf: 'flex-end', marginTop: 10 }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  bookmarkHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    padding: 16,
  },
  metaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  platformText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F8ACB',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    lineHeight: 28,
    marginBottom: 4,
  },
  contestRef: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  openButton: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.dark.surfaceElevated,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  notesInput: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    color: Colors.dark.text,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 90,
  },
});
