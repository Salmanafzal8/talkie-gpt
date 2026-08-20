@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo === Talkie Expo Tunnel ===
echo.

echo [1/4] Freeing port 8081...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%P >nul 2>&1
)

echo [2/4] Starting Expo Metro...
start "Talkie-Expo" cmd /k "cd /d "%~dp0" && npx expo start --lan --port 8081"

echo [3/4] Waiting for Metro...
:wait_metro
timeout /t 2 /nobreak >nul
curl.exe -s --max-time 2 http://127.0.0.1:8081/status 2>nul | findstr /i "running" >nul
if errorlevel 1 goto wait_metro
echo Metro is ready.

echo [4/4] Starting Cloudflare tunnel...
echo Keep BOTH windows open. When URL appears below, use it in Expo Go:
echo   exp://YOUR-SUBDOMAIN.trycloudflare.com:443
echo.
".\.tools\cloudflared.exe" tunnel --url http://127.0.0.1:8081

endlocal
