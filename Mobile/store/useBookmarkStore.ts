import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { BookmarkedProblem, Problem } from '../types/problem';

interface BookmarkState {
  bookmarks: BookmarkedProblem[];
  bookmarkedIds: Set<string>;
  isLoading: boolean;

  fetchBookmarks: (userId: string) => Promise<void>;
  toggleBookmark: (userId: string, problem: Problem) => Promise<boolean>;
  isBookmarked: (problemId: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  bookmarkedIds: new Set<string>(),
  isLoading: false,

  fetchBookmarks: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('bookmarked_problems')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookmarks = (data as BookmarkedProblem[]) || [];
      const bookmarkedIds = new Set(bookmarks.map((b) => b.problem_id));
      set({ bookmarks, bookmarkedIds });
    } catch (error) {
      console.warn('[useBookmarkStore] fetchBookmarks error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBookmark: async (userId: string, problem: Problem): Promise<boolean> => {
    const { bookmarkedIds, bookmarks } = get();
    const alreadyBookmarked = bookmarkedIds.has(problem.id);

    try {
      if (alreadyBookmarked) {
        const nextIds = new Set(bookmarkedIds);
        nextIds.delete(problem.id);
        set({
          bookmarkedIds: nextIds,
          bookmarks: bookmarks.filter((b) => b.problem_id !== problem.id),
        });

        await supabase
          .from('bookmarked_problems')
          .delete()
          .eq('user_id', userId)
          .eq('problem_id', problem.id);

        return false;
      } else {
        const newBookmark: BookmarkedProblem = {
          id: `temp-${Date.now()}`,
          user_id: userId,
          problem_id: problem.id,
          title: problem.name,
          platform: problem.platform,
          rating: problem.rating,
          tags: problem.tags,
          url: problem.url,
          created_at: new Date().toISOString(),
        };

        const nextIds = new Set(bookmarkedIds);
        nextIds.add(problem.id);
        set({
          bookmarkedIds: nextIds,
          bookmarks: [newBookmark, ...bookmarks],
        });

        const { data, error } = await supabase
          .from('bookmarked_problems')
          .insert({
            user_id: userId,
            problem_id: problem.id,
            title: problem.name,
            platform: problem.platform,
            rating: problem.rating,
            tags: problem.tags,
            url: problem.url,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          set((state) => ({
            bookmarks: state.bookmarks.map((b) => (b.problem_id === problem.id ? (data as BookmarkedProblem) : b)),
          }));
        }

        return true;
      }
    } catch (error) {
      console.warn('[useBookmarkStore] toggleBookmark error:', error);
      await get().fetchBookmarks(userId);
      return alreadyBookmarked;
    }
  },

  isBookmarked: (problemId: string) => {
    return get().bookmarkedIds.has(problemId);
  },
}));
