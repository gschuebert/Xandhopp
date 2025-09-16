"""
Setup-Skript für XNTOP Importer
"""

import subprocess
import sys
import os

def create_virtual_environment():
    """Erstellt virtuelle Umgebung"""
    print("Erstelle virtuelle Umgebung...")
    try:
        subprocess.check_call([sys.executable, "-m", "venv", "venv"])
        print("✅ Virtuelle Umgebung erstellt")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Fehler beim Erstellen der virtuellen Umgebung: {e}")
        return False

def install_requirements():
    """Installiert Python-Abhängigkeiten in virtueller Umgebung"""
    print("Installiere Python-Abhängigkeiten...")
    
    # Bestimme den pip-Pfad je nach Betriebssystem
    if os.name == 'nt':  # Windows
        pip_path = os.path.join("venv", "Scripts", "pip.exe")
    else:  # Unix/Linux/macOS
        pip_path = os.path.join("venv", "bin", "pip")
    
    try:
        subprocess.check_call([pip_path, "install", "-r", "requirements.txt"])
        print("✅ Abhängigkeiten erfolgreich installiert")
    except subprocess.CalledProcessError as e:
        print(f"❌ Fehler beim Installieren der Abhängigkeiten: {e}")
        return False
    return True

def setup_env_file():
    """Erstellt .env-Datei aus env.example"""
    if not os.path.exists('.env'):
        if os.path.exists('env.example'):
            print("Erstelle .env-Datei aus env.example...")
            with open('env.example', 'r') as src:
                with open('.env', 'w') as dst:
                    dst.write(src.read())
            print("✅ .env-Datei erstellt")
        else:
            print("❌ env.example nicht gefunden")
            return False
    else:
        print("ℹ️  .env-Datei existiert bereits")
    return True

def main():
    """Hauptfunktion"""
    print("=== XNTOP Importer Setup ===")
    
    # Virtuelle Umgebung erstellen
    if not create_virtual_environment():
        sys.exit(1)
    
    # Abhängigkeiten installieren
    if not install_requirements():
        sys.exit(1)
    
    # .env-Datei erstellen
    if not setup_env_file():
        sys.exit(1)
    
    print("\n✅ Setup abgeschlossen!")
    print("\nNächste Schritte:")
    print("1. Überprüfen Sie die .env-Datei und passen Sie die Datenbankverbindung an")
    print("2. Aktivieren Sie die virtuelle Umgebung:")
    if os.name == 'nt':  # Windows
        print("   venv\\Scripts\\activate")
    else:  # Unix/Linux/macOS
        print("   source venv/bin/activate")
    print("3. Führen Sie 'python test_connection.py' aus, um die Verbindung zu testen")
    print("4. Führen Sie 'python main.py' aus, um den Import zu starten")

if __name__ == "__main__":
    main()
