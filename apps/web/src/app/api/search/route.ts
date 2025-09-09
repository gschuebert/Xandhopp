import { NextRequest, NextResponse } from 'next/server';
import { meilisearchService, mockSearch, type SearchOptions } from '../../../lib/meilisearch';

interface SearchRequest {
  query: string;
  locale: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, locale } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Try to use Meilisearch, fallback to mock data
    let results;
    
    try {
      const searchOptions: SearchOptions = {
        query,
        locale,
        limit: 10,
        filters: [`locale = "${locale}"`]
      };
      
      results = await meilisearchService.search(searchOptions);
      
      // If Meilisearch returns no results, fallback to mock data
      if (results.length === 0) {
        results = mockSearch(query, locale);
      }
    } catch (error) {
      console.warn('Meilisearch not available, using mock data:', error);
      results = mockSearch(query, locale);
    }

    // Ensure URLs are localized
    const localizedResults = results.map(item => ({
      ...item,
      url: item.url.replace('/en/', `/${locale}/`)
    }));

    return NextResponse.json({ results: localizedResults });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Search API is running',
    meilisearch: {
      url: process.env.MEILISEARCH_URL || 'http://localhost:7701',
      configured: !!process.env.MEILISEARCH_API_KEY
    }
  });
}
