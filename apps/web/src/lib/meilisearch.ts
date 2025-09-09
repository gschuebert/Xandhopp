// Meilisearch client configuration
// This will be used when we integrate with the actual Meilisearch instance

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'country' | 'feature' | 'guide';
  url: string;
  locale: string;
  tags?: string[];
  score?: number;
}

export interface SearchOptions {
  query: string;
  locale: string;
  limit?: number;
  offset?: number;
  filters?: string[];
}

export class MeilisearchService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7701';
    this.apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || 'xandhopp-search-key';
  }

  async search(options: SearchOptions): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/indexes/search/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: options.query,
          limit: options.limit || 10,
          offset: options.offset || 0,
          filter: options.filters?.length ? options.filters.join(' AND ') : undefined,
          attributesToRetrieve: ['id', 'title', 'description', 'type', 'url', 'locale', 'tags'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Meilisearch error: ${response.status}`);
      }

      const data = await response.json();
      return data.hits || [];
    } catch (error) {
      console.error('Meilisearch search error:', error);
      return [];
    }
  }

  async getIndexStats() {
    try {
      const response = await fetch(`${this.baseUrl}/indexes/search/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Meilisearch stats error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Meilisearch stats error:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const meilisearchService = new MeilisearchService();

// Mock data for development/testing
export const mockSearchData: SearchResult[] = [
  // English entries
  {
    id: 'germany-en',
    title: 'Germany',
    description: 'Relocate to Germany - visa requirements, cost of living, and job opportunities',
    type: 'country',
    url: '/en/countries/germany',
    locale: 'en',
    tags: ['europe', 'schengen', 'work-permit', 'visa']
  },
  {
    id: 'canada-en',
    title: 'Canada',
    description: 'Move to Canada - Express Entry, provincial programs, and lifestyle',
    type: 'country',
    url: '/en/countries/canada',
    locale: 'en',
    tags: ['north-america', 'express-entry', 'provincial-nominee', 'work-permit']
  },
  {
    id: 'australia-en',
    title: 'Australia',
    description: 'Relocate to Australia - skilled migration, work visas, and quality of life',
    type: 'country',
    url: '/en/countries/australia',
    locale: 'en',
    tags: ['oceania', 'skilled-migration', 'work-visa', 'points-system']
  },
  {
    id: 'visa-requirements-en',
    title: 'Visa Requirements',
    description: 'Complete guide to visa requirements for different countries',
    type: 'guide',
    url: '/en/guides/visa-requirements',
    locale: 'en',
    tags: ['visa', 'requirements', 'documentation', 'process']
  },
  {
    id: 'cost-of-living-en',
    title: 'Cost of Living Calculator',
    description: 'Compare cost of living between countries and cities',
    type: 'feature',
    url: '/en/compare/cost-of-living',
    locale: 'en',
    tags: ['cost-of-living', 'calculator', 'comparison', 'expenses']
  },
  {
    id: 'tax-comparison-en',
    title: 'Tax Comparison',
    description: 'Compare tax systems and rates across different countries',
    type: 'feature',
    url: '/en/compare/taxes',
    locale: 'en',
    tags: ['taxes', 'comparison', 'tax-system', 'rates']
  },
  {
    id: 'healthcare-systems-en',
    title: 'Healthcare Systems',
    description: 'Compare healthcare systems and insurance requirements',
    type: 'feature',
    url: '/en/compare/healthcare',
    locale: 'en',
    tags: ['healthcare', 'insurance', 'medical', 'comparison']
  },
  {
    id: 'netherlands-en',
    title: 'Netherlands',
    description: 'Relocate to Netherlands - 30% ruling, work permits, and expat life',
    type: 'country',
    url: '/en/countries/netherlands',
    locale: 'en',
    tags: ['europe', 'schengen', '30-percent-ruling', 'work-permit']
  },
  {
    id: 'switzerland-en',
    title: 'Switzerland',
    description: 'Move to Switzerland - work permits, taxes, and quality of life',
    type: 'country',
    url: '/en/countries/switzerland',
    locale: 'en',
    tags: ['europe', 'work-permit', 'high-salary', 'quality-of-life']
  },
  {
    id: 'relocation-checklist-en',
    title: 'Relocation Checklist',
    description: 'Step-by-step checklist for international relocation',
    type: 'guide',
    url: '/en/guides/relocation-checklist',
    locale: 'en',
    tags: ['checklist', 'relocation', 'steps', 'planning']
  },
  
  // German entries
  {
    id: 'germany-de',
    title: 'Deutschland',
    description: 'Nach Deutschland umziehen - Visabestimmungen, Lebenshaltungskosten und Jobmöglichkeiten',
    type: 'country',
    url: '/de/countries/germany',
    locale: 'de',
    tags: ['europa', 'schengen', 'arbeitserlaubnis', 'visum']
  },
  {
    id: 'canada-de',
    title: 'Kanada',
    description: 'Nach Kanada auswandern - Express Entry, Provinzprogramme und Lebensstil',
    type: 'country',
    url: '/de/countries/canada',
    locale: 'de',
    tags: ['nordamerika', 'express-entry', 'provinz-nominee', 'arbeitserlaubnis']
  },
  {
    id: 'australia-de',
    title: 'Australien',
    description: 'Nach Australien auswandern - Fachkräfteeinwanderung, Arbeitsvisa und Lebensqualität',
    type: 'country',
    url: '/de/countries/australia',
    locale: 'de',
    tags: ['ozeanien', 'fachkräfteeinwanderung', 'arbeitsvisum', 'punkte-system']
  },
  {
    id: 'visa-requirements-de',
    title: 'Visabestimmungen',
    description: 'Vollständiger Leitfaden zu Visabestimmungen für verschiedene Länder',
    type: 'guide',
    url: '/de/guides/visa-requirements',
    locale: 'de',
    tags: ['visum', 'bestimmungen', 'dokumentation', 'prozess']
  },
  {
    id: 'cost-of-living-de',
    title: 'Lebenshaltungskosten Rechner',
    description: 'Lebenshaltungskosten zwischen Ländern und Städten vergleichen',
    type: 'feature',
    url: '/de/compare/cost-of-living',
    locale: 'de',
    tags: ['lebenshaltungskosten', 'rechner', 'vergleich', 'ausgaben']
  },
  {
    id: 'tax-comparison-de',
    title: 'Steuervergleich',
    description: 'Steuersysteme und -sätze zwischen verschiedenen Ländern vergleichen',
    type: 'feature',
    url: '/de/compare/taxes',
    locale: 'de',
    tags: ['steuern', 'vergleich', 'steuersystem', 'sätze']
  },
  {
    id: 'healthcare-systems-de',
    title: 'Gesundheitssysteme',
    description: 'Gesundheitssysteme und Versicherungsanforderungen vergleichen',
    type: 'feature',
    url: '/de/compare/healthcare',
    locale: 'de',
    tags: ['gesundheit', 'versicherung', 'medizin', 'vergleich']
  },
  {
    id: 'netherlands-de',
    title: 'Niederlande',
    description: 'In die Niederlande auswandern - 30% Regelung, Arbeitserlaubnisse und Expat-Leben',
    type: 'country',
    url: '/de/countries/netherlands',
    locale: 'de',
    tags: ['europa', 'schengen', '30-prozent-regelung', 'arbeitserlaubnis']
  },
  {
    id: 'switzerland-de',
    title: 'Schweiz',
    description: 'In die Schweiz auswandern - Arbeitserlaubnisse, Steuern und Lebensqualität',
    type: 'country',
    url: '/de/countries/switzerland',
    locale: 'de',
    tags: ['europa', 'arbeitserlaubnis', 'hohes-gehalt', 'lebensqualität']
  },
  {
    id: 'relocation-checklist-de',
    title: 'Umzugs-Checkliste',
    description: 'Schritt-für-Schritt Checkliste für internationale Umzüge',
    type: 'guide',
    url: '/de/guides/relocation-checklist',
    locale: 'de',
    tags: ['checkliste', 'umzug', 'schritte', 'planung']
  }
];

// Helper function to perform mock search
export function mockSearch(query: string, locale: string): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase();
  
  // Create a scoring system for better search results
  const scoredResults = mockSearchData
    .filter(item => item.locale === locale)
    .map(item => {
      const searchText = `${item.title} ${item.description} ${item.tags?.join(' ') || ''}`.toLowerCase();
      let score = 0;
      
      // Exact title match gets highest score
      if (item.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Description match gets medium score
      if (item.description.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      
      // Tag match gets lower score
      if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
        score += 3;
      }
      
      // General text match gets lowest score
      if (searchText.includes(queryLower)) {
        score += 1;
      }
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  return scoredResults;
}
