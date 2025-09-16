"""
Einfaches Setup-Skript für XNTOP Importer
"""

import subprocess
import sys
import os

def main():
    """Hauptfunktion"""
    print("=== XNTOP Importer Setup ===")
    
    # Virtuelle Umgebung erstellen
    print("Erstelle virtuelle Umgebung...")
    try:
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Virtuelle Umgebung erstellt")
    except subprocess.CalledProcessError as e:
        print(f"❌ Fehler beim Erstellen der virtuellen Umgebung: {e}")
        return False
    
    # .env-Datei erstellen
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
    
    print("\n✅ Setup abgeschlossen!")
    print("\nNächste Schritte:")
    print("1. Überprüfen Sie die .env-Datei und passen Sie die Datenbankverbindung an")
    print("2. Aktivieren Sie die virtuelle Umgebung:")
    if os.name == 'nt':  # Windows
        print("   venv\\Scripts\\activate")
        print("   Oder führen Sie 'activate.bat' aus")
    else:  # Unix/Linux/macOS
        print("   source venv/bin/activate")
        print("   Oder führen Sie './activate.sh' aus")
    print("3. Installieren Sie die Abhängigkeiten:")
    if os.name == 'nt':  # Windows
        print("   venv\\Scripts\\pip install -r requirements.txt")
    else:  # Unix/Linux/macOS
        print("   venv/bin/pip install -r requirements.txt")
    print("4. Führen Sie 'python test_connection.py' aus, um die Verbindung zu testen")
    print("5. Führen Sie 'python main.py' aus, um den Import zu starten")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
