# DocMate — Android Release Build Guide

This guide walks a developer from a fresh checkout to a signed **Release APK** and **Android App Bundle (.aab)** for the **DocMate** Expo / React Native app.

The project lives at `/app/frontend` and is built with **Expo SDK 54** managed workflow.

> The fastest path is the **Emergent Publish** button (top-right of the IDE) which provisions an Expo/EAS build for you. The steps below are for developers who want to run the build locally or on their own CI.

---

## 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | **20.x LTS** (or 18.x ≥ 18.18) |
| Yarn | **1.22.x** (Berry/v3 not required; project pins classic) |
| Java JDK | **17** (Temurin recommended) |
| Android Studio | **Hedgehog 2023.1.1** or newer |
| Android SDK Platform | **API 34 (Android 14)** |
| Android Build-Tools | **34.0.0** |
| NDK | **26.1.x** (only required if Gradle asks for it) |
| Gradle | **8.10.x** (auto-downloaded by the wrapper) |
| Expo CLI | bundled — invoked via `npx expo` / `yarn expo` |
| EAS CLI (recommended) | `npm i -g eas-cli` |
| Git | latest |

Set environment variables (Linux/macOS):

```bash
export ANDROID_HOME="$HOME/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"   # macOS
# Linux: export JAVA_HOME=/usr/lib/jvm/temurin-17-jdk
```

Windows: set the same variables in **System Properties → Environment Variables**.

---

## 2. Install Dependencies

```bash
cd /app/frontend
yarn install --frozen-lockfile
```

This installs all JS / TS deps including `expo`, `expo-image-manipulator`, `expo-image-picker`, `expo-print`, `expo-file-system`, `expo-media-library`, `expo-sharing`, `lucide-react-native`, etc.

> **Never** modify `metro.config.js`, `EXPO_PACKAGER_PROXY_URL`, or `EXPO_PACKAGER_HOSTNAME`.

---

## 3. Generate Native Android Project (Prebuild)

DocMate is a managed Expo app. To build locally you need the native Android project:

```bash
cd /app/frontend
npx expo prebuild --platform android --clean
```

This creates the `android/` directory with Gradle scaffolding configured from `app.json`:

- package: **com.docmate.app**
- name: **DocMate**
- permissions: CAMERA, READ_MEDIA_IMAGES, WRITE_EXTERNAL_STORAGE
- plugins: `expo-media-library`, `expo-splash-screen`, `expo-router`

---

## 4. Create a Signing Keystore

You only do this **once**. Keep the keystore file & passwords safe — losing them means you can never update the app on the Play Store.

```bash
cd /app/frontend/android/app
keytool -genkeypair -v \
  -keystore docmate-release.keystore \
  -alias docmate \
  -keyalg RSA -keysize 2048 -validity 10000
```

You will be asked for:

- a keystore password
- a key password (can be the same)
- your name / org / locality

This produces `android/app/docmate-release.keystore`.

---

## 5. Configure Gradle Signing

Add credentials to `~/.gradle/gradle.properties` (preferred — keeps secrets out of repo):

```properties
DOCMATE_RELEASE_STORE_FILE=docmate-release.keystore
DOCMATE_RELEASE_KEY_ALIAS=docmate
DOCMATE_RELEASE_STORE_PASSWORD=*****
DOCMATE_RELEASE_KEY_PASSWORD=*****
```

Then open `android/app/build.gradle` and inside the `android { }` block add:

```groovy
signingConfigs {
    release {
        if (project.hasProperty('DOCMATE_RELEASE_STORE_FILE')) {
            storeFile file(DOCMATE_RELEASE_STORE_FILE)
            storePassword DOCMATE_RELEASE_STORE_PASSWORD
            keyAlias DOCMATE_RELEASE_KEY_ALIAS
            keyPassword DOCMATE_RELEASE_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
    }
}
```

---

## 6. Build a Release APK (Local)

```bash
cd /app/frontend/android
./gradlew clean
./gradlew assembleRelease
```

Output:

```
android/app/build/outputs/apk/release/app-release.apk
```

Install on a connected device for testing:

```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## 7. Build an Android App Bundle (.aab) — for Play Store

```bash
cd /app/frontend/android
./gradlew clean
./gradlew bundleRelease
```

Output:

```
android/app/build/outputs/bundle/release/app-release.aab
```

This is the format you upload to **Google Play Console**.

---

## 8. Build via EAS (Cloud — Recommended)

If you don't want to maintain Java/Android SDK locally:

```bash
cd /app/frontend
npm i -g eas-cli
eas login                       # one time
eas build:configure             # creates eas.json
eas build -p android --profile production --non-interactive
```

EAS will sign and produce both APK & AAB you can download.

---

## 9. Output Locations Cheat-Sheet

| Artifact | Path |
|----------|------|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` |
| Mapping (ProGuard) | `android/app/build/outputs/mapping/release/mapping.txt` |

---

## 10. Common Build Errors & Fixes

| Error | Fix |
|-------|-----|
| `SDK location not found` | Create `android/local.properties` with `sdk.dir=/Users/you/Library/Android/sdk` |
| `Could not find or load main class org.gradle.wrapper.GradleWrapperMain` | `cd android && gradle wrapper` to regenerate the wrapper |
| `Execution failed for task ':app:checkReleaseDuplicateClasses'` | `cd android && ./gradlew clean && ./gradlew assembleRelease` |
| `keystore password was incorrect` | Re-check the four `DOCMATE_RELEASE_*` properties in `~/.gradle/gradle.properties` |
| `Java heap space` during R8 / minify | Add `org.gradle.jvmargs=-Xmx4g` to `android/gradle.properties` |
| `Plugin with id 'expo-router' not found` | Run `npx expo prebuild --clean` again |
| `Manifest merger failed : Attribute application@allowBackup` | Already declared by Expo — remove duplicate from your `AndroidManifest.xml` |
| Camera/gallery crash on real device | Confirm permissions in `app.json → android.permissions` are present; re-run prebuild |
| App opens then closes immediately (release only) | Disable Hermes mismatch: `cd android && ./gradlew clean`, ensure `expo.jsEngine=hermes` in `android/gradle.properties` |
| `Task :app:bundleReleaseJsAndAssets FAILED` | Delete `.expo/` and `node_modules/.cache`, then re-run |

---

## 11. Play Store Publishing Checklist

- [ ] App name set to **DocMate** in `app.json`
- [ ] `versionCode` incremented and `version` (semver) bumped
- [ ] `package` is unique on the Play Store (currently `com.docmate.app`)
- [ ] All required screenshots (phone + tablet) captured at 1080×1920 minimum
- [ ] Feature graphic 1024×500 PNG
- [ ] Adaptive icon foreground at 432×432 transparent PNG (already in `assets/images/adaptive-icon.png`)
- [ ] Privacy Policy URL — DocMate is offline / no tracking, but Play Console still requires a URL
- [ ] Content rating questionnaire completed
- [ ] Data Safety form: declare **no data collection**
- [ ] Target API level: **34** (verify in `android/build.gradle` → `targetSdkVersion`)
- [ ] `.aab` uploaded to the **Production** track
- [ ] Test on an internal track before promoting to production
- [ ] Tag the release in Git: `git tag v1.0.0 && git push --tags`

---

## 12. Quick Commands Summary

```bash
# Install
yarn install --frozen-lockfile

# Generate native projects
npx expo prebuild --platform android --clean

# Release APK
cd android && ./gradlew clean && ./gradlew assembleRelease

# Release AAB
cd android && ./gradlew clean && ./gradlew bundleRelease

# Install built APK on a device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# EAS Cloud Build
eas build -p android --profile production
```

That's everything you need to ship DocMate to the Play Store.
