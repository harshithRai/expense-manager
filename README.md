# Expense Manager

Expense Manager is a mobile app for tracking income and expenses with a fast bottom-sheet quick add flow, monthly budget tracking, recent activity views, and local on-device persistence.

## Tech Stack

- Expo 54
- React 19
- React Native 0.81
- TypeScript
- React Navigation
- `@gorhom/bottom-sheet`
- AsyncStorage for local data persistence

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- Xcode for iOS development on macOS
- Android Studio for Android development
- Expo-compatible simulator, emulator, or physical device

### Install dependencies

```bash
npm install
```

### Run the app

Start the Expo dev server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

## Project Structure

- `App.tsx`: app providers and root setup
- `src/navigation`: tab navigation and quick add sheet mounting
- `src/screens`: top-level app screens
- `src/components`: reusable UI, cards, transactions, and form components
- `src/context`: finance state and transaction actions
- `src/storage`: local persistence helpers
- `src/utils`: date, finance, and currency helpers

## Scripts

- `npm start`: start the Expo dev server
- `npm run android`: run the Android app
- `npm run ios`: run the iOS app
- `npm run web`: run the web target
- `npm run lint`: run Expo ESLint checks
- `npm run typecheck`: run the TypeScript compiler without emitting files
- `npm test`: placeholder test script for future automated tests

## Quality Checks

Current PR validation covers:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- Expo Android bundle validation in CI

There are no real automated application tests yet. The current `npm test` script is a placeholder intended to be replaced with real tests later.

## Development Notes

- App data is stored locally on-device.
- The quick add flow is mounted globally through the finance context and bottom sheet provider.
- Commit message validation is enforced locally through Husky `commit-msg`.

## Developer Workflow

Keep your fork's `main` branch aligned with `upstream/main`. Do new work on short-lived feature branches, not directly on `main`.

### Start a new task

```bash
git fetch upstream
git checkout main
git reset --hard upstream/main
git push --force-with-lease origin main
git checkout -b feature/your-change
```

### After a PR is merged

```bash
git fetch upstream
git checkout main
git reset --hard upstream/main
git push --force-with-lease origin main
```

### Rules

- Never start new work directly on `main`.
- If a PR is already open from a feature branch, keep committing to that same branch.
- If you accidentally make changes on `main`, move them to a feature branch before opening a PR.
