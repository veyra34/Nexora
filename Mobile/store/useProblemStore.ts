import { create } from 'zustand';
import { Problem } from '../types/problem';
import { CodeforcesService } from '../services/codeforces';

interface ProblemState {
  problems: Problem[];
  isLoading: boolean;
  isRefreshing: boolean;
  searchQuery: string;
  selectedTag: string | null;
  ratingMin: number;
  ratingMax: number;
  sortBy: 'RATING_ASC' | 'RATING_DESC' | 'NAME';
  solvedProblemIds: Set<string>;

  fetchProblems: (tags?: string[]) => Promise<void>;
  refreshProblems: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setRatingRange: (min: number, max: number) => void;
  setSortBy: (sort: 'RATING_ASC' | 'RATING_DESC' | 'NAME') => void;
  setSolvedProblemIds: (ids: string[]) => void;
  getFilteredProblems: () => Problem[];
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: [],
  isLoading: false,
  isRefreshing: false,
  searchQuery: '',
  selectedTag: null,
  ratingMin: 800,
  ratingMax: 3500,
  sortBy: 'RATING_ASC',
  solvedProblemIds: new Set<string>(),

  fetchProblems: async (tags?: string[]) => {
    try {
      set({ isLoading: true });
      const problems = await CodeforcesService.getProblems(tags);
      set({ problems });
    } catch (error) {
      console.warn('[useProblemStore] fetchProblems error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshProblems: async () => {
    try {
      set({ isRefreshing: true });
      const currentTag = get().selectedTag;
      const problems = await CodeforcesService.getProblems(currentTag ? [currentTag] : undefined);
      set({ problems });
    } catch (error) {
      console.warn('[useProblemStore] refreshProblems error:', error);
    } finally {
      set({ isRefreshing: false });
    }
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSelectedTag: (selectedTag: string | null) => {
    set({ selectedTag });
    get().refreshProblems();
  },
  setRatingRange: (ratingMin: number, ratingMax: number) => set({ ratingMin, ratingMax }),
  setSortBy: (sortBy: 'RATING_ASC' | 'RATING_DESC' | 'NAME') => set({ sortBy }),
  setSolvedProblemIds: (ids: string[]) => set({ solvedProblemIds: new Set(ids) }),

  getFilteredProblems: () => {
    const { problems, searchQuery, ratingMin, ratingMax, sortBy, solvedProblemIds } = get();

    let list = problems.filter((p) => {
      if (p.rating && (p.rating < ratingMin || p.rating > ratingMax)) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesId = p.id.toLowerCase().includes(query);
        const matchesIndex = p.index.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesIndex) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'RATING_ASC') {
        return (a.rating || 0) - (b.rating || 0);
      }
      if (sortBy === 'RATING_DESC') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return a.name.localeCompare(b.name);
    });

    return list.map((p) => ({
      ...p,
      isSolved: solvedProblemIds.has(p.id) || (p.contest_id ? solvedProblemIds.has(`${p.contest_id}-${p.index}`) : false),
    }));
  },
}));
