# Cubby Project Plan

## MVP Feature List

- [x] Goal creation, editing, and deletion
- [x] Goal details and progress history
- [x] Monthly and yearly summaries
- [x] Savings-rate tracking and income settings
- [x] Local persistence on device
- [x] JSON export/share support
- [x] Basic stats and trend views
- [x] Core onboarding and empty-state experience
- [ ] Finalize a clean release-ready experience for iOS
  - [ ] Confirm cold-launch visuals on device (icon + native splash + no flash)
  - [ ] Verify export/share JSON flow on a physical iPhone
  - [ ] Run full manual QA pass: onboarding, add/edit/delete, progress logging, stats, settings, relaunch persistence
  - [ ] Complete device build + archive in Xcode with successful signing/provisioning
  - [ ] Upload build to App Store Connect and confirm build visibility in TestFlight/Builds
  - [ ] Capture final App Store screenshots and verify listing metadata/privacy text

## V2 Planned Features

- [ ] Expand cadence support for more flexible saving patterns
  - [ ] Add richer cadence types in goal setup: biweekly, semimonthly (1st/15th), weekly by weekday, and every N months
  - [ ] Add optional schedule boundaries: start date, optional end date, and pause/resume controls
  - [ ] Extend data model/storage for advanced cadence rules with backward compatibility for existing goals
  - [ ] Update contribution-generation logic to support the new cadence rules and edge cases (month length, leap year, timezone-safe anchors)
  - [ ] Update home/stats projections so forecasted progress reflects advanced cadence schedules
  - [ ] Add migration + regression tests for cadence parsing, recurrence generation, and calculation accuracy
  - [ ] Add UX guardrails and validation copy for invalid cadence combinations (e.g., impossible day-of-month selections)
- [ ] Cloud sync and account support
- [ ] Shared goals or shared spaces
- [ ] Collaboration and permissions
- [ ] Web app parity
- [ ] Rewards/badges or gamification layer
- [ ] Offline-first sync model with conflict handling
