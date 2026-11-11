export const Colors = {
  dark: {
    background: '#090D16',
    surface: '#111827',
    surfaceElevated: '#1A2234',
    card: '#151D2F',
    cardBorder: '#23304B',
    border: '#1F293D',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    accent: '#06B6D4',
    accentLight: '#22D3EE',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    tabBar: '#0C111E',
    tabBarBorder: '#1A2338',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    border: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#4F46E5',
    primaryLight: '#6366F1',
    primaryDark: '#4338CA',
    accent: '#0891B2',
    accentLight: '#06B6D4',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  },
  ranks: {
    unrated: '#808080',
    newbie: '#CCCCCC',
    pupil: '#77FF77',
    specialist: '#77DDBB',
    expert: '#AAAAFF',
    candidateMaster: '#FF88FF',
    master: '#FFCC88',
    internationalMaster: '#FFBB55',
    grandmaster: '#FF7777',
    internationalGrandmaster: '#FF3333',
    legendaryGrandmaster: '#AA0000',
  },
  platforms: {
    codeforces: '#1F8ACB',
    leetcode: '#FFA116',
    atcoder: '#333333',
    codechef: '#5B4638',
    nexora: '#6366F1',
  }
};

export const getRatingColor = (rating?: number): string => {
  if (!rating || rating <= 0) return Colors.ranks.unrated;
  if (rating < 1200) return '#9CA3AF';
  if (rating < 1400) return '#10B981';
  if (rating < 1600) return '#06B6D4';
  if (rating < 1900) return '#3B82F6';
  if (rating < 2100) return '#A855F7';
  if (rating < 2400) return '#F59E0B';
  return '#EF4444';
};

export const getDifficultyColor = (rating?: number): { bg: string; text: string; label: string } => {
  if (!rating) return { bg: '#374151', text: '#9CA3AF', label: 'Unrated' };
  if (rating <= 1100) return { bg: '#064E3B', text: '#34D399', label: `Easy (${rating})` };
  if (rating <= 1500) return { bg: '#164E63', text: '#38BDF8', label: `Medium (${rating})` };
  if (rating <= 1900) return { bg: '#4C1D95', text: '#C084FC', label: `Hard (${rating})` };
  return { bg: '#7F1D1D', text: '#F87171', label: `Expert (${rating})` };
};
