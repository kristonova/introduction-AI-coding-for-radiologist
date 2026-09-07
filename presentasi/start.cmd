@echo off
REM Server lokal opsional untuk deck presentasi.
REM
REM Biasanya tidak perlu: klik dua kali index.html sudah cukup, dan itu cara
REM yang dipakai saat mengajar. Skrip ini hanya untuk browser yang menolak
REM membuka berkas dari file://.

cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python tidak ditemukan di PATH.
  echo Buka index.html langsung dengan klik dua kali.
  pause
  exit /b 1
)

echo Menjalankan deck di http://localhost:8080
echo Tekan Ctrl+C untuk berhenti.
start "" "http://localhost:8080/index.html"
python -m http.server 8080
