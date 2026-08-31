@echo off
REM ============================================================
REM COMIKA — Build APK Script (Windows)
REM Build APK dari Flutter project dan copy ke backend storage
REM ============================================================

set SCRIPT_DIR=%~dp0
set MOBILE_DIR=%SCRIPT_DIR%..
set ROOT_DIR=%SCRIPT_DIR%..\..
set BACKEND_DIR=%ROOT_DIR%\backend
set APK_OUTPUT=%MOBILE_DIR%\build\app\outputs\flutter-apk\app-release.apk
set APK_DEST=%BACKEND_DIR%\storage\app\downloads\comika.apk

echo Building COMIKA APK...
echo    Project: %MOBILE_DIR%

REM Build APK release
cd /d "%MOBILE_DIR%"
call flutter build apk --release

REM Check if build succeeded
if not exist "%APK_OUTPUT%" (
    echo Build failed — APK not found at %APK_OUTPUT%
    exit /b 1
)

echo Build successful!

REM Create destination directory
if not exist "%BACKEND_DIR%\storage\app\downloads" (
    mkdir "%BACKEND_DIR%\storage\app\downloads"
)

REM Copy APK to backend storage
copy /Y "%APK_OUTPUT%" "%APK_DEST%"

echo.
echo === Build Complete ===
echo    APK: %APK_DEST%
echo.
echo    Upload to server:
echo    1. Copy storage\app\downloads\comika.apk to production server
echo    2. OR use POST /api/v1/admin/download/upload endpoint
echo.
echo    Download URL: https://comika.free.nf/api/v1/download/apk
