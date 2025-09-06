# 🔧 Schnelle SSL-Fix Anleitung

## Problem
Der Ingestion Worker kann sich nicht mit den US State Department APIs verbinden:
```
Error: unable to verify the first certificate
code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
```

## ⚡ Sofortige Lösung

### Option 1: Automatisches Restart-Script
```powershell
.\scripts\restart-ingestion-with-ssl-fix.ps1
```

### Option 2: Manueller Restart
```powershell
# 1. Umgebungsvariable setzen
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

# 2. Worker neu starten  
pnpm --filter @portalis/ingestion-worker dev
```

### Option 3: Kompletter Neustart
```powershell
# 1. Aktuelle Prozesse stoppen (Ctrl+C in allen Terminals)
# 2. Umgebung setzen
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
# 3. Alles neu starten
.\scripts\start-everything.ps1
```

## ✅ Erwartetes Ergebnis

Nach dem Neustart solltest du sehen:
```
⚠️ SSL certificate verification disabled for development
✓ All services healthy - live data mode
Successfully processed X US State Department advisories
```

## 🎯 Fallback-Lösung

Falls SSL weiterhin Probleme macht:
- **Mock-Daten werden automatisch verwendet**
- **System läuft trotzdem weiter**
- **ClickHouse und andere Services funktionieren**

## ⚠️ Wichtig

- Dies ist **nur für die Entwicklung**
- SSL-Prüfung wird **nur lokal deaktiviert**
- **Niemals in Produktion verwenden**

Das System funktioniert auch ohne externe APIs vollständig!
