import { create } from 'zustand';
import { Contest, ContestFilter, PlatformFilter } from '../types/contest';
import { CodeforcesService } from '../services/codeforces';

interface ContestState {
  contests: Contest[];
  isLoading: boolean;
  isRefreshing: boolean;
  phaseFilter: ContestFilter;
  platformFilter: PlatformFilter;
  searchQuery: string;

  fetchContests: () => Promise<void>;
  refreshContests: () => Promise<void>;
  setPhaseFilter: (filter: ContestFilter) => void;
  setPlatformFilter: (filter: PlatformFilter) => void;
  setSearchQuery: (query: string) => void;
  getFilteredContests: () => Contest[];
}

export const useContestStore = create<ContestState>((set, get) => ({
  contests: [],
  isLoading: false,
  isRefreshing: false,
  phaseFilter: 'UPCOMING',
  platformFilter: 'ALL',
  searchQuery: '',

  fetchContests: async () => {
    try {
      set({ isLoading: true });
      const contests = await CodeforcesService.getContests(false);
      set({ contests });
    } catch (error) {
      console.warn('[useContestStore] fetchContests error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshContests: async () => {
    try {
      set({ isRefreshing: true });
      const contests = await CodeforcesService.getContests(false);
      set({ contests });
    } catch (error) {
      console.warn('[useContestStore] refreshContests error:', error);
    } finally {
      set({ isRefreshing: false });
    }
  },

  setPhaseFilter: (phaseFilter: ContestFilter) => set({ phaseFilter }),
  setPlatformFilter: (platformFilter: PlatformFilter) => set({ platformFilter }),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  getFilteredContests: () => {
    const { contests, phaseFilter, platformFilter, searchQuery } = get();

    return contests.filter((contest) => {
      if (phaseFilter === 'UPCOMING' && contest.phase !== 'BEFORE') return false;
      if (phaseFilter === 'ONGOING' && contest.phase !== 'CODING') return false;
      if (phaseFilter === 'FINISHED' && contest.phase !== 'FINISHED') return false;

      if (platformFilter !== 'ALL' && contest.platform !== platformFilter) return false;

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = contest.name.toLowerCase().includes(query);
        const matchesPlatform = contest.platform.toLowerCase().includes(query);
        if (!matchesName && !matchesPlatform) return false;
      }

      return true;
    });
  },
}));
