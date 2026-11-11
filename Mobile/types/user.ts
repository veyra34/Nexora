export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedPlatform {
  id: string;
  user_id: string;
  platform: 'codeforces' | 'leetcode' | 'atcoder';
  handle: string;
  rating: number;
  max_rating: number;
  rank: string;
  max_rank: string;
  is_verified: boolean;
  last_synced_at?: string;
}

export interface UserStatistics {
  id: string;
  user_id: string;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  current_streak: number;
  max_streak: number;
  contests_participated: number;
  last_active_date?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'dark' | 'light' | 'system';
  notifications_enabled: boolean;
  contest_reminders: boolean;
  default_platform: string;
  preferred_difficulty_min: number;
  preferred_difficulty_max: number;
}
