# 📊 SalesTrack Pro — Android APK

A full native Android APK for tracking daily sales & expenditures.

---

## 📁 Project Structure

```
salestrack-apk/
├── app/android/          ← Android project (build this into APK)
│   ├── app/src/main/
│   │   ├── java/com/salestrack/MainActivity.java
│   │   ├── assets/www/index.html   ← Full app UI
│   │   ├── AndroidManifest.xml
│   │   └── res/
│   ├── build.gradle
│   ├── gradlew / gradlew.bat
│   ├── build_apk.sh      ← Mac/Linux build script
│   └── build_apk.bat     ← Windows build script
└── backend/              ← MongoDB + Express API (optional)
    └── server.js
```

---

## 🚀 BUILD THE APK (Step by Step)

### Prerequisites (install once)

**Step 1 — Install Java JDK 8 or higher**
- Download from: https://adoptium.net/
- Verify: `java -version`

**Step 2 — Install Android Studio** (this gives you the Android SDK)
- Download: https://developer.android.com/studio
- During setup, install "Android SDK" (API 34 recommended)
- Note your SDK path:
  - Mac: `~/Library/Android/sdk`
  - Windows: `C:\Users\YOU\AppData\Local\Android\Sdk`
  - Linux: `~/Android/Sdk`

---

### Build on Mac / Linux

```bash
cd salestrack-apk/app/android

# Set your SDK path (if not already set)
export ANDROID_HOME=~/Library/Android/sdk   # Mac
export ANDROID_HOME=~/Android/Sdk           # Linux

# Run the build script
chmod +x build_apk.sh
./build_apk.sh
```

✅ APK will be at: `SalesTrack.apk` (root folder)

---

### Build on Windows

```
cd salestrack-apk\app\android
build_apk.bat
```

✅ APK will be at: `SalesTrack.apk` (root folder)

---

### Manual build (any OS)

```bash
cd salestrack-apk/app/android
echo "sdk.dir=/YOUR/ANDROID/SDK/PATH" > local.properties
./gradlew assembleDebug
# APK → app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Install APK on your Android Phone

**Method 1 — Direct transfer:**
1. Copy `SalesTrack.apk` to your phone (USB / WhatsApp / Google Drive)
2. On phone: Settings → Security → Enable **"Install from unknown sources"**
3. Open the APK file on your phone → Install

**Method 2 — ADB (USB cable):**
```bash
adb install SalesTrack.apk
```

---

## 🗄️ Backend (MongoDB) — Optional

The APK works standalone using local device storage.
For cloud sync / multi-device, run the backend:

```bash
cd backend
npm install
# Set MongoDB URI in .env:
echo "MONGO_URI=mongodb://localhost:27017/salestrack" > .env
npm start
```

Then update `index.html` → change `API_BASE` variable to your server URL.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 💰 Add Sales | Cash & UPI separately |
| 🧾 Add Expenses | With categories: Stock, Transport, Staff, etc. |
| 📊 Dashboard | Stats cards, Pie chart, Bar chart, Line chart |
| 💾 Savings | Auto-calculated: Sales − Expenses |
| 📈 7-Day Trend | Weekly bar & line charts |
| 🗑️ Delete | Remove any entry |
| 📱 Native APK | Works offline, installs on any Android 5.0+ |
