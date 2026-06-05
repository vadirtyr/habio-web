# Habio / OurOrbit — Web ↔ Mobile Parity (PRD)

## Problem statement
User has 3 repos: habio-backend, habio-mobile, habio-web. Goal: bring **habio-web** to
feature parity with **habio-mobile**. Repos public. Backend is live at https://api.habioapp.co.
Work performed inside the actual habio-web codebase (now in /app/frontend).

## Architecture
- Frontend: React (CRA + craco), inline-style design system using CSS vars in src/theme.css,
  sonner toasts, lucide-react icons, react-router-dom v7. API via axios in src/lib/api.js.
- Backend (habio-backend): FastAPI + MongoDB. Production uses MongoDB Atlas; CORS allowlist is
  hardcoded to production domains (ourorbit.net etc.).
- DEV/TEST environment note: production CORS blocks the Emergent preview origin, so for local
  validation the habio-backend was run locally on :8001 against local Mongo (DB=test_database),
  with an added `allow_origin_regex` for *.emergentagent.com. Frontend .env REACT_APP_BACKEND_URL
  points to the preview host (routes /api -> local backend). For PRODUCTION/the real web repo,
  REACT_APP_BACKEND_URL should be https://api.habioapp.co (as in habio-web/.env.example).

## Gap analysis (mobile features web was missing) — ALL IMPLEMENTED
Social/community feature set that existed in mobile but not web:
- Friend Feed (/feed), My Activity (/activity), per-user activity (/users/:id/activity)
- Activity reactions (Like / Cheer) with optimistic updates
- Find People / user search (/people)
- My Profile (/profile) + Edit Profile (/profile/edit, username/displayName/bio/avatar/public toggle)
- Public Profile (/u/:username) with Follow/Unfollow
- Followers (/users/:id/followers) & Following (/users/:id/following)
- Notifications (/notifications) + unread badge in sidebar
- Weekly Recap (/weekly-recap)
- Habit templates (/habits/choose) reachable from Habits "Templates" button

## What's been implemented (2026-06)
- Google Sign-In (web): "Continue with Google" button on Login + Register using @react-oauth/google
  (ID-token/credential flow) -> existing backend POST /auth/google. Gated on REACT_APP_GOOGLE_CLIENT_ID;
  index.js wraps App in GoogleOAuthProvider when the id is present. AuthContext.loginWithGoogle added.
  Button render verified on /login. No backend changes (endpoint already existed).
- New pages: SocialFeed, ActivityFeed, PublicActivity, UserSearch, Profile, EditProfile,
  PublicProfile, Followers, Following, Notifications, WeeklyRecap, ChooseHabit.
- New components: ActivityTimeline (reactions), UserRow.
- lib/api.js: added recapApi; uses existing activityApi/socialApi/profileApi/notificationApi.
- App.js: all new routes wired. Layout.jsx: new nav items + live unread notification badge
  (refreshes on 30s poll AND immediately via 'habio:notif-refresh' window event).
- Habits.jsx: added "Templates" button -> /habits/choose.
- Tested via testing agent: iteration_2.json = 12/13 pass; the 1 stale-badge issue was then FIXED.

## Backlog / Next action items
- P1: Verify against PRODUCTION backend by deploying the web app to an allowed origin
  (the production CORS list must include wherever habio-web is hosted). The code is correct;
  only CORS origin allowlisting differs in prod.
- P2: Avatar icons on web use a generic User glyph (mobile maps MaterialCommunityIcons names).
  Could add an icon map for full visual parity.
- P2: Reaction "cheer" uses HandMetal lucide icon as a stand-in for the mobile "hand-clap".
- P2: Pull-to-refresh / loading skeletons to match mobile polish.

## Test credentials
See /app/memory/test_credentials.md (webtester / orbitfriend, password TestPass123!).
