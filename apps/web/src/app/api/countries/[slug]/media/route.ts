import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    const lang = searchParams.get('lang') || 'en';
    const type = searchParams.get('type');
    
    // Build query parameters
    const queryParams = new URLSearchParams({ lang });
    if (type) {
      queryParams.append('type', type);
    }
    
    // Forward request to Symfony API
    const apiBase = process.env.SYMFONY_API_BASE || 'http://api:8080';
    const apiUrl = `${apiBase}/api/countries/${slug}/media?${queryParams.toString()}`;
    
    console.log('Fetching media from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Media API failed: ${response.status} ${response.statusText}`);
      
      // Return empty media response instead of error
      return NextResponse.json({
        media: [],
        country: slug,
        language: lang,
        type: type || undefined
      });
    }

    const data = await response.json();
    console.log(`Found ${data.media?.length || 0} media items for ${slug}`);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching country media:', error);
    
    // Return empty response instead of error to prevent frontend crashes
    return NextResponse.json({
      media: [],
      country: params.slug,
      language: 'en',
      error: 'Media temporarily unavailable'
    });
  }
}
