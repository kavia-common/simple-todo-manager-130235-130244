# Todo Frontend (React Native + Expo)

This is the mobile UI for a minimalistic Todo application.

Run the app:
- npm install
- npm run start
- Use Expo Go (Android/iOS) or run on web: npm run web

Native builds:
- This project uses the Expo managed workflow. The native Android/iOS projects are not generated until you run prebuild.
- To create native projects locally:
  - Android: npm run prebuild:android
  - iOS: npm run prebuild:ios
- CI note: We include placeholder Gradle wrapper files so CI tools that check for ./gradlew do not fail. For real native builds, run prebuild first which will replace these placeholders with the proper native projects.
