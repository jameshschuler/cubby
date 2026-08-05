# Cubby Project Plan

App working title: Cubby

## Mission

Help users plan and track savings and investing goals with simple cadence-based targets, progress history, and savings-rate insights.

## Platform

- Mobile-first React Native app using Expo + TypeScript
- Initial focus on iOS
- Lightweight UI with stylesheets and Lucide icons
- This is a side project, so the roadmap stays simple and iterative

## MVP Scope (V1)

### Completed

- [x] Goal creation, editing, and deletion
- [x] Goal details and progress history
- [x] Monthly and yearly summaries
- [x] Savings-rate tracking and income settings
- [x] Local persistence on device
- [x] JSON export/share support
- [x] Basic stats and trend views
- [x] Core onboarding and empty-state experience

### Remaining for MVP

- [ ] Tighten UI polish and consistency across screens
- [ ] Improve validation and edge-case handling for goal/input flows
- [ ] Expand cadence support for more flexible saving patterns
- [ ] Improve empty states and first-run guidance
- [ ] Add stronger testing around calculations and data flows
- [ ] Finalize a clean release-ready experience for iOS

## MVP Screens

1. Onboarding / empty state
2. Dashboard with summaries and trends
3. Goal details
4. Add/Edit goal
5. Log progress
6. Income and savings-rate settings
7. Export/share screen

## Data Model (MVP, local)

1. Goal
2. ProgressEvent
3. IncomeEvent
4. UserSettings
5. Derived calculations for totals, completion ratio, and savings rate

## Architecture (MVP)

- React Native with Expo + TypeScript
- Local persistence layer
- Lightweight component-based UI
- Date/period utilities and calculation helpers
- JSON export serializer

## V2 Roadmap

### Planned for V2

- [ ] Cloud sync and account support
- [ ] Shared goals or shared spaces
- [ ] Collaboration and permissions
- [ ] Web app parity
- [ ] Rewards/badges or gamification layer
- [ ] Offline-first sync model with conflict handling
