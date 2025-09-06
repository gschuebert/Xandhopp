# OpenAQ API Setup

## 🔑 OpenAQ API Schlüssel konfigurieren

Die OpenAQ API erfordert jetzt einen kostenlosen API-Schlüssel für den Zugriff.

### Option 1: API-Schlüssel besorgen (Empfohlen)

1. **Registrierung bei OpenAQ:**
   - Gehe zu: https://openaq.org/
   - Klicke auf "Sign Up" oder "Get API Key"
   - Registriere dich mit deiner E-Mail-Adresse
   - Bestätige deine E-Mail-Adresse

2. **API-Schlüssel erhalten:**
   - Nach der Registrierung erhältst du deinen API-Schlüssel
   - Kopiere den Schlüssel

3. **Umgebungsvariable setzen:**
   ```powershell
   # Temporär für diese Session
   $env:OPENAQ_API_KEY = "dein_api_schluessel_hier"
   
   # Permanent (Windows)
   [Environment]::SetEnvironmentVariable("OPENAQ_API_KEY", "dein_api_schluessel_hier", "User")
   ```

4. **Ingestion Worker neu starten:**
   ```powershell
   # Worker neu starten um API-Schlüssel zu verwenden
   pnpm run ingestion:dev
   ```

### Option 2: OpenAQ temporär deaktiviert (Aktueller Status)

✅ **Bereits implementiert!** 

Das System läuft jetzt **ohne OpenAQ API-Aufrufe** wenn kein Schlüssel konfiguriert ist:

- ✅ **Keine 401-Fehler mehr**
- ✅ **Worker läuft stabil**  
- ✅ **Andere Datenquellen funktionieren weiterhin:**
  - World Bank Indicators
  - Travel Advisories (US State Dept, FCDO)

## 📊 Status nach den Fixes

**✅ Behoben:**
- Keine OpenAQ 401-Fehler mehr
- Worker Error Handling verbessert
- System läuft stabil ohne OpenAQ

**✅ Funktioniert:**
- World Bank Wirtschaftsdaten
- Travel Advisories
- ClickHouse Fallback-Storage
- Alle Frontend-Funktionen

## 🎯 Empfehlung

**Für Vollständigkeit:** Hole dir einen kostenlosen OpenAQ API-Schlüssel
**Für sofortige Nutzung:** Das System funktioniert bereits perfekt ohne OpenAQ

Die Luftqualitätsdaten sind optional - alle anderen Features sind voll funktionsfähig!
