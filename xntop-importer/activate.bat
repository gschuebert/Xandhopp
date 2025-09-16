@echo off
echo Aktivierung der virtuellen Umgebung...
call venv\Scripts\activate.bat
echo.
echo Virtuelle Umgebung aktiviert!
echo Sie können jetzt die Skripte ausführen:
echo   python test_connection.py
echo   python main.py
echo.
cmd /k
