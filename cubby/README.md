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

## Testing and QA

### Automated tests

Run the unit and component suites locally:

```bash
npm test
npx tsc --noEmit
```

### Manual testing checklist for real users

Use this checklist when validating the app in the simulator or on device:

- [ ] Create a new goal with a name, target amount, and recurring or one-time settings.
- [ ] Edit the goal name, target, and contribution settings and confirm the updates persist.
- [ ] Add a manual contribution to a goal and confirm the new balance updates immediately.
- [ ] Update an existing contribution to a different amount and confirm the previous value is replaced.
- [ ] Delete a goal and confirm the goal disappears from the list and related progress is removed or preserved as expected.
- [ ] Confirm onboarding, stats, and achievements still behave normally after the changes above.

## Current structure

- App.tsx: starter MVP screen and flows
- src/types.ts: app data models
- src/storage.ts: local persistence
- src/calculations.ts: period/date and progress calculations
- src/formatters.ts: currency and percent formatters

## Notes

- Data is local-only in this version.
- V2 backend/auth/collaboration from project plan is not started yet.
