# Cubby

Cubby is an Expo + React Native + TypeScript app for tracking savings goals locally.

## Setup

```bash
npm install
```

## Common Workflows

Use `npm run dev` for daily app development.
Use `npm run ios`, `npm run android`, or `npm run web` when you want to open the app on a specific platform.
Use `npm run device:ios` when you want to install and run the iOS app on a physical device.
Use `npm run eas:build:ios:local` when you want a production-style iOS build on your Mac before TestFlight.

## Scripts

- `start`: Start the Expo dev server for general app work.
- `start:lan`: Start the Expo dev server on the local network.
- `android`: Build and run the native Android app.
- `ios`: Build and run the native iOS app in the simulator.
- `dev`: Start the dev client server for day-to-day development.
- `dev:ios`: Same as `dev`, kept as a dedicated iOS-focused entry point.
- `device:ios`: Build and install the iOS app on a connected device.
- `build:ios:device`: Same as `device:ios`, kept for clarity in release workflows.
- `prebuild:clean`: Regenerate native projects from scratch.
- `web`: Run the app in a browser.
- `lint`: Check the codebase for lint issues.
- `lint:fix`: Auto-fix lint issues where possible.
- `format`: Format the codebase with Prettier.
- `format:check`: Check formatting without changing files.
- `test`: Run the Vitest suite once.
- `eas:whoami`: Check which Expo account is signed in.
- `eas:build:ios`: Start the production iOS cloud build for release.
- `eas:build:ios:local`: Run the production iOS build locally before TestFlight.
- `eas:submit:ios`: Submit the latest iOS build to App Store Connect.
- `release:ios`: Run the cloud production build and submit flow together.

## Testing

```bash
npm test
npx tsc --noEmit
```

## Release Notes

Use the EAS production build scripts for TestFlight and App Store releases.
Keep versioning and release metadata in `app.json` in sync with each submission.
