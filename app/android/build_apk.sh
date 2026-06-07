#!/bin/bash
# ============================================================
#  SalesTrack APK Builder
#  Run this script on your machine to build the APK
#  Requirements: Java JDK 8+, Android SDK
# ============================================================

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   SalesTrack APK Builder             ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Install JDK from: https://adoptium.net/"
    exit 1
fi
echo "✅ Java: $(java -version 2>&1 | head -1)"

# Check ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    # Try common locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "/opt/android-sdk" ]; then
        export ANDROID_HOME="/opt/android-sdk"
    else
        echo ""
        echo "❌ Android SDK not found."
        echo ""
        echo "Install Android Studio from: https://developer.android.com/studio"
        echo "Then set ANDROID_HOME to your SDK path, e.g.:"
        echo "  export ANDROID_HOME=\$HOME/Library/Android/sdk   # Mac"
        echo "  export ANDROID_HOME=\$HOME/Android/Sdk           # Linux"
        echo "  set ANDROID_HOME=C:\\Users\\YOU\\AppData\\Local\\Android\\Sdk  # Windows"
        echo ""
        exit 1
    fi
fi
echo "✅ Android SDK: $ANDROID_HOME"

# Setup local.properties
echo "sdk.dir=$ANDROID_HOME" > local.properties

# Make gradlew executable
chmod +x gradlew 2>/dev/null || true

# Download gradle wrapper if missing
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "📥 Downloading Gradle wrapper..."
    curl -sL "https://github.com/gradle/gradle/raw/v8.2.0/gradle/wrapper/gradle-wrapper.jar" \
         -o gradle/wrapper/gradle-wrapper.jar 2>/dev/null || \
    wget -q "https://raw.githubusercontent.com/gradle/gradle/refs/tags/v8.2.0/gradle/wrapper/gradle-wrapper.jar" \
         -O gradle/wrapper/gradle-wrapper.jar
fi

echo ""
echo "🔨 Building APK (this takes 2-5 minutes first time)..."
echo ""

./gradlew assembleDebug --stacktrace 2>&1

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo "╔══════════════════════════════════════╗"
    echo "║  ✅ BUILD SUCCESSFUL!                ║"
    echo "╚══════════════════════════════════════╝"
    echo ""
    echo "📱 APK Location: $APK_PATH"
    echo ""
    echo "To install on your Android phone:"
    echo "  1. Enable 'Install from unknown sources' in phone settings"
    echo "  2. Copy the APK to your phone and open it"
    echo "  OR use ADB: adb install $APK_PATH"
    echo ""
    cp "$APK_PATH" "../../SalesTrack.apk"
    echo "📦 Also copied to: SalesTrack.apk (root folder)"
else
    echo "❌ Build failed. Check the output above."
    exit 1
fi
