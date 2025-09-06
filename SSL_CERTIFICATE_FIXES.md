# SSL Certificate Fixes - Development Environment

## 🔧 Problem

**Fehler:** SSL-Zertifikatsfehler beim Zugriff auf US State Department API
```
Error: unable to verify the first certificate
code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
```

**Ursache:** Node.js kann das SSL-Zertifikat des US State Department APIs nicht verifizieren (häufig in Entwicklungsumgebungen).

## ✅ Implementierte Lösung

### 1. **Automatische SSL-Deaktivierung für Development**
```typescript
// In apps/ingestion-worker/src/index.ts
if (process.env.NODE_ENV === 'development' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  logger.warn("⚠️ SSL certificate verification disabled for development");
}
```

### 2. **PowerShell Start-Script**
Erstellt: `scripts/start-ingestion-dev.ps1`
```powershell
# Automatische Umgebungsvariablen-Konfiguration
$env:NODE_ENV = "development"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
$env:LOG_LEVEL = "info"

pnpm --filter @portalis/ingestion-worker dev
```

### 3. **Verbesserte Fehlerdiagnose**
- SSL-Fehler werden erkannt und geloggt
- Hilfreiche Fehlermeldungen mit Lösungsvorschlägen
- Strukturierte Error-Logs mit Ursachen-Codes

## 🚀 Verwendung

### Option 1: PowerShell-Script (Empfohlen)
```powershell
.\scripts\start-ingestion-dev.ps1
```

### Option 2: Manuelle Umgebungsvariablen
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
pnpm --filter @portalis/ingestion-worker dev
```

### Option 3: Einmalig für Session
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; pnpm run ingestion:dev
```

## ⚠️ Sicherheitshinweis

**Nur für Entwicklung!** 
- `NODE_TLS_REJECT_UNAUTHORIZED=0` deaktiviert SSL-Zertifikatsprüfung
- **Niemals in Produktion verwenden!**
- Nur für lokale Entwicklung und Testing

## 📊 Erwartetes Ergebnis

**✅ Nach dem Fix:**
- Keine SSL-Zertifikatsfehler mehr
- US State Department APIs erreichbar
- Ingestion Worker läuft stabil
- Travel Advisories werden gesammelt

**⚠️ Log-Meldung:**
```
⚠️ SSL certificate verification disabled for development
```

## 🔧 Alternative Lösungen

Falls das Problem weiterhin besteht:

1. **Lokales Zertifikat installieren**
2. **VPN/Proxy-Konfiguration prüfen**  
3. **Firewall-Einstellungen überprüfen**
4. **Corporate SSL-Proxies umgehen**

Das System funktioniert auch ohne externe APIs und nutzt dann nur lokale/ClickHouse-Daten.
