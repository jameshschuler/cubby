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

## App Store Release (Path A: EAS)

This project is configured for EAS cloud builds.

### 1) Verify EAS login

```bash
npm run eas:whoami
```

### 2) Build iOS production binary

```bash
npm run eas:build:ios
```

### 3) Submit latest iOS build to App Store Connect

```bash
npm run eas:submit:ios
```

### Optional: run build + submit together

```bash
npm run release:ios
```

### Notes

- Increment `expo.version` for each public release.
- EAS is configured with `autoIncrement` for production builds.
- Keep `expo.ios.bundleIdentifier` aligned with the App Store Connect app record.
- Complete App Store Connect metadata, screenshots, and privacy details before review.

### Pre-release checklist (iOS)

- [ ] Confirm release version in `app.json` (`expo.version`) is correct for this release.
- [ ] Confirm `npm run eas:whoami` shows the expected Expo account.
- [ ] Run quality checks: `npm test` and `npx tsc --noEmit`.
- [ ] Verify icon and splash look correct on simulator and one physical device.
- [ ] Build production binary with `npm run eas:build:ios`.
- [ ] Submit the latest build with `npm run eas:submit:ios`.
- [ ] In App Store Connect, attach the processed build and complete release notes.
- [ ] Complete App Privacy fields and submit for review.

### Optional CI automation for dev builds

This project is connected to Expo dashboard workflows, so you can configure dev builds directly in EAS Workflows without maintaining a separate GitHub Actions build file.

Recommended setup:

- Trigger on pushes to `main`.
- Use the `development` profile for iOS dev client builds.
- Keep production submissions manual (or separately gated) for safer releases.

### GitHub quality checks on push

This repo includes [quality checks workflow](.github/workflows/quality-checks.yml) that runs on pushes to `main` and pull requests to `main`:

- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run format:check`

## Current structure

- App.tsx: starter MVP screen and flows
- src/types.ts: app data models
- src/storage.ts: local persistence
- src/calculations.ts: period/date and progress calculations
- src/formatters.ts: currency and percent formatters

## Notes

- Data is local-only in this version.
- V2 backend/auth/collaboration from project plan is not started yet.
