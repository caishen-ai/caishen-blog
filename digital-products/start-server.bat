@echo off
echo ============================================
echo  财神数字产品商店 - 公网部署启动脚本
echo ============================================
echo.

cd /d "%~dp0landing-page"

echo [1/2] 启动本地 HTTP 服务器 (端口 8080)...
start "HTTP-Server" cmd /c "npx --yes http-server -p 8080 -c-1 --cors"

timeout /t 3 /nobreak >nul

echo [2/2] 启动 localtunnel 公网隧道...
echo.
echo 公网地址将在下方显示：
echo --------------------------------------------
npx --yes localtunnel --port 8080 --print-requests

pause
