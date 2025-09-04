@ECHO OFF
REM Placeholder Gradle wrapper for CI when native Android project has not been generated.
IF EXIST "android\\gradlew.bat" (
  CALL android\\gradlew.bat %*
) ELSE (
  ECHO [info] Placeholder Gradle wrapper invoked at repo root.
  ECHO [info] No native Android project found. Run: npm run prebuild:android
  EXIT /B 0
)
