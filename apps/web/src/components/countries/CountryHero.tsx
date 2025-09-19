'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCountryMedia } from '../../hooks/useCountryMedia';
import { getFallbackHeroImage } from '../../lib/fallbackImages';

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
  const { getImages, getThumbnails, loading } = useCountryMedia(slug, lang);
  const [imageError, setImageError] = useState(false);

  // Get scenic/landscape images (avoid flags and coats of arms for hero)
  const images = getImages();
  const thumbnails = getThumbnails();
  const scenicMedia = [...images, ...thumbnails].filter(media => 
    // Filter out flags and coats of arms for hero section
    !media.title?.toLowerCase().includes('flag') &&
    !media.title?.toLowerCase().includes('coat') &&
    !media.title?.toLowerCase().includes('arms') &&
    !media.title?.toLowerCase().includes('wappen') &&
    !media.url?.toLowerCase().includes('flag') &&
    !media.url?.toLowerCase().includes('coat')
  );
  const allMedia = scenicMedia.length > 0 ? scenicMedia : (images.length > 0 ? images : thumbnails);
  
  // Get fallback image if no Wikipedia images available
  const fallbackImage = allMedia.length === 0 ? getFallbackHeroImage(countryName) : null;
  
  // Use first available image (no navigation)
  const currentImage = allMedia[0] || fallbackImage;
  const hasImages = (allMedia.length > 0 || fallbackImage) && !imageError;

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

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-4 text-white/75 text-sm">
          Loading images...
        </div>
      )}
    </div>
  );
}
