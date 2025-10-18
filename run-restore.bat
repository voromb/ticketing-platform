@echo off
cd C:\Programacion_2DAW\ticketing-platform\docker\bd_backup
powershell.exe -ExecutionPolicy Bypass -File restore.ps1 -BackupDate "2025-10-16" -SkipConfirmation
