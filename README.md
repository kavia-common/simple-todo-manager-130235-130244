# simple-todo-manager-130235-130244

Mobile Todo App (React Native + Expo)

Features:
- Create, edit, delete todos
- Mark todos as completed
- Filter by All / Active / Completed
- Floating Action Button to add todos
- Minimalistic, light theme

Getting started:
- Install dependencies: npm install
- Start app: npm run start
- Open in Expo Go (Android/iOS) or run web: npm run web

Notes:
- Data is stored in-memory for this minimal implementation.
- No environment variables required.

Native builds (Android/iOS):
- This project uses Expo managed workflow by default. There is no android/ or ios/ directory until you run prebuild.
- To generate native projects locally:
  - Android: npm run prebuild:android
  - iOS: npm run prebuild:ios
- After prebuild, you can open the native projects in Android Studio / Xcode and build. The previous CI error "bash: ./gradlew: No such file or directory" occurs if you try to run Gradle before prebuild creates the android folder. The build script was updated to avoid failing CI for this scenario.