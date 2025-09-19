/**
 * Fallback image sources for countries when Wikipedia doesn't have scenic images
 */

export interface FallbackImageSource {
  url: string;
  attribution: string;
  source: string;
  type: 'landscape' | 'landmark' | 'city' | 'nature';
}

/**
 * Get fallback images for countries from reliable sources
 */
export function getFallbackImages(countryName: string): FallbackImageSource[] {
  const country = countryName.toLowerCase();
  
  // Country-specific characteristic images (landmarks, cities, nature)
  const countryImages: Record<string, string[]> = {
    // Europe
    'germany': [
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80', // Neuschwanstein Castle
      'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80', // Brandenburg Gate
      'https://images.unsplash.com/photo-1559564484-d0b2b6e4d6b0?w=1200&q=80'  // Rhine Valley
    ],
    'austria': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Hallstatt
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80', // Salzburg
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80'  // Austrian Alps
    ],
    'switzerland': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Matterhorn
      'https://images.unsplash.com/photo-1527004760525-6d6a8a0b3b11?w=1200&q=80', // Lake Geneva
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Swiss Alps
    ],
    'france': [
      'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=1200&q=80', // Eiffel Tower Paris
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=1200&q=80', // Provence Lavender
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80'  // Arc de Triomphe
    ],
    'italy': [
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80', // Venice Gondolas
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80', // Colosseum Rome
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80'  // Tuscany Hills
    ],
    'spain': [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6b?w=1200&q=80', // Sagrada Familia Barcelona
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80', // Madrid Plaza
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80'  // Seville Cathedral
    ],
    'united kingdom': [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80', // London Bridge
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1200&q=80', // Big Ben
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=1200&q=80'  // Scottish Highlands
    ],
    'netherlands': [
      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80', // Amsterdam Canals
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&q=80', // Tulip Fields
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=1200&q=80'  // Dutch Windmills
    ],
    
    // Asia-Pacific
    'japan': [
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80', // Mount Fuji
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80', // Tokyo Skyline
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80'  // Cherry Blossoms
    ],
    'china': [
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80', // Great Wall
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80', // Forbidden City
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80'  // Shanghai
    ],
    'india': [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80', // Taj Mahal
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80', // Indian Palace
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Kerala Backwaters
    ],
    'australia': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Sydney Opera House
      'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&q=80', // Uluru
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Great Barrier Reef
    ],
    'new zealand': [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', // Milford Sound
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Southern Alps
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Hobbiton
    ],
    
    // Pacific Islands - Specific to each country
    'tonga': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', // Tonga Beach Paradise
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=1200&q=80', // Pacific Island
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80'  // Tropical Sunset
    ],
    'fiji': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', // Fiji Islands
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', // Tropical Paradise
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Coral Beach
    ],
    'samoa': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', // Samoa Beach
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', // Pacific Sunset
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Tropical Forest
    ],
    
    // Africa
    'egypt': [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6b?w=1200&q=80', // Pyramids
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Nile River
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Sphinx
    ],
    'south africa': [
      'https://images.unsplash.com/photo-1484318571209-661cf29a69ea?w=1200&q=80', // Table Mountain
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Safari
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Cape Town
    ],
    'kenya': [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80', // Safari Animals
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Masai Mara
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Kilimanjaro
    ],
    
    // Americas
    'united states': [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80', // Statue of Liberty
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Grand Canyon
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // NYC Skyline
    ],
    'canada': [
      'https://images.unsplash.com/photo-1503614472-8c93d56cd2b2?w=1200&q=80', // Canadian Rockies
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Niagara Falls
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Toronto
    ],
    'brazil': [
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80', // Christ the Redeemer
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Copacabana
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Amazon
    ],
    'mexico': [
      'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80', // Chichen Itza
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Mexican Beach
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Mexico City
    ],
    
    // African Countries
    'democratic republic of the congo': [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80', // Congo River
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Rainforest
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Kinshasa
    ],
    'nigeria': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Lagos Skyline
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Nigerian Market
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Abuja
    ],
    'morocco': [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6b?w=1200&q=80', // Marrakech
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Sahara Desert
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'  // Casablanca
    ]
  };

  // Pexels as secondary source (also free)
  const pexelsImages: Record<string, string[]> = {
    'default': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?w=1200&q=80', // Mountains
      'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?w=1200&q=80', // Landscape
      'https://images.pexels.com/photos/355770/pexels-photo-355770.jpeg?w=1200&q=80'  // Nature
    ]
  };

  const fallbackImages: FallbackImageSource[] = [];

  // Add country-specific images
  if (countryImages[country]) {
    countryImages[country].forEach((url, index) => {
      fallbackImages.push({
        url,
        attribution: 'Unsplash',
        source: 'unsplash',
        type: index === 0 ? 'landmark' : index === 1 ? 'city' : 'landscape'
      });
    });
  }

  // Add generic landscape images as ultimate fallback
  if (fallbackImages.length === 0) {
    pexelsImages.default.forEach(url => {
      fallbackImages.push({
        url,
        attribution: 'Pexels',
        source: 'pexels',
        type: 'landscape'
      });
    });
  }

  return fallbackImages;
}

/**
 * Get a single fallback hero image for a country
 */
export function getFallbackHeroImage(countryName: string): FallbackImageSource | null {
  const images = getFallbackImages(countryName);
  return images.length > 0 ? images[0] : null;
}
