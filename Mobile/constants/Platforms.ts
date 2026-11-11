export interface PlatformMeta {
  id: string;
  name: string;
  icon: string;
  color: string;
  baseUrl: string;
  apiUrl?: string;
}

export const PLATFORMS: Record<string, PlatformMeta> = {
  codeforces: {
    id: 'codeforces',
    name: 'Codeforces',
    icon: 'code-slash',
    color: '#1F8ACB',
    baseUrl: 'https://codeforces.com',
    apiUrl: 'https://codeforces.com/api',
  },
  leetcode: {
    id: 'leetcode',
    name: 'LeetCode',
    icon: 'terminal',
    color: '#FFA116',
    baseUrl: 'https://leetcode.com',
  },
  atcoder: {
    id: 'atcoder',
    name: 'AtCoder',
    icon: 'flame',
    color: '#333333',
    baseUrl: 'https://atcoder.jp',
  },
  codechef: {
    id: 'codechef',
    name: 'CodeChef',
    icon: 'restaurant',
    color: '#5B4638',
    baseUrl: 'https://www.codechef.com',
  },
};

export const COMMON_TOPICS = [
  'implementation',
  'math',
  'greedy',
  'dp',
  'data structures',
  'brute force',
  'constructive algorithms',
  'graphs',
  'sortings',
  'binary search',
  'dfs and similar',
  'trees',
  'strings',
  'number theory',
  'combinatorics',
  'two pointers',
  'bitmasks',
];
