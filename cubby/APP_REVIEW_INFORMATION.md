# App Review Information

Use this information in the App Store Connect reply and in the **App Review Information > Notes** field.

## Copy-Paste App Review Reply

```text
Hello App Review,

Thank you for reviewing Cubby. Cubby is a local-only personal savings-goal tracker. It helps users create savings goals, plan optional recurring contributions, manually record progress, review statistics and history, and view achievement milestones. The target audience is individuals who want simple personal financial organization without connecting a bank account.

No login, registration, invitation code, sample file, or account credentials are required. On first launch, tap "Create first goal," enter a goal name and target amount, and save the goal. Users can then add progress and explore the Home, Goals, Stats, Achievements, and Settings sections.

The attached screen recording begins by launching the app on a physical iPhone and demonstrates first-goal creation, adding progress, the main dashboard sections, settings for income and savings targets, JSON export, and the local-data reset flow.

Cubby does not provide account registration, login, cloud synchronization, account-based services, or paid features. The "Erase All Data" option in Settings deletes Cubby data stored locally on the device; there is no online account to delete.

Cubby does not use external data providers, authentication services, payment processors, advertising, analytics, AI services, banking APIs, or cloud services. User data is stored locally on the device and is included in the user's own device or iCloud backups. JSON export uses the device's standard sharing interface.

Cubby is available in the United States only. Amounts are shown in US dollars and the optional account types (such as Roth IRA and 401k) are US account types. It does not provide financial advice, execute transactions, connect to bank accounts, manage funds, or operate as a regulated financial service. Users manually enter their own goals and progress.

Cubby includes two optional hidden achievements as small surprises: tapping the Cubby logo on the Home screen, and earning every other achievement. They only unlock badges on the Achievements screen and do not change any functionality.

There are no special credentials, regulated-service documents, or third-party content authorizations needed to review the app.

Thank you.
```

> Before sending this reply, attach the physical-device screen recording. If the recording has not been attached yet, remove the sentence beginning "The attached screen recording" or replace it with an accurate status update.

## Copy-Paste Responses for Items 2-6

```text
2. App purpose and target audience

Cubby is a local-only personal savings-goal tracker for individuals who want a simple way to plan, monitor, and review progress toward financial goals. It solves the problem of tracking savings progress without requiring a bank connection or financial account. Users can create goals, plan optional scheduled contributions, manually record progress, review statistics and history, configure savings targets, and earn achievement milestones. Cubby provides personal organization and visibility; it does not provide financial advice, execute transactions, or manage money.

3. Setup and access instructions

No login credentials, registration, invitation code, sample files, or external account are required. On first launch, tap "Create first goal," enter a goal name and target amount, and save the goal. Users can optionally configure a category, account type, and scheduled contribution. They can then add progress and access the Home, Goals, Stats, Achievements, and Settings sections. Settings includes income and savings-target configuration, JSON export, and Erase All Data. All app data is stored locally on the device.

4. External services, tools, and platforms

Cubby does not use external data providers, authentication services, payment processors, advertising services, analytics services, AI services, banking APIs, or cloud synchronization. The app uses React Native and Expo for its runtime, Expo Router for navigation, AsyncStorage for local persistence, and Expo FileSystem and Expo Sharing for local JSON export and sharing through the device's standard sharing interface. No user data is transmitted to Cubby-operated servers or third-party services.

5. Regional differences

Cubby is available only on the United States App Store. Amounts are displayed in US dollars, and the optional account-type labels (such as Roth IRA, 401k, and HSA) are US account types. These labels are descriptive only; Cubby does not connect to any financial institution. There are no other region-specific features, content, or pricing.

6. Regulated industry or protected third-party material

Cubby is not a financial institution and does not provide regulated financial, investment, banking, tax, lending, or payment services. It does not connect to bank accounts, execute transactions, provide personalized financial advice, or handle funds. Users manually enter their own goals and progress. Cubby does not include protected third-party material and does not require authorization credentials or supporting documentation for third-party services.
```

## 1. Screen Recording

We have provided a screen recording captured on a physical iPhone running the latest available iOS version.

The recording starts by launching Cubby and demonstrates the typical user flow:

1. Launch Cubby.
2. Complete the welcome flow by creating a savings goal.
3. Configure the goal name, target amount, category, account type, and optional recurring contribution.
4. Add progress to the goal.
5. Review the Home dashboard, Goals list, Stats, and Achievements screens.
6. Open Settings and demonstrate income and savings-target configuration.
7. Demonstrate JSON data export.
8. Demonstrate Erase All Data, including the confirmation step.

Cubby does not have account registration, login, cloud accounts, or account deletion. The **Erase All Data** option deletes Cubby data stored locally on the device.

## 2. App Purpose and Target Audience

Cubby is a personal savings-goal tracking app for people who want a simple way to plan, monitor, and review progress toward financial goals.

Users can create goals for purposes such as emergency savings, purchases, investments, retirement, education, or other personal objectives. Cubby provides progress tracking, scheduled contribution planning, savings-rate or yearly-savings targets, statistics, historical views, and achievement milestones.

The target audience is individual users who want lightweight personal financial organization without connecting bank accounts or sending financial data to an external service. Cubby does not provide financial advice, execute transactions, or manage money.

## 3. Setup and Access Instructions

No login credentials, sample files, invitation codes, or external account are required.

On first launch:

1. Tap **Create first goal**.
2. Enter a goal name and target amount.
3. Optionally select a category, account type, scheduled contribution settings, and other goal details.
4. Save the goal.
5. Add progress from the goal view to populate the dashboard and statistics.

The main features are available from the bottom navigation:

- **Home:** Overview of savings progress and current goals
- **Goals:** Create, edit, delete, and update goals
- **Stats:** Review savings progress over time
- **Achievements:** View earned milestones
- **Settings:** Configure income and savings targets, export local data, or erase all local app data

All app data is stored locally on the device and is included in the user's own device or iCloud backups. The export feature creates a temporary JSON file that can be shared using the device's standard sharing interface; the file is removed from the app after sharing.

## 4. External Services, Tools, and Platforms

Cubby does not use external data providers, authentication services, payment processors, advertising services, analytics services, AI services, banking APIs, or cloud synchronization.

The app uses the following local and platform technologies:

- React Native and Expo for the application runtime
- Expo Router for navigation
- AsyncStorage for local on-device persistence
- Expo FileSystem and Expo Sharing for local JSON export and sharing
- Native iOS and Android platform services for app presentation and device interactions

No user data is transmitted to Cubby-operated servers or third-party services.

## 5. Regional Differences

Cubby is available only on the United States App Store. Amounts are displayed in US dollars, and the optional account-type labels (such as Roth IRA, 401k, and HSA) are US account types. These labels are descriptive only; Cubby does not connect to any financial institution.

## 6. Regulated Industries and Protected Material

Cubby is not a financial institution and does not provide regulated financial, investment, banking, tax, lending, or payment services.

The app does not connect to bank accounts, execute transactions, provide personalized financial advice, or handle funds. Users manually enter their own goal and progress information.

Cubby does not include protected third-party content or require authorization credentials for third-party services.

## Physical Device QA Checklist

Before replying to App Review, verify the submitted build on supported physical devices, including at least one current iPhone and, if applicable, an iPad:

- Launch the submitted build from a clean install.
- Confirm the welcome flow and first-goal creation work.
- Create, edit, and delete a goal.
- Add and update progress.
- Verify Home, Goals, Stats, and Achievements screens.
- Configure income and savings targets.
- Export JSON data and confirm the system share sheet opens.
- Confirm Erase All Data removes local goals, progress, and settings after confirmation.
- Check the goal form and modal headers around the Dynamic Island or status area.
- Check tablet layouts and orientation behavior on supported iPad devices.
- Confirm there are no crashes, clipped controls, or unusable text fields.
- Record the screen capture from app launch through the typical user flow.

## Submission Notes

In App Store Connect, set **Pricing and Availability** to the United States only before submitting.

The App Review response should accurately reflect the build submitted for review. Do not state that a screen recording has been provided until the physical-device recording has actually been attached or made available through the App Review communication flow.
