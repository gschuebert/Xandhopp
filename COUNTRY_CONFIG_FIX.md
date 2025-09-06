# 🌍 Country Configuration Fix

## Problem
Nur DE, ES, PT wurden für die Datensammlung verwendet, obwohl 30 Länder konfiguriert waren.

## Root Cause
1. **Umgebungsvariable:** `MONITOR_COUNTRIES` war nicht gesetzt → `undefined`
2. **Schema-Default ignoriert:** Zod verwendete nicht den Default-Array bei `undefined`
3. **Slice-Logik:** Initial jobs verwendeten nur `slice(0, 3)` → nur erste 3 Länder

## ✅ Lösung

### Config Fix
`apps/ingestion-worker/src/config.ts`:
```typescript
// Vorher: undefined wenn MONITOR_COUNTRIES nicht gesetzt
countries: process.env.MONITOR_COUNTRIES?.split(",") || undefined,

// Nachher: Expliziter Default-Array
countries: process.env.MONITOR_COUNTRIES?.split(",").map(c => c.trim()) || [
  "DE", "ES", "PT", "US", "GB", "FR", "IT", "NL", "BE", "AT",
  "CH", "PL", "CZ", "HU", "HR", "GR", "CY", "MT", "EE", "LV", 
  "LT", "SK", "SI", "BG", "RO", "IE", "LU", "DK", "SE", "FI",
],
```

### Job Scheduling Updates
`apps/ingestion-worker/src/index.ts`:
- **Air Quality:** `slice(0, 5)` → `slice(0, 10)` (10 Länder)
- **World Bank Economic:** `slice(0, 3)` → `slice(0, 8)` (8 Länder)
- **World Bank Full Profile:** Alle 30 Länder (unverändert)

## 📊 Neue Datensammlung

### Recurring Jobs (Automatisch)
- **World Bank Indicators:** Alle 30 Länder (täglich)
- **Travel Advisories:** Global (US State Dept, alle 6h)
- **Air Quality:** Erste 10 Länder (alle 12h, nur mit API Key)

### Initial Jobs (Beim Start)
- **Air Quality:** Erste 10 Länder (wenn OpenAQ API Key verfügbar)
- **World Bank Economic:** Erste 8 Länder

## 🔧 Anpassung

### Standard verwenden
Keine Aktion nötig - verwendet jetzt automatisch alle 30 EU/US Länder.

### Custom Countries
```powershell
$env:MONITOR_COUNTRIES = "DE,FR,IT,ES,US,GB,NL,BE"
# Dann Ingestion Worker neu starten
```

## 🎯 Erwartetes Ergebnis

Nach dem Neustart sollte der Worker zeigen:
```
Starting Portalis Ingestion Worker
Countries: 30 (oder custom Anzahl)
✓ Processing data for: DE, ES, PT, US, GB, FR, IT, NL, BE, AT, ...
```

**Status: ✅ Bereit zum Testen**
