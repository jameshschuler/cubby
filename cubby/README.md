# Cubby (MVP Starter)

Expo + React Native + TypeScript starter for the Cubby savings tracker app.

## What is implemented

- Expo project scaffolded with TypeScript
- Minimal single-screen dashboard UI
- Goal creation fields:
  - Name
  - Nickname
  - Origin
  - Category
  - Target amount
  - Cadence defaults to monthly
- Period selector:
  - Weekly
  - Monthly (default)
  - Yearly
- Per-goal progress logging
- History-ready event model (progress + income events)
- Savings rate summary (actual vs target)
- Local persistence with AsyncStorage
- JSON export using expo-file-system + expo-sharing
- Lucide icons in UI

## Stack

- React Native (Expo)
- TypeScript
- Stylesheets (StyleSheet API)
- Lucide icons
- AsyncStorage for local data

## Run

```bash
npm install
npm run ios
```

From project directory:

```bash
cd cubby
npm run start
```

## Current structure

- App.tsx: starter MVP screen and flows
- src/types.ts: app data models
- src/storage.ts: local persistence
- src/calculations.ts: period/date and progress calculations
- src/formatters.ts: currency and percent formatters

## Notes

- Data is local-only in this version.
- V2 backend/auth/collaboration from project plan is not started yet.
