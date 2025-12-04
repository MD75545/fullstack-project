@echo off
echo ========================================
echo  Laravel + ngrok Starter for Razorpay
echo ========================================
echo.

REM Check if ngrok is authenticated
ngrok config check >nul 2>&1
if errorlevel 1 (
    echo ERROR: ngrok not authenticated!
    echo.
    echo Steps to fix:
    echo 1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
    echo 2. Copy your authtoken
    echo 3. Run: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok is authenticated
echo.

REM Start Laravel in a new window
echo Starting Laravel server...
start "Laravel Server" cmd /k "php artisan serve --port=8000 --host=0.0.0.0"
echo Laravel will start at: http://localhost:8000
echo.

REM Wait for Laravel
timeout /t 5 /nobreak >nul

REM Start ngrok in a new window
echo Starting ngrok tunnel...
start "ngrok Tunnel" cmd /k "ngrok http 8000"
echo ngrok dashboard: http://localhost:4040
echo.

echo ⏳ Wait 10 seconds for ngrok URL to generate...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo  PUBLIC URL WILL APPEAR IN NGrok WINDOW
echo ========================================
echo.
echo 📋 Check the "ngrok Tunnel" window above
echo 🌐 Look for line: "Forwarding https://xxx.ngrok.io -> http://localhost:8000"
echo 📱 Use that https://xxx.ngrok.io URL in Razorpay
echo.
echo 🎯 Then start your React app: npm start
echo.
pause