@echo off
echo.
echo ============================================
echo   SalesTrack APK Builder (Windows)
echo ============================================
echo.

where java >nul 2>&1 || (
    echo [ERROR] Java not found. Install from https://adoptium.net/
    pause & exit /b 1
)

if "%ANDROID_HOME%"=="" (
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
)

if not exist "%ANDROID_HOME%" (
    echo [ERROR] Android SDK not found at %ANDROID_HOME%
    echo Install Android Studio: https://developer.android.com/studio
    pause & exit /b 1
)

echo [OK] Android SDK: %ANDROID_HOME%
echo sdk.dir=%ANDROID_HOME:\=\\% > local.properties

echo.
echo [BUILD] Building APK...
echo.

call gradlew.bat assembleDebug

if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo ============================================
    echo   BUILD SUCCESSFUL!
    echo ============================================
    echo.
    echo APK: app\build\outputs\apk\debug\app-debug.apk
    copy "app\build\outputs\apk\debug\app-debug.apk" "..\..\SalesTrack.apk"
    echo Copied to: SalesTrack.apk
) else (
    echo [ERROR] Build failed.
)
pause
