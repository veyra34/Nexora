# Nexora API Documentation

This document covers all internal and external API integrations powering the **Nexora** competitive programming mobile application.

---

## 1. Architecture Overview

Nexora connects to three distinct API layers:
1. **Supabase Data & Auth API**: RESTful endpoints and PostgreSQL RPC triggers for authentication, user profiles, bookmarks, statistics, preferences, and recommendations.
2. **Official Codeforces API**: Public competitive programming data service providing live contests, rating histories, problem sets, and submission verdicts.
3. **Google Gemini AI API**: Generative AI mentoring service providing personalized problem recommendations based on algorithmic weaknesses.

---

## 2. Supabase API Endpoints & Data Operations

Nexora communicates with Supabase using `@supabase/supabase-js`. All queries enforce **Row Level Security (RLS)** via signed JWT tokens.

### 2.1. Authentication & Deep-Link Email Flow
- **Sign Up**: `supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'nexora://auth-callback', data: { username, display_name } } })`
- **Sign In**: `supabase.auth.signInWithPassword({ email, password })`
- **Sign Out**: `supabase.auth.signOut()`
- **Password Reset**: `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'nexora://auth-callback' })`
- **Resend Confirmation**: `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: 'nexora://auth-callback' } })`
- **Set Session from Callback**: `supabase.auth.setSession({ access_token, refresh_token })`
- **Exchange PKCE Code**: `supabase.auth.exchangeCodeForSession(code)`

#### Deep-Link URL Scheme & Error Handling
Nexora registers the `nexora://` custom URL scheme. Email confirmation and password recovery links redirect to `nexora://auth-callback`.
- **Success URL**: `nexora://auth-callback#access_token=...&refresh_token=...&type=signup`
- **Expired / Reused Link**: `nexora://auth-callback?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`
- **Rate Limit Error (HTTP 429)**: `over_email_send_rate_limit` handled gracefully with countdown cooldown timers (60s - 120s) and friendly messages.

### 2.2. Profiles (`public.profiles`)
- **Fetch Profile**:
  ```ts
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  ```
- **Update Profile**:
  ```ts
  await supabase.from('profiles').update({ display_name, bio, avatar_url }).eq('id', userId);
  ```

### 2.3. Connected Platforms (`public.connected_platforms`)
- **Upsert Platform Handle**:
  ```ts
  await supabase.from('connected_platforms').upsert({
    user_id: userId,
    platform: 'codeforces',
    handle: 'tourist',
    rating: 3850,
    max_rating: 3979,
    rank: 'legendary grandmaster',
    max_rank: 'legendary grandmaster',
    is_verified: true,
  }, { onConflict: 'user_id, platform' });
  ```

### 2.4. Bookmarked Problems (`public.bookmarked_problems`)
- **Fetch User Bookmarks**:
  ```ts
  const { data } = await supabase.from('bookmarked_problems').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  ```
- **Add Bookmark**:
  ```ts
  await supabase.from('bookmarked_problems').insert({ user_id, problem_id, title, platform, rating, tags, url });
  ```
- **Delete Bookmark**:
  ```ts
  await supabase.from('bookmarked_problems').delete().eq('user_id', userId).eq('problem_id', problemId);
  ```

### 2.5. AI Recommendations (`public.recommendations`)
- **Fetch Saved Recommendations**:
  ```ts
  const { data } = await supabase.from('recommendations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  ```
- **Insert Recommendation**:
  ```ts
  await supabase.from('recommendations').insert({
    user_id,
    problem_id,
    problem_title,
    suggested_difficulty,
    suggested_rating,
    topic,
    reason,
    practice_sequence,
  });
  ```

---

## 3. Codeforces Official API Integration

**Base URL**: `https://codeforces.com/api`  
All requests are performed using `axios` with configured timeouts and client-side error handling.

### 3.1. User Information
- **Endpoint**: `/user.info?handles={handle}`
- **Method**: `GET`
- **Response Fields Used**:
  - `handle`: string
  - `rating`: number
  - `maxRating`: number
  - `rank`: string
  - `maxRank`: string
  - `avatar`: string

### 3.2. User Rating Progression
- **Endpoint**: `/user.rating?handle={handle}`
- **Method**: `GET`
- **Response Fields Used**:
  - `contestId`: number
  - `contestName`: string
  - `rank`: number
  - `oldRating`: number
  - `newRating`: number
  - `ratingUpdateTimeSeconds`: number

### 3.3. User Submissions History
- **Endpoint**: `/user.status?handle={handle}&from=1&count=200`
- **Method**: `GET`
- **Response Fields Used**:
  - `id`: number
  - `verdict`: `'OK' | 'WRONG_ANSWER' | ...`
  - `problem.contestId`: number
  - `problem.index`: string
  - `problem.name`: string
  - `problem.rating`: number
  - `problem.tags`: string[]

### 3.4. Contest List
- **Endpoint**: `/contest.list?gym=false`
- **Method**: `GET`
- **Response Fields Used**:
  - `id`: number
  - `name`: string
  - `phase`: `'BEFORE' | 'CODING' | 'FINISHED'`
  - `durationSeconds`: number
  - `startTimeSeconds`: number

### 3.5. Problemset
- **Endpoint**: `/problemset.problems?tags={optional_tag}`
- **Method**: `GET`
- **Response Fields Used**:
  - `problems[].contestId`: number
  - `problems[].index`: string
  - `problems[].name`: string
  - `problems[].rating`: number
  - `problems[].tags`: string[]

---

## 4. Google Gemini AI API Integration

**Base URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`  
**Method**: `POST`  
**Query Param**: `key={EXPO_PUBLIC_GEMINI_API_KEY}`

### 4.1. Request Schema
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Mentoring prompt with user rating, solved tag distribution, weak topics, and candidate real problems..."
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.2,
    "responseMimeType": "application/json"
  }
}
```

### 4.2. Response Mapping
```json
[
  {
    "candidateIndex": 0,
    "suggested_difficulty": "Challenging",
    "topic": "dp",
    "reason": "Strengthens dynamic programming transition states for your current 1400 rating threshold.",
    "practice_sequence": 1
  }
]
```
*Guaranteed Authenticity: Recommendations only reference pre-fetched real Codeforces problems passed in context, ensuring zero hallucinated problem IDs or URLs.*
