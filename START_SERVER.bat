@echo off
echo Starting Voyage Server...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
