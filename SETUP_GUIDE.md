# Nexora — Setup & Deployment Guide

This guide walks through configuring Supabase, launching the mobile application on Android (emulator or physical device), and building an APK.

---

## 1. Supabase Setup (Database & Authentication)

### Step 1: Open the SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your Nexora project.
3. On the left navigation sidebar, click on **SQL Editor**.
4. Click **"New query"**.

### Step 2: Run the Schema Migration
1. Open the migration file: [`supabase/migrations/20261111000000_init_nexora_schema.sql`](file:///d:/Personal/CS%20Project/Nexora/supabase/migrations/20261111000000_init_nexora_schema.sql).
2. Copy the entire contents of this file.
3. Paste it into the Supabase SQL Editor and click **Run** (or `Ctrl+Enter`).
4. Ensure the output confirms:
   - Tables created: `profiles`, `connected_platforms`, `contests`, `problems`, `bookmarked_problems`, `user_submissions`, `user_statistics`, `recommendations`, `user_preferences`, `achievements`.
   - Function & Trigger created: `handle_new_user()` on `auth.users`.
   - Row Level Security (RLS) policies successfully enabled.

### Step 3: Configure Auth Settings (Optional / Recommended)
In your Supabase project:
1. Navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
2. If you want users to log in immediately without waiting for an email confirmation link during local development, toggle **"Confirm email"** to **OFF** (or leave ON for production verification).

---

## 2. Environment Variables Configuration

The mobile application uses Expo environment variables located in [`Mobile/.env`](file:///d:/Personal/CS%20Project/Nexora/Mobile/.env):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key

# Optional: Add your Gemini API key to enable Google Gemini recommendation prompts
# Obtain from https://aistudio.google.com/
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

---

## 3. Running the Mobile Application

### Step 1: Start the Development Server
Open PowerShell in the `Mobile` directory:
```powershell
cd "d:\Personal\CS Project\Nexora\Mobile"
npx expo start
```

### Step 2: Running on an Android Emulator
1. Open **Android Studio** and launch your virtual device (AVD).
2. In the terminal where Expo is running, press `a` to open on Android.
3. Expo will automatically install the development build or Expo Go and launch **Nexora**.

### Step 3: Running on a Physical Android Phone
1. Install **Expo Go** from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Ensure your phone and development computer are connected to the same Wi-Fi network.
3. Scan the QR code shown in the terminal using the Expo Go camera.
4. The application will load immediately with live Fast Refresh!

---

## 4. Generating a Standalone Android APK

To generate an Android APK file for physical testing and demonstration:

### Method A: Cloud Build via EAS (Recommended)
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in with your Expo account:
   ```bash
   eas login
   ```
3. Configure the build profile for standalone APK:
   ```bash
   cd Mobile
   eas build:configure
   ```
   In `eas.json`, configure:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```
4. Trigger the APK build:
   ```bash
   eas build -p android --profile preview
   ```
5. When complete, EAS provides a direct download link to your `.apk` file!

### Method B: Local Gradle Prebuild
```bash
cd Mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
The APK will be generated at:
`Mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 5. Building & Running the C++ Domain Layer

The academic C++ Object-Oriented Programming (OOP) foundation is preserved in `include/`, `src/`, and `main.cpp`.

To compile and run using CMake and GCC:
```powershell
cd "d:\Personal\CS Project\Nexora"
cmake -B build -G "MinGW Makefiles"
cmake --build build
.\build\nexora.exe
```
Or directly using MinGW `g++`:
```powershell
g++ -std=c++17 -Iinclude main.cpp src/*.cpp -o nexora.exe
.\nexora.exe
```
All OOP demonstrations (inheritance, virtual base classes, stream overloading, friend functions, templates, type casting, custom exceptions, and RAII) will execute and print test verification.

---

## 6. Supabase Authentication & Custom SMTP Setup (Eliminating Email Rate Limits)

### 6.1. Deep-link Redirect URL Configuration
To allow email confirmation links and password reset links to open the Nexora mobile app automatically on Android:

1. Open your **Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **Nexora**
3. Navigate to **Authentication** -> **URL Configuration**
4. Set **Site URL** to:
   ```text
   nexora://
   ```
5. In **Redirect URLs**, add the following callback URLs:
   ```text
   nexora://auth-callback
   nexora://reset-callback
   exp://*
   ```
6. Click **Save Changes**.

### 6.2. Why Default Supabase Emails Encounter Rate Limits
Supabase's default shared email service has a strict rate limit (typically **3 to 4 emails per hour**) to protect against spam abuse across free-tier projects. When testing or onboarding users, repeated signups or verification attempts will quickly trigger:
- `over_email_send_rate_limit` (HTTP 429)

### 6.3. Configuring Custom SMTP in Supabase (Eliminates Rate Limits)
By configuring Custom SMTP, all transactional emails are delivered through your dedicated email service provider with no Supabase hourly throttling.

1. Create a free account on an SMTP provider such as:
   - **Resend** ([resend.com](https://resend.com)) - Recommended, 3,000 free emails/month
   - **SendGrid** ([sendgrid.com](https://sendgrid.com)) - 100 free emails/day
   - **Brevo / Sendinblue** ([brevo.com](https://brevo.com)) - 300 free emails/day
   - **Amazon SES** or **Mailgun**
2. In Supabase Dashboard, navigate to **Project Settings** -> **Authentication** -> **SMTP Settings**.
3. Toggle **Enable Custom SMTP** to **ON**.
4. Fill in your SMTP provider details:
   - **Sender Email**: `noreply@yourdomain.com` (or your verified sender email)
   - **Sender Name**: `Nexora`
   - **Host**: `smtp.resend.com` (or provider's host, e.g. `smtp.sendgrid.net`)
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Encryption**: TLS
   - **User**: Provider username or `resend` / `apikey`
   - **Password**: Provider SMTP API key or password
5. Click **Save**.

### 6.4. Security Rule: Zero SMTP Secrets in Mobile Client
> [!IMPORTANT]
> **Never store SMTP host, usernames, passwords, or secret keys in the mobile application code or `.env` files.**
> 
> The Nexora mobile application communicates exclusively with Supabase Auth endpoints via `supabase.auth.signUp()` and `supabase.auth.resend()`. Supabase's secure backend dispatches emails through the configured SMTP provider on the server side, keeping all private email credentials completely hidden from client builds and reverse engineering.
