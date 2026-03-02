@echo off
echo ========================================
echo Flutter Project Cleanup Script
echo ========================================
echo.

echo [1/6] Stopping Gradle processes...
taskkill /F /IM java.exe >nul 2>&1
timeout /t 2 >nul

echo [2/6] Deleting build folder...
if exist build rmdir /s /q build

echo [3/6] Deleting .dart_tool folder...
if exist .dart_tool rmdir /s /q .dart_tool

echo [4/6] Deleting Android build cache...
if exist android\.gradle rmdir /s /q android\.gradle
if exist android\app\build rmdir /s /q android\app\build

echo [5/6] Running flutter clean...
call flutter clean

echo [6/6] Getting dependencies...
call flutter pub get

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Enable Windows Developer Mode: start ms-settings:developers
echo 2. Run: flutter run
echo.
echo Or test on web now: flutter run -d edge
echo.
pause
