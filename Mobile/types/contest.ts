export interface Contest {
  id: string;
  platform: 'codeforces' | 'atcoder' | 'leetcode' | 'codechef' | 'nexora';
  platform_contest_id: number;
  name: string;
  type?: string;
  phase: 'BEFORE' | 'CODING' | 'FINISHED';
  duration_seconds: number;
  start_time: string;
  website_url?: string;
}

export type ContestFilter = 'ALL' | 'UPCOMING' | 'ONGOING' | 'FINISHED';
export type PlatformFilter = 'ALL' | 'codeforces' | 'atcoder' | 'leetcode' | 'codechef';
