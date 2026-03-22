@echo off
REM ML Service Startup Script (Batch)
REM Purpose: Start the ML service with the correct Python venv
REM Usage: start-ml-service.bat [port] [--no-reload]

setlocal enabledelayedexpansion

set PORT=8000
set RELOAD=--reload

if not "%~1"=="" (
    if "%~1"=="--help" (
        echo ML Service Startup Script
        echo =======================
        echo.
        echo Usage:
        echo   start-ml-service.bat [PORT] [OPTIONS]
        echo.
        echo Options:
        echo   --help       : Show this help message
        echo   --no-reload  : Disable auto-reload
        echo.
        echo Examples:
        echo   start-ml-service.bat              # Default port 8000
        echo   start-ml-service.bat 9000         # Custom port
        echo   start-ml-service.bat 8000 --no-reload
        exit /b 0
    ) else (
        set PORT=%~1
    )
)

if not "%~2"=="" (
    if "%~2"=="--no-reload" (
        set RELOAD=
    )
)

set PYTHON_EXE=%CD%\venv\Scripts\python.exe

if not exist "%PYTHON_EXE%" (
    echo Error: Python executable not found at: %PYTHON_EXE%
    echo Please ensure the ml-service venv is properly set up.
    exit /b 1
)

if not exist "%CD%\main.py" (
    echo Error: main.py not found in current directory.
    exit /b 1
)

echo.
echo Starting ML Service...
echo Port: %PORT%
echo Auto-reload: %RELOAD%
echo.
echo Starting uvicorn server on http://127.0.0.1:%PORT%
echo Docs available at: http://127.0.0.1:%PORT%/docs
echo Press Ctrl+C to stop
echo.

"%PYTHON_EXE%" -m uvicorn main:app %RELOAD% --port %PORT% --host 127.0.0.1

endlocal
