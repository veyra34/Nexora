export interface Problem {
  id: string;
  contest_id?: number;
  index: string;
  name: string;
  type?: string;
  rating?: number;
  tags: string[];
  platform: 'codeforces' | 'leetcode' | 'atcoder';
  url: string;
  isSolved?: boolean;
  isBookmarked?: boolean;
}

export interface BookmarkedProblem {
  id: string;
  user_id: string;
  problem_id: string;
  title: string;
  platform: string;
  rating?: number;
  tags: string[];
  url?: string;
  notes?: string;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  problem_id: string;
  problem_title: string;
  platform: string;
  suggested_difficulty: string;
  suggested_rating: number;
  topic: string;
  reason: string;
  practice_sequence: number;
  is_completed: boolean;
  created_at: string;
}
