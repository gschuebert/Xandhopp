import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { iso2: string } }
) {
  try {
    const { iso2 } = params;
    
    // Forward the request to the Symfony API
    const response = await fetch(`http://localhost:8082/api/country/${iso2}/snapshot`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock data
      return NextResponse.json({
        country: iso2.toUpperCase(),
        data: {
          population: 'Data not available',
          gdp: 'Data not available',
          airQuality: 'Data not available',
          lastUpdated: new Date().toISOString()
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Country snapshot API error:', error);
    
    // Return mock data when backend is not available
    return NextResponse.json({
      country: params.iso2.toUpperCase(),
      data: {
        population: 'Data not available',
        gdp: 'Data not available', 
        airQuality: 'Data not available',
        lastUpdated: new Date().toISOString()
      }
    });
  }
}
