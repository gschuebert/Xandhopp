# Countries Components

Diese Komponenten implementieren die neue Länderauswahl basierend auf der Wikipedia-Struktur und der neuen Datenbank.

## Komponenten

### CountryList
- Zeigt alle Länder in einem Grid an
- Filterung nach Kontinenten
- Responsive Design
- Loading States und Error Handling

### CountryDetailNew
- Wikipedia-ähnliche Darstellung von Ländern
- Strukturierte Inhalte (Überblick, Kultur, Wirtschaft, Geschichte)
- Infobox mit wichtigen Fakten
- Medien-Galerie
- Responsive Layout mit Hauptinhalt und Seitenleiste

### CountrySearchNew
- Live-Suche mit Debouncing
- Dropdown mit Suchergebnissen
- Flaggen-Anzeige
- Keyboard Navigation

## API Integration

### countries-api.ts
- Vollständige API-Service-Klasse
- TypeScript-Typen für alle Datenstrukturen
- Unterstützung für 5 Sprachen (en, de, es, zh, hi)
- Error Handling und Retry-Logik

### Endpoints
- `GET /api/countries` - Alle Länder
- `GET /api/countries?continent=Europe` - Länder nach Kontinent
- `GET /api/countries/{slug}?lang=de` - Basisdaten
- `GET /api/countries/{slug}/content?lang=de` - Inhalte
- `GET /api/countries/{slug}/facts?lang=de` - Fakten

## Routing

### Seiten
- `/countries` - Länderliste mit Filter und Suche
- `/countries/[slug]` - Einzelnes Land (dynamisch)

### Sprachunterstützung
- Automatisches Mapping von Frontend-Locale zu API-Sprache
- Fallback auf Englisch für nicht unterstützte Sprachen

## Verwendung

```tsx
import { CountryList } from './components/countries/CountryList';
import { CountryDetailNew } from './components/countries/CountryDetailNew';
import { CountrySearchNew } from './components/countries/CountrySearchNew';

// Länderliste
<CountryList 
  locale="de" 
  onCountrySelect={handleSelect}
/>

// Ländersuche
<CountrySearchNew 
  locale="de"
  onCountrySelect={handleSelect}
  placeholder="Länder suchen..."
/>

// Länderdetail
<CountryDetailNew 
  slug="germany"
  locale="de"
  onBack={handleBack}
/>
```

## Datenstruktur

### Country
```typescript
interface Country {
  id: number;
  iso_code: string;
  name_en: string;
  slug_en: string;
  continent: string;
}
```

### CountryDetail
```typescript
interface CountryDetail {
  id: number;
  iso_code: string;
  name_en: string;
  name_local?: string;
  continent: string;
  has_subregions: boolean;
  slug_en: string;
  slug_de?: string;
  updated_at: string;
  flag_url?: string;
  hero_image?: string;
}
```

### LocalizedContent
```typescript
interface LocalizedContent {
  id: number;
  country_id: number;
  language_code: string;
  content_type: ContentType;
  content: string;
  source_url?: string;
  updated_at: string;
}
```

## Styling

- Tailwind CSS
- Responsive Design
- Wikipedia-ähnliche Optik
- Konsistente Farbpalette (xandhopp-blue, etc.)
- Loading Skeletons
- Error States

## Performance

- Lazy Loading von Inhalten
- Debounced Search
- Optimistic Updates
- Caching von API-Responses
- Minimale Re-Renders
