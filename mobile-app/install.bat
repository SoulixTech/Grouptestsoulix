@echo off
echo ========================================
echo SplitWise Mobile App - Installation
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
node --version
echo.

echo [2/4] Installing npm dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo.

echo [3/4] Installation complete!
echo.

echo [4/4] IMPORTANT: Before running the app
echo.
echo 1. Open: src\config\supabase.js
echo 2. Replace YOUR_PROJECT_URL and YOUR_ANON_KEY with your Supabase credentials
echo 3. Save the file
echo.

echo ========================================
echo Ready to start!
echo ========================================
echo.
echo To run the app, use one of these commands:
echo.
echo   npm start       - Start Expo development server
echo   npm run android - Run on Android device/emulator
echo   npm run ios     - Run on iOS simulator (Mac only)
echo   npm run web     - Run in web browser
echo.

pause
