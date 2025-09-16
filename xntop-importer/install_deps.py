"""
Installiert Abhängigkeiten mit --break-system-packages
Nur für Entwicklungsumgebungen!
"""

import subprocess
import sys

def install_requirements():
    """Installiert Python-Abhängigkeiten mit --break-system-packages"""
    print("Installiere Python-Abhängigkeiten...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "--break-system-packages", "-r", "requirements.txt"
        ])
        print("✅ Abhängigkeiten erfolgreich installiert")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Fehler beim Installieren der Abhängigkeiten: {e}")
        return False

if __name__ == "__main__":
    install_requirements()
