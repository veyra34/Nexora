# Nexora ⚡

> **A Complete Competitive Programming Mobile Application for Android**  
> Built with React Native, Expo, TypeScript, Supabase, Codeforces API, Gemini AI, and a preserved academic C++17 OOP domain architecture.

---

## 📱 Highlights & Features

- **Unified Contest Radar**: Real-time schedules, countdowns, and alerts across competitive programming rounds (Codeforces, LeetCode, AtCoder, CodeChef).
- **Targeted Problemset Explorer**: Browse thousands of real problems, filter by difficulty (rating 800 - 3500) and algorithmic topics (dp, math, greedy, graphs), search, and bookmark.
- **Automated Platform Sync**: Link your Codeforces handle to synchronize current rating, max rating, rank title, submission history, and solved streaks.
- **Gemini AI Practice Mentor**: Generates personalized, pedagogical problem recommendations based on your rating threshold and weak topics, with guaranteed valid problem URLs.
- **Performance Analytics**: Visual rating curve history, solved problems distribution (Easy, Medium, Hard), and top algorithmic categories breakdown.
- **Cloud Persistence & Security**: PostgreSQL hosted on Supabase, with automatic profile creation triggers and strict Row-Level Security (RLS).
- **Preserved C++17 OOP Architecture**: Full academic Object-Oriented design (diamond multiple inheritance, virtual base classes, stream operator overloading, friend functions, templates, custom exceptions, and RAII) retained and documented.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Mobile Frontend** | React Native, Expo (SDK 52), Expo Router v4, TypeScript, React Native SVG, Expo Vector Icons |
| **State Management**| Zustand, Custom React Hooks |
| **Networking & HTTP**| Axios (with timeout & retry), Supabase JavaScript Client |
| **Backend & Database**| Supabase PostgreSQL, Supabase Auth (JWT), Row-Level Security (RLS) |
| **External Integrations**| Official Codeforces API, Google Gemini AI API |
| **Domain Layer** | C++17 (CMake, MinGW GCC) |

---

## 📂 Project Structure

```
Nexora/
├── Mobile/                         # Complete React Native / Expo Mobile Application
│   ├── app/                        # Expo Router file-based screens
│   │   ├── _layout.tsx             # Root layout & providers
│   │   ├── index.tsx               # Onboarding & Splash
│   │   ├── (auth)/                 # Login, Registration, Forgot Password
│   │   ├── (tabs)/                 # Bottom navigation: Home, Contests, Problems, Analytics, Profile
│   │   ├── problem/[id].tsx        # Problem details, notes & bookmarking
│   │   ├── recommendations/        # Dedicated Gemini AI practice recommendations
│   │   ├── bookmarks/              # Saved problems
│   │   └── settings/               # App configuration & account management
│   ├── components/                 # Reusable UI components
│   │   ├── common/                 # Header, Card, Button, Badge, Input
│   │   ├── dashboard/              # RatingBanner, StatsOverview
│   │   ├── contests/               # ContestCard, FilterTabs
│   │   └── problems/               # ProblemCard, TagPill
│   ├── constants/                  # Color palette, platform metadata
│   ├── services/                   # Supabase, Codeforces API, Gemini AI
│   ├── store/                      # Zustand state slices (auth, contest, problem, bookmark)
│   ├── types/                      # TypeScript domain interfaces
│   ├── app.json                    # Android package & Expo config
│   └── package.json
├── include/                        # C++ Header Files
│   ├── User.h, Contestant.h, Contest.h, Problem.h, ContestManager.h
│   ├── Account.h, CompetitiveProfile.h, PlatformProfile.h, NexoraMember.h
│   ├── Exceptions.h, TemplateDemo.h
├── src/                            # C++ Implementation Files
│   ├── User.cpp, Contestant.cpp, Contest.cpp, Problem.cpp, ContestManager.cpp, Account.cpp
├── docs/                           # UML Diagrams & Noun-Verb Analysis
├── supabase/migrations/            # PostgreSQL Schema & RLS Migrations
├── main.cpp                        # C++ Academic OOP Verification Harness
├── CMakeLists.txt                  # C++ Build Configuration
├── DATABASE_SCHEMA.md              # Detailed Database Documentation
├── OOP_CONCEPTS.md                 # Complete C++ OOP Concept Mapping
├── API_DOCUMENTATION.md            # Supabase, Codeforces, and Gemini API Docs
├── SETUP_GUIDE.md                  # Step-by-Step Setup & Build Instructions
└── .env.example
```

---

## 🚀 Quick Start Guide

### 1. Database Setup
1. Log in to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** $\rightarrow$ **New query**.
3. Run the SQL script from [`supabase/migrations/20261111000000_init_nexora_schema.sql`](file:///d:/Personal/CS%20Project/Nexora/supabase/migrations/20261111000000_init_nexora_schema.sql).

### 2. Configure Environment Variables
Copy `.env.example` to `Mobile/.env` and update your keys:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key # Optional
```

### 3. Launch the Mobile Application
```powershell
cd "d:\Personal\CS Project\Nexora\Mobile"
npx expo start
```
- Press `a` to run on Android Emulator.
- Or scan the terminal QR code with the **Expo Go** app on your physical Android phone.

---

## 📚 Documentation Links

- [Complete Setup Guide](file:///d:/Personal/CS%20Project/Nexora/SETUP_GUIDE.md)
- [C++ OOP Concept Mapping](file:///d:/Personal/CS%20Project/Nexora/OOP_CONCEPTS.md)
- [Database Schema & Security Matrix](file:///d:/Personal/CS%20Project/Nexora/DATABASE_SCHEMA.md)
- [API Documentation](file:///d:/Personal/CS%20Project/Nexora/API_DOCUMENTATION.md)
