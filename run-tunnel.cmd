@echo off
cd /d "%~dp0"
echo Stopping old Metro on 8081 (if any)...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>&1
echo.
echo Make sure Bionic / LM Studio is running on port 1234 (bind 0.0.0.0)
echo Starting Expo + LLM tunnels (QR will appear)...
echo.
npx expo-cf-tunnel --strict-port -p 8081 -s 1234:EXPO_PUBLIC_LM_URL:/v1/models
