'use client';

import { useState } from 'react';
import Image from 'next/image';

// Function to get scenic/characteristic images for countries
const getScenicImageUrl = (countryName: string): string => {
  const scenicImages: Record<string, string> = {
    // Africa - Diverse landscapes
    'Nigeria': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80', // Sahara Desert
    'Egypt': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6b?w=1200&q=80', // Pyramids landscape
    'South Africa': 'https://images.unsplash.com/photo-1484318571209-661cf29a69ea?w=1200&q=80', // Table Mountain
    'Kenya': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80', // Savanna with wildlife
    'Morocco': 'https://images.unsplash.com/photo-1461183479101-6c14cd5e4de1?w=1200&q=80', // Desert dunes
    'Ghana': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80', // West African landscape
    'Eswatini': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80', // African highlands
    'Angola': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80', // African landscape
    
    // Oceania - Islands and atolls
    'Samoa': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', // Tropical beach/atoll
    'Tonga': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', // Pacific island
    'Fiji': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', // Fiji paradise
    'Vanuatu': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Volcanic island
    'Palau': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', // Coral atolls
    'Marshall Islands': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', // Atoll landscape
    'Kiribati': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', // Pacific atoll
    'Australia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Uluru/Outback
    'New Zealand': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', // Milford Sound
    
    // Europe - Architecture and landscapes
    'Germany': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80', // Neuschwanstein
    'Austria': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Alpine village
    'Switzerland': 'https://images.unsplash.com/photo-1527004760525-6d6a8a0b3b11?w=1200&q=80', // Matterhorn
    'France': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=1200&q=80', // Eiffel Tower
    'Italy': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80', // Venice
    'Spain': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6b?w=1200&q=80', // Sagrada Familia
    'United Kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80', // London
    'Netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80', // Amsterdam
    'Greece': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80', // Santorini
    'Norway': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Fjords
    'Montenegro': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80', // Balkan mountains
    
    // Asia - Iconic landmarks
    'Japan': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80', // Mount Fuji
    'China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80', // Great Wall
    'India': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80', // Taj Mahal
    'Thailand': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Thai temple
    'Indonesia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Bali temple
    
    // Americas
    'United States': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80', // Statue of Liberty
    'Canada': 'https://images.unsplash.com/photo-1503614472-8c93d56cd2b2?w=1200&q=80', // Canadian Rockies
    'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80', // Christ Redeemer
    'Mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80', // Chichen Itza
    'Argentina': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Buenos Aires
    'Chile': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Andes Mountains
  };
  
  // Return specific image or fallback to generic nature image
  return scenicImages[countryName] || 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80';
};

// Clean country name display function
function cleanCountryName(name: string): string {
  const specialCases: Record<string, string> = {
    'Democratic_republic_of_the_congo': 'Democratic Republic of the Congo',
    'Republic_of_the_congo': 'Republic of the Congo',
    'United_states': 'United States',
    'United_kingdom': 'United Kingdom',
    'New_zealand': 'New Zealand',
    'South_africa': 'South Africa',
    'North_korea': 'North Korea',
    'South_korea': 'South Korea',
    'Costa_rica': 'Costa Rica',
    'El_salvador': 'El Salvador',
    'Sri_lanka': 'Sri Lanka',
    'Saudi_arabia': 'Saudi Arabia',
    'United_arab_emirates': 'United Arab Emirates',
    'Czech_republic': 'Czech Republic',
    'Papua_new_guinea': 'Papua New Guinea',
    'Burkina_faso': 'Burkina Faso',
    'Cape_verde': 'Cape Verde',
    'Central_african_republic': 'Central African Republic',
    'Equatorial_guinea': 'Equatorial Guinea',
    'Ivory_coast': 'Ivory Coast',
    'Sierra_leone': 'Sierra Leone',
    'Sao_tome_and_principe': 'São Tomé and Príncipe'
  };

  // Check exact match first
  if (specialCases[name]) {
    return specialCases[name];
  }

  // Check case-insensitive match
  const lowerName = name.toLowerCase();
  const matchedKey = Object.keys(specialCases).find(key => key.toLowerCase() === lowerName);
  if (matchedKey) {
    return specialCases[matchedKey];
  }

  // Fallback: clean up underscores and hyphens
  return name
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

interface CountryHeroProps {
  slug: string;
  countryName: string;
  continent?: string;
  lang?: string;
}

export function CountryHero({ 
  slug, 
  countryName, 
  continent, 
  lang = 'en' 
}: CountryHeroProps) {
  const [imageError, setImageError] = useState(false);

  // Always use scenic images first - this ensures consistent landestypische Bilder
  const cleanName = cleanCountryName(countryName);
  const scenicImageUrl = getScenicImageUrl(cleanName);
  
  // Create a consistent image object
  const currentImage = {
    url: scenicImageUrl,
    title: `Scenic view of ${cleanName}`,
    attribution: 'Unsplash'
  };
  
  const hasImages = !imageError;

  return (
    <div className="relative h-96 lg:h-[500px] bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
      {/* Background Image */}
      {hasImages && currentImage ? (
        <>
          <Image
            src={currentImage.url}
            alt={currentImage.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            priority
            sizes="100vw"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </>
      ) : (
        /* Fallback gradient background */
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" />
      )}

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
            {cleanCountryName(countryName)}
          </h1>
          {continent && continent !== 'Unknown' && (
            <p className="text-xl lg:text-2xl opacity-90 drop-shadow-md">
              {continent}
            </p>
          )}
          
        </div>
      </div>

      {/* Attribution */}
      {hasImages && currentImage?.attribution && (
        <div className="absolute bottom-4 right-4 text-white/75 text-xs bg-black/50 px-2 py-1 rounded">
          {currentImage.attribution}
        </div>
      )}

    </div>
  );
}
