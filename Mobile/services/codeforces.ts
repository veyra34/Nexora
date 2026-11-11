import axios from 'axios';
import { CFContest, CFProblem, CFSubmission, CFUser, CFRatingChange } from '../types/codeforces';
import { Contest } from '../types/contest';
import { Problem } from '../types/problem';

const CF_API_BASE = 'https://codeforces.com/api';

const cfClient = axios.create({
  baseURL: CF_API_BASE,
  timeout: 12000,
  headers: {
    'Accept': 'application/json',
  },
});

export const CodeforcesService = {
  async getUser(handle: string): Promise<CFUser | null> {
    try {
      const response = await cfClient.get<{ status: string; result: CFUser[]; comment?: string }>(
        `/user.info?handles=${encodeURIComponent(handle)}`
      );
      if (response.data.status === 'OK' && response.data.result.length > 0) {
        return response.data.result[0];
      }
      return null;
    } catch (error: any) {
      console.warn(`[CodeforcesService] Error fetching user ${handle}:`, error.message);
      return null;
    }
  },

  async getUserRatingHistory(handle: string): Promise<CFRatingChange[]> {
    try {
      const response = await cfClient.get<{ status: string; result: CFRatingChange[] }>(
        `/user.rating?handle=${encodeURIComponent(handle)}`
      );
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      return [];
    } catch (error: any) {
      console.warn(`[CodeforcesService] Error fetching rating history for ${handle}:`, error.message);
      return [];
    }
  },

  async getUserSubmissions(handle: string, count: number = 200): Promise<CFSubmission[]> {
    try {
      const response = await cfClient.get<{ status: string; result: CFSubmission[] }>(
        `/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`
      );
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      return [];
    } catch (error: any) {
      console.warn(`[CodeforcesService] Error fetching submissions for ${handle}:`, error.message);
      return [];
    }
  },

  async getContests(includeGym: boolean = false): Promise<Contest[]> {
    try {
      const response = await cfClient.get<{ status: string; result: CFContest[] }>(
        `/contest.list?gym=${includeGym}`
      );
      if (response.data.status === 'OK') {
        return response.data.result.map((cf): Contest => {
          let phase: 'BEFORE' | 'CODING' | 'FINISHED' = 'FINISHED';
          if (cf.phase === 'BEFORE') phase = 'BEFORE';
          else if (cf.phase === 'CODING') phase = 'CODING';

          const startTime = cf.startTimeSeconds
            ? new Date(cf.startTimeSeconds * 1000).toISOString()
            : new Date().toISOString();

          return {
            id: `cf-${cf.id}`,
            platform: 'codeforces',
            platform_contest_id: cf.id,
            name: cf.name,
            type: cf.type,
            phase,
            duration_seconds: cf.durationSeconds,
            start_time: startTime,
            website_url: `https://codeforces.com/contest/${cf.id}`,
          };
        });
      }
      return [];
    } catch (error: any) {
      console.warn('[CodeforcesService] Error fetching contests:', error.message);
      return [];
    }
  },

  async getProblems(tags?: string[]): Promise<Problem[]> {
    try {
      const tagQuery = tags && tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(';'))}` : '';
      const response = await cfClient.get<{
        status: string;
        result: {
          problems: CFProblem[];
        };
      }>(`/problemset.problems?${tagQuery}`);

      if (response.data.status === 'OK') {
        return response.data.result.problems.map((p): Problem => {
          const contestId = p.contestId || 0;
          return {
            id: `cf-${contestId}-${p.index}`,
            contest_id: contestId,
            index: p.index,
            name: p.name,
            type: p.type,
            rating: p.rating,
            tags: p.tags || [],
            platform: 'codeforces',
            url: `https://codeforces.com/problemset/problem/${contestId}/${p.index}`,
          };
        });
      }
      return [];
    } catch (error: any) {
      console.warn('[CodeforcesService] Error fetching problems:', error.message);
      return [];
    }
  },
};
