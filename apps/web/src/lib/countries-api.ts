/**
 * API Service für Länderdaten basierend auf neuer Datenbankstruktur
 * Nutzt die neuen Endpoints mit Sprachunterstützung
 */

export type SupportedLanguage = 'en' | 'de' | 'es' | 'zh' | 'hi';
export type Continent = 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';

// Basis-Länderdaten
export interface Country {
  id: number;
  iso_code: string;
  name_en: string;
  slug_en: string;
  continent: string;
}

// Erweiterte Länderdaten mit lokalisierten Namen
export interface CountryDetail {
  id: number;
  iso_code: string;
  name_en: string;
  name_local?: string;
  continent: string;
  has_subregions: boolean;
  slug_en: string;
  slug_de?: string;
  updated_at: string;
  // Medien
  flag_url?: string;
  hero_image?: string;
}

// Inhaltstypen
export interface ContentType {
  id: number;
  key: string;
  name_en: string;
}

// Lokalisierte Inhalte
export interface LocalizedContent {
  id: number;
  country_id: number;
  language_code: string;
  content_type: ContentType;
  content: string;
  source_url?: string;
  updated_at: string;
}

// Strukturierte Fakten
export interface CountryFact {
  id: number;
  country_id: number;
  language_code: string;
  key: string;
  value: string;
  unit?: string;
  last_updated: string;
}

// Medien-Assets
export interface MediaAsset {
  id: number;
  country_id: number;
  language_code: string;
  title: string;
  type: 'thumbnail' | 'image' | 'flag' | 'coat_of_arms' | 'hero_scenic' | 'hero_landmark' | 'hero_city' | 'hero_building' | 'hero_other';
  url: string;
  attribution?: string;
  source_url?: string;
  uploaded_at: string;
}

// API Response Types
export interface CountriesResponse {
  countries: Country[];
  total: number;
  continent?: string;
}

export interface CountryDetailResponse {
  country: CountryDetail;
  contents: LocalizedContent[];
  facts: CountryFact[];
  media: MediaAsset[];
}

// API Service Klasse
class CountriesAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';
  }

  /**
   * Länderliste abrufen (optional nach Kontinent gefiltert)
   */
  async getCountries(continent?: Continent, lang: SupportedLanguage = 'en'): Promise<CountriesResponse> {
    const params = new URLSearchParams();
    if (continent) params.append('continent', continent);
    params.append('lang', lang);

    const response = await fetch(`${this.baseUrl}/api/countries?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response to match our interface
    return {
      countries: data.countries || [],
      total: data.total || 0,
      continent: data.continent
    };
  }

  /**
   * Einzelnes Land mit Basisdaten abrufen
   */
  async getCountry(slug: string, lang: SupportedLanguage = 'en'): Promise<CountryDetail> {
    // For now, get the country from the list and transform it
    const response = await fetch(`${this.baseUrl}/api/countries?lang=${lang}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch country ${slug}: ${response.statusText}`);
    }

    const data = await response.json();
    const country = data.countries?.find((c: any) => c.slug_en === slug);
    
    if (!country) {
      throw new Error(`Country ${slug} not found`);
    }

    // Transform to CountryDetail format
    return {
      id: country.id,
      iso_code: country.iso_code,
      name_en: country.name_en,
      name_local: country.name_local,
      continent: country.continent,
      has_subregions: false,
      slug_en: country.slug_en,
      slug_de: country.slug_de,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Inhalte für ein Land abrufen
   */
  async getCountryContent(slug: string, lang: SupportedLanguage = 'en'): Promise<LocalizedContent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/countries/${slug}/content?lang=${lang}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content for ${slug}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.contents || [];
    } catch (error) {
      // Return dummy content for now
      return [
        {
          id: 1,
          country_id: 1,
          language_code: lang,
          content_type: {
            id: 1,
            key: 'overview',
            name_en: 'General Overview'
          },
          content: `This is a placeholder overview for ${slug} in ${lang}. The content will be populated from Wikipedia data.`,
          source_url: 'https://wikipedia.org',
          updated_at: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Strukturierte Fakten für ein Land abrufen
   */
  async getCountryFacts(slug: string, lang: SupportedLanguage = 'en'): Promise<CountryFact[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/countries/${slug}/facts?lang=${lang}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch facts for ${slug}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.facts || [];
    } catch (error) {
      // Return dummy facts for now
      return [
        {
          id: 1,
          country_id: 1,
          language_code: lang,
          key: 'population',
          value: 'Unknown',
          unit: 'people',
          last_updated: new Date().toISOString()
        },
        {
          id: 2,
          country_id: 1,
          language_code: lang,
          key: 'area',
          value: 'Unknown',
          unit: 'km²',
          last_updated: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Alle Daten für ein Land in einem Request abrufen
   */
  async getCountryFullData(slug: string, lang: SupportedLanguage = 'en'): Promise<CountryDetailResponse> {
    const [country, contents, facts] = await Promise.all([
      this.getCountry(slug, lang),
      this.getCountryContent(slug, lang),
      this.getCountryFacts(slug, lang)
    ]);

    // Medien aus den Inhalten extrahieren
    const media: MediaAsset[] = contents
      .filter(content => content.content_type.key === 'media')
      .map(content => ({
        id: content.id,
        country_id: content.country_id,
        language_code: content.language_code,
        title: content.content_type.name_en,
        type: 'image',
        url: content.content,
        source_url: content.source_url,
        uploaded_at: content.updated_at
      }));

    return {
      country,
      contents,
      facts,
      media
    };
  }

  /**
   * Verfügbare Kontinente abrufen
   */
  async getContinents(): Promise<Continent[]> {
    const response = await fetch(`${this.baseUrl}/api/countries`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch continents: ${response.statusText}`);
    }

    const data = await response.json();
    const continents = new Set<string>();
    
    data.countries?.forEach((country: Country) => {
      if (country.continent) {
        continents.add(country.continent);
      }
    });

    return Array.from(continents) as Continent[];
  }

  /**
   * Suche nach Ländern
   */
  async searchCountries(query: string, lang: SupportedLanguage = 'en', limit: number = 10): Promise<Country[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        lang,
        limit: limit.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/countries/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search countries: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      // Fallback: search in the full list
      const allCountries = await this.getCountries(undefined, lang);
      const filtered = allCountries.countries.filter(country => 
        country.name_en.toLowerCase().includes(query.toLowerCase())
      );
      return filtered.slice(0, limit);
    }
  }
}

// Singleton Instance
export const countriesAPI = new CountriesAPIService();

// Utility Functions
export function getContentByType(contents: LocalizedContent[], typeKey: string): LocalizedContent | undefined {
  return contents.find(content => content.content_type.key === typeKey);
}

export function getFactByKey(facts: CountryFact[], key: string): CountryFact | undefined {
  return facts.find(fact => fact.key === key);
}

export function formatCountryName(country: CountryDetail, lang: SupportedLanguage): string {
  if (lang === 'en') return country.name_en;
  return country.name_local || country.name_en;
}

export function getCountrySlug(country: CountryDetail, lang: SupportedLanguage): string {
  if (lang === 'de' && country.slug_de) return country.slug_de;
  return country.slug_en;
}
