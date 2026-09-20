@echo off
setlocal

cd /d "%~dp0.."

echo ========================================
echo Japanese Language Web Builder
echo ========================================
echo.

if not exist "node_modules\esbuild" (
    echo esbuild is not installed.
    echo Installing esbuild...
    echo.

    call npm.cmd install --save-dev esbuild

    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install esbuild.
        pause
        exit /b 1
    )
)

echo.
echo Building Web version...
echo.

call node_modules\.bin\esbuild.cmd web\main.js ^
    --bundle ^
    --format=iife ^
    --outfile=web\app.js ^
    --charset=utf8

if errorlevel 1 (
    echo.
    echo ERROR: Build failed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully.
echo ========================================
echo.
echo Output:
echo   web\app.js
echo.
echo You can now open web\index.html directly.
echo.

pause