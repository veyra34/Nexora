import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { CodeforcesService } from '../services/codeforces';
import { ConnectedPlatform, Profile, UserStatistics } from '../types/user';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  cfPlatform: ConnectedPlatform | null;
  statistics: UserStatistics | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  linkCodeforcesHandle: (handle: string) => Promise<{ success: boolean; error?: string }>;
  syncCodeforcesData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  cfPlatform: null,
  statistics: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({ session, user: session.user });
        await get().fetchProfile(session.user.id);
      } else {
        set({ session: null, user: null, profile: null, cfPlatform: null, statistics: null });
      }

      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession) {
          set({ session: newSession, user: newSession.user });
          await get().fetchProfile(newSession.user.id);
        } else {
          set({ session: null, user: null, profile: null, cfPlatform: null, statistics: null });
        }
      });
    } catch (error) {
      console.warn('[useAuthStore] initialize error:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        set({ profile });
      }

      const { data: platforms } = await supabase
        .from('connected_platforms')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'codeforces')
        .maybeSingle();

      if (platforms) {
        set({ cfPlatform: platforms });
      }

      const { data: stats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (stats) {
        set({ statistics: stats });
      }
    } catch (err) {
      console.warn('[useAuthStore] fetchProfile error:', err);
    }
  },

  linkCodeforcesHandle: async (handle: string) => {
    const user = get().user;
    if (!user) return { success: false, error: 'User not logged in' };

    const cleanHandle = handle.trim();
    if (!cleanHandle) return { success: false, error: 'Please enter a valid handle' };

    const cfUser = await CodeforcesService.getUser(cleanHandle);
    if (!cfUser) {
      return { success: false, error: `Codeforces handle "${cleanHandle}" not found` };
    }

    try {
      const { data, error } = await supabase
        .from('connected_platforms')
        .upsert(
          {
            user_id: user.id,
            platform: 'codeforces',
            handle: cfUser.handle,
            rating: cfUser.rating || 0,
            max_rating: cfUser.maxRating || 0,
            rank: cfUser.rank || 'unrated',
            max_rank: cfUser.maxRank || 'unrated',
            is_verified: true,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, platform' }
        )
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      set({ cfPlatform: data as ConnectedPlatform });

      await get().syncCodeforcesData();

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to link account' };
    }
  },

  syncCodeforcesData: async () => {
    const { user, cfPlatform } = get();
    if (!user || !cfPlatform) return;

    try {
      const cfUser = await CodeforcesService.getUser(cfPlatform.handle);
      if (cfUser) {
        await supabase
          .from('connected_platforms')
          .update({
            rating: cfUser.rating || 0,
            max_rating: cfUser.maxRating || 0,
            rank: cfUser.rank || 'unrated',
            max_rank: cfUser.maxRank || 'unrated',
            last_synced_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('platform', 'codeforces');

        set((state) => ({
          cfPlatform: state.cfPlatform
            ? {
                ...state.cfPlatform,
                rating: cfUser.rating || 0,
                max_rating: cfUser.maxRating || 0,
                rank: cfUser.rank || 'unrated',
                max_rank: cfUser.maxRank || 'unrated',
              }
            : null,
        }));
      }

      const submissions = await CodeforcesService.getUserSubmissions(cfPlatform.handle, 200);
      const acceptedSubmissions = submissions.filter((s) => s.verdict === 'OK');
      const uniqueSolvedProblems = new Set(acceptedSubmissions.map((s) => `${s.problem.contestId}-${s.problem.index}`));
      const totalSolved = uniqueSolvedProblems.size;

      let easySolved = 0;
      let mediumSolved = 0;
      let hardSolved = 0;

      for (const s of acceptedSubmissions) {
        const rating = s.problem.rating;
        if (!rating) continue;
        if (rating < 1200) easySolved++;
        else if (rating <= 1600) mediumSolved++;
        else hardSolved++;
      }

      await supabase
        .from('user_statistics')
        .upsert({
          user_id: user.id,
          total_solved: totalSolved,
          easy_solved: easySolved,
          medium_solved: mediumSolved,
          hard_solved: hardSolved,
          updated_at: new Date().toISOString(),
        });

      await get().fetchProfile(user.id);
    } catch (err) {
      console.warn('[useAuthStore] syncCodeforcesData error:', err);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, cfPlatform: null, statistics: null });
  },
}));
