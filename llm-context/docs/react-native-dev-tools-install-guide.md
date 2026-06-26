# React Native Dev Tools Install Guide (macOS)

This guide is for the Quote of the Day React Native work.

Assumed already installed:

- Node.js
- nvm
- watchman
- pnpm
- Java

## 1) iOS Setup (Xcode + Simulator)

### Install and configure Xcode

1. Install Xcode from the App Store.
2. Open Xcode once and accept the license.
3. Install any prompted additional components.
4. Install Command Line Tools:
   - Xcode -> Settings -> Locations -> Command Line Tools -> select latest version.

### Install CocoaPods

Run:

```bash
sudo gem install cocoapods
pod --version
```

If you prefer Homebrew:

```bash
brew install cocoapods
pod --version
```

### Install iOS simulator runtime and create a device

1. Open Xcode -> Settings -> Platforms.
2. Install latest iOS simulator runtime.
3. Open Xcode -> Open Developer Tool -> Simulator.
4. Create a simulator device (for example iPhone 16).

## 2) Android Setup (Android Studio + Emulator)

### Install Android Studio

1. Download and install Android Studio.
2. Open Android Studio once to finish first-run setup.

### Install Android SDK components (required)

In Android Studio -> Settings -> Languages and Frameworks -> Android SDK:

SDK Platforms:

- Android 15 (API 35)
- Android 14 (API 34) as optional fallback

SDK Tools:

- Android SDK Build-Tools (latest)
- Android SDK Platform-Tools
- Android SDK Command-line Tools (latest)
- Android Emulator

Optional (install only if needed by native modules):

- NDK (Side by side)
- CMake

### Create Android emulator (AVD)

1. Open Device Manager in Android Studio.
2. Create Device -> Pixel 8 (or Pixel 7).
3. Select system image:
   - API 35
   - Variant: Google APIs
   - Architecture on Apple Silicon: ARM64 image
4. Finish and start the emulator once.

## 3) Environment Variables (macOS)

Add these to your shell profile (for zsh: ~/.zshrc):

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

# Set JAVA_HOME from your installed Java
export JAVA_HOME=$(/usr/libexec/java_home)
```

Apply changes:

```bash
source ~/.zshrc
```

## 4) Quick Validation Checklist

Run these checks:

```bash
xcodebuild -version
pod --version
java -version
adb --version
emulator -version
```

Check Android SDK path:

```bash
echo $ANDROID_HOME
ls "$ANDROID_HOME"
```

Check available emulators:

```bash
emulator -list-avds
```

## 5) React Native Project Bootstrapping (TypeScript)

Choose one approach.

### Option A: Expo (fastest to start)

```bash
pnpm dlx create-expo-app quote-mobile -t expo-template-blank-typescript
cd quote-mobile
pnpm start
```

### Option B: React Native CLI (more native control)

```bash
pnpm dlx @react-native-community/cli@latest init QuoteMobile --template react-native-template-typescript
cd QuoteMobile
pnpm install
cd ios && pod install && cd ..
```

Run iOS:

```bash
pnpm react-native run-ios
```

Run Android (emulator running):

```bash
pnpm react-native run-android
```

## 6) API Base URL Configuration Pattern

To satisfy the spec requirement that API URL can change without editing core screens:

- Keep one config file for environment values.
- Keep one API client module that reads base URL from config.
- Screens should call API functions only, not hardcode URLs.

Suggested structure:

- src/config/env.ts
- src/api/client.ts
- src/features/quotes/service.ts
- src/screens/HomeScreen.tsx (no direct base URL usage)

## 7) Troubleshooting

### iOS build issues

- Reopen Xcode and Simulator.
- Reinstall pods:

```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

### Android device not found

- Ensure emulator is running first.
- Confirm with:

```bash
adb devices
```

### Metro cache issues

```bash
pnpm react-native start --reset-cache
```

## 8) Recommended Minimal Simulator Set

- iOS: one latest iPhone simulator runtime.
- Android: one Pixel AVD, API 35, Google APIs ARM64.

This is enough to begin implementing Spec 01 through Spec 10 in this repo context.
