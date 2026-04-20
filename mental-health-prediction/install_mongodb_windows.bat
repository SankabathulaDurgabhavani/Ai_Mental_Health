@echo off
SETLOCAL EnableDelayedExpansion

:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ==================================================
    echo ERROR: This script must be run as Administrator.
    echo Please right-click the file and select "Run as administrator".
    echo ==================================================
    pause
    exit /b 1
)

echo ==========================================
echo MongoDB and MongoDB Compass Auto-Installer
echo ==========================================
echo.

set MONGODB_URL=https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14-signed.msi
set COMPASS_URL=https://downloads.mongodb.com/compass/mongodb-compass-1.43.4-win32-x64.exe

set MONGODB_INSTALLER=%TEMP%\mongodb.msi
set COMPASS_INSTALLER=%TEMP%\compass.exe

echo [1/4] Downloading MongoDB Community Server 7.0...
curl -L -o "%MONGODB_INSTALLER%" "%MONGODB_URL%"

echo [2/4] Downloading MongoDB Compass...
curl -L -o "%COMPASS_INSTALLER%" "%COMPASS_URL%"

echo [3/4] Installing MongoDB Server (Wait patiently, this takes a few minutes)...
:: /q for quiet, /i to install. ADDLOCAL installs the server as a service. SHOULD_INSTALL_COMPASS prevents it from downloading compass dynamically during the slow msi step
msiexec.exe /q /i "%MONGODB_INSTALLER%" ADDLOCAL="ServerService,Client" SHOULD_INSTALL_COMPASS="0"

echo [4/4] Installing MongoDB Compass...
:: /S is for a silent install 
start /wait "" "%COMPASS_INSTALLER%" /S

echo.
echo ==========================================
echo Installation is fully complete! 
echo.
echo MongoDB is now installed and running as a background service.
echo You can find "MongoDB Compass" in your Start Menu.
echo Open Compass and connect securely to your local database using: mongodb://localhost:27017
echo ==========================================

:: Clean up
del "%MONGODB_INSTALLER%"
del "%COMPASS_INSTALLER%"

pause
