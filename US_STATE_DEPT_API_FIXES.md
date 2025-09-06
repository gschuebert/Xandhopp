# 🔧 US State Department API Schema Fix

## Problem
Die US State Department API hat ihr Response-Format geändert:
```
ZodError: Expected object, received array
```

**Alter Format:**
```json
{
  "data": [...],
  "success": true
}
```

**Neues Format:**
```json
[...] // Direkt ein Array
```

## ✅ Lösung

### Schema Update
`packages/connectors/src/stateDept.ts`:
- **Union Schema:** Unterstützt beide Formate (Objekt mit data-Array oder direktes Array)
- **Flexible Verarbeitung:** Automatische Erkennung des Response-Formats
- **Backward Compatibility:** Alte API-Aufrufe funktionieren weiterhin

### Code-Änderungen
```typescript
// Flexibles Schema für beide Formate
const StateDeptResponseSchema = z.union([
  z.object({
    data: z.array(TravelAdvisorySchema),
    success: z.boolean().optional(),
    message: z.string().optional(),
  }),
  z.array(TravelAdvisorySchema), // Direktes Array
]);

// Automatische Format-Erkennung
const advisories = Array.isArray(validatedData) 
  ? validatedData 
  : validatedData.data;
```

## 🎯 Erwartetes Ergebnis

Nach diesem Fix sollte der Ingestion Worker erfolgreich zeigen:
```
✓ Successfully processed X US State Department travel advisories
✓ Inserted X advisories into ClickHouse
```

## 🔄 Test

Der Worker wird automatisch die korrigierten Schemas verwenden beim nächsten API-Aufruf.

**Status: ✅ Bereit zum Testen**
