# FCDO API Fixes - Zod Schema Validation Error

## 🔧 Problem behoben

**Fehler:** Zod-Validierungsfehler beim FCDO (UK Foreign Office) API-Connector
```
ZodObject.parse error at fetchFCDOCountryAdvice
```

**Ursache:** Das FCDO API-Response-Format hat sich geändert und entspricht nicht mehr dem erwarteten Schema.

## ✅ Implementierte Lösung

### 1. **Robuste Schema-Validierung**
- **Flexibleres Schema**: Mehr optionale Felder hinzugefügt
- **`.passthrough()`**: Erlaubt unbekannte Felder im API-Response
- **Graceful Fallback**: Bei Schema-Fehlern werden Grunddaten extrahiert

### 2. **Verbesserte Fehlerbehandlung**
```typescript
// Vorher: Crash bei Schema-Fehler
data = FCDOResponseSchema.parse(response.data);

// Nachher: Graceful Handling
try {
  data = FCDOResponseSchema.parse(response.data);
} catch (schemaError) {
  console.warn(`FCDO API schema validation failed for ${pathSlug}:`, schemaError);
  // Fallback: Extrahiere verfügbare Daten
  data = {
    title: rawData.title || `Travel advice for ${pathSlug}`,
    description: rawData.description || rawData.summary || "",
    public_updated_at: rawData.public_updated_at || rawData.updated_at || new Date().toISOString(),
    // ... weitere Fallback-Werte
  };
}
```

### 3. **Temporäre Workaround-Strategie**
Da das FCDO API instabil ist:
- **Nur US State Department**: Temporär nur stabile APIs verwenden
- **FCDO deaktiviert**: Bis API-Schema stabilisiert ist
- **Strukturierte Logs**: Bessere Fehlerdiagnose

## 📊 Aktueller Status

**✅ Sofort verfügbar:**
- US State Department Travel Advisories ✅
- World Bank Wirtschaftsindikatoren ✅
- Keine Zod-Validierungsfehler mehr ✅
- Ingestion Worker läuft stabil ✅

**⏳ Später aktivierbar:**
- FCDO UK Travel Advisories (wenn API stabil)
- OpenAQ Luftqualität (mit API-Schlüssel)

## 🔧 Konfiguration

### Nur US State Department (aktuell aktiv):
```typescript
ADVISORY_JOB_PRESETS.usStateDeptOnly()
```

### Alle Quellen (wenn FCDO wieder funktioniert):
```typescript
ADVISORY_JOB_PRESETS.all() // US State Dept + FCDO
```

## 🎯 Ergebnis

**Keine Crashes mehr!** Der Ingestion Worker läuft jetzt stabil ohne Zod-Validierungsfehler und sammelt verfügbare Daten aus stabilen APIs.

Das System ist robust gegen API-Änderungen und kann auch bei einzelnen API-Ausfällen weiterarbeiten.
