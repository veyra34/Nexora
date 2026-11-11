
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Competitive programmer practicing on Nexora.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.connected_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- e.g., 'codeforces'
    handle TEXT NOT NULL,
    rating INTEGER DEFAULT 0,
    max_rating INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'unrated',
    max_rank TEXT DEFAULT 'unrated',
    is_verified BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

CREATE TABLE IF NOT EXISTS public.contests (
    id TEXT PRIMARY KEY, -- e.g., 'cf-1950'
    platform TEXT NOT NULL DEFAULT 'codeforces',
    platform_contest_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'CF',
    phase TEXT NOT NULL, -- 'BEFORE', 'CODING', 'FINISHED'
    duration_seconds INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    website_url TEXT,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.problems (
    id TEXT PRIMARY KEY, -- e.g., 'cf-1950-A'
    contest_id INTEGER,
    index TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'PROGRAMMING',
    rating INTEGER,
    tags TEXT[] DEFAULT '{}',
    platform TEXT NOT NULL DEFAULT 'codeforces',
    url TEXT,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.bookmarked_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL,
    title TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'codeforces',
    rating INTEGER,
    tags TEXT[] DEFAULT '{}',
    url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_user_bookmarked_problem UNIQUE (user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS public.user_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL DEFAULT 'codeforces',
    platform_submission_id BIGINT NOT NULL,
    problem_id TEXT NOT NULL,
    problem_name TEXT NOT NULL,
    verdict TEXT NOT NULL, -- e.g. 'OK', 'WRONG_ANSWER'
    language TEXT,
    passed_test_count INTEGER DEFAULT 0,
    time_consumed_ms INTEGER DEFAULT 0,
    memory_consumed_bytes BIGINT DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_user_submission UNIQUE (user_id, platform, platform_submission_id)
);

CREATE TABLE IF NOT EXISTS public.user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    total_solved INTEGER NOT NULL DEFAULT 0,
    easy_solved INTEGER NOT NULL DEFAULT 0,     -- rating < 1200
    medium_solved INTEGER NOT NULL DEFAULT 0,   -- 1200 <= rating <= 1600
    hard_solved INTEGER NOT NULL DEFAULT 0,     -- rating > 1600
    current_streak INTEGER NOT NULL DEFAULT 0,
    max_streak INTEGER NOT NULL DEFAULT 0,
    contests_participated INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL,
    problem_title TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'codeforces',
    suggested_difficulty TEXT,
    suggested_rating INTEGER,
    topic TEXT,
    reason TEXT NOT NULL,
    practice_sequence INTEGER DEFAULT 1,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme TEXT NOT NULL DEFAULT 'dark', -- 'dark' | 'light' | 'system'
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    contest_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    default_platform TEXT NOT NULL DEFAULT 'codeforces',
    preferred_difficulty_min INTEGER DEFAULT 800,
    preferred_difficulty_max INTEGER DEFAULT 1600,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT DEFAULT 'trophy',
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_user ON public.connected_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_contests_phase_start ON public.contests(phase, start_time);
CREATE INDEX IF NOT EXISTS idx_problems_rating ON public.problems(rating);
CREATE INDEX IF NOT EXISTS idx_problems_tags ON public.problems USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_bookmarked_problems_user ON public.bookmarked_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_verdict ON public.user_submissions(user_id, verdict);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON public.recommendations(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    raw_username TEXT;
    clean_username TEXT;
BEGIN
    -- Extract username from metadata or email
    raw_username := NEW.raw_user_meta_data->>'username';
    IF raw_username IS NULL OR raw_username = '' THEN
        clean_username := SPLIT_PART(NEW.email, '@', 1);
    ELSE
        clean_username := raw_username;
    END IF;

    -- Create profile
    INSERT INTO public.profiles (id, username, display_name, email, avatar_url)
    VALUES (
        NEW.id,
        clean_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', clean_username),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create user statistics row
    INSERT INTO public.user_statistics (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarked_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Connected Platforms
CREATE POLICY "Connected platforms are viewable by everyone" 
    ON public.connected_platforms FOR SELECT USING (true);
CREATE POLICY "Users can manage their own connected platforms" 
    ON public.connected_platforms FOR ALL USING (auth.uid() = user_id);

-- 3. Contests (Public read, authenticated sync)
CREATE POLICY "Contests are viewable by everyone" 
    ON public.contests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert/update contests cache" 
    ON public.contests FOR ALL USING (auth.role() = 'authenticated');

-- 4. Problems (Public read, authenticated sync)
CREATE POLICY "Problems are viewable by everyone" 
    ON public.problems FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert/update problems cache" 
    ON public.problems FOR ALL USING (auth.role() = 'authenticated');

-- 5. Bookmarked Problems (Private to each user)
CREATE POLICY "Users can view only their own bookmarks" 
    ON public.bookmarked_problems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookmarks" 
    ON public.bookmarked_problems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookmarks" 
    ON public.bookmarked_problems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" 
    ON public.bookmarked_problems FOR DELETE USING (auth.uid() = user_id);

-- 6. User Submissions
CREATE POLICY "Users can view submissions" 
    ON public.user_submissions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own submissions" 
    ON public.user_submissions FOR ALL USING (auth.uid() = user_id);

-- 7. User Statistics
CREATE POLICY "User statistics are viewable by everyone" 
    ON public.user_statistics FOR SELECT USING (true);
CREATE POLICY "Users can update their own statistics" 
    ON public.user_statistics FOR UPDATE USING (auth.uid() = user_id);

-- 8. Recommendations (Private to user)
CREATE POLICY "Users can view their own recommendations" 
    ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own recommendations" 
    ON public.recommendations FOR ALL USING (auth.uid() = user_id);

-- 9. User Preferences (Private to user)
CREATE POLICY "Users can view their own preferences" 
    ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" 
    ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 10. Achievements
CREATE POLICY "Achievements are viewable by everyone" 
    ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Users can unlock their own achievements" 
    ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
