import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get data from backend
    const response = await fetch('http://api:8080/api/countries', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Fallback to mock data
    return NextResponse.json([
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
      { code: 'AT', name: 'Austria', flag: '🇦🇹' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪' }
    ]);

  } catch (error) {
    console.error('Countries API error:', error);
    
    // Return mock data when backend is not available
    return NextResponse.json([
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸' }
    ]);
  }
}
