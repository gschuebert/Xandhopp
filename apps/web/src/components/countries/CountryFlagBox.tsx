'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCountryMedia } from '../../hooks/useCountryMedia';

interface CountryFlagBoxProps {
  slug: string;
  countryName: string;
  lang?: string;
  className?: string;
}

export function CountryFlagBox({ 
  slug, 
  countryName, 
  lang = 'en',
  className = ''
}: CountryFlagBoxProps) {
  const { getImages, getThumbnails, loading } = useCountryMedia(slug, lang);
  const [flagError, setFlagError] = useState(false);
  const [coatError, setCoatError] = useState(false);

  // Get all media and try to identify flag and coat of arms
  const images = getImages();
  const thumbnails = getThumbnails();
  const allMedia = [...images, ...thumbnails];

  // Try to identify flag - prioritize specific flag types, include fallback logic
  let flag = allMedia.find(media => 
    media.type === 'flag' ||
    (media.title?.toLowerCase().includes('flag') && 
     media.url?.toLowerCase().includes('flag') &&
     !media.type?.startsWith('hero_')) || // Exclude hero images
    // Fallback: use thumbnail/image if it contains flag URL patterns
    (media.url?.toLowerCase().includes('flag') && 
     (media.type === 'thumbnail' || media.type === 'image'))
  );

  // Try to identify coat of arms - prioritize specific coat of arms types, exclude hero images  
  const coatOfArms = allMedia.find(media => 
    media.type === 'coat_of_arms' ||
    ((media.title?.toLowerCase().includes('coat') ||
      media.title?.toLowerCase().includes('arms') ||
      media.title?.toLowerCase().includes('wappen') ||
      media.url?.toLowerCase().includes('coat') ||
      media.url?.toLowerCase().includes('arms') ||
      media.url?.toLowerCase().includes('wappen')) &&
     !media.type?.startsWith('hero_')) || // Exclude hero images
    // Fallback: use thumbnail/image if it contains coat of arms URL patterns
    ((media.url?.toLowerCase().includes('coat') || 
      media.url?.toLowerCase().includes('arms') ||
      media.url?.toLowerCase().includes('wappen')) && 
     (media.type === 'thumbnail' || media.type === 'image'))
  );

  // Fallback flag URL from reliable source
  const getFallbackFlagUrl = (countryName: string) => {
    // Use country name to get ISO code (simplified mapping)
    const countryToIso: Record<string, string> = {
      'germany': 'de', 'austria': 'at', 'switzerland': 'ch',
      'france': 'fr', 'italy': 'it', 'spain': 'es',
      'united kingdom': 'gb', 'netherlands': 'nl', 'belgium': 'be',
      'poland': 'pl', 'czech republic': 'cz', 'hungary': 'hu',
      'portugal': 'pt', 'greece': 'gr', 'sweden': 'se',
      'norway': 'no', 'denmark': 'dk', 'finland': 'fi',
      'ireland': 'ie', 'croatia': 'hr', 'slovenia': 'si',
      'slovakia': 'sk', 'estonia': 'ee', 'latvia': 'lv',
      'lithuania': 'lt', 'luxembourg': 'lu', 'malta': 'mt',
      'cyprus': 'cy', 'bulgaria': 'bg', 'romania': 'ro',
      'united states': 'us', 'canada': 'ca', 'mexico': 'mx',
      'brazil': 'br', 'argentina': 'ar', 'chile': 'cl',
      'australia': 'au', 'new zealand': 'nz', 'japan': 'jp',
      'china': 'cn', 'india': 'in', 'russia': 'ru',
      'south africa': 'za', 'egypt': 'eg', 'nigeria': 'ng',
      'angola': 'ao', 'burkina faso': 'bf', 'eswatini': 'sz',
      'tonga': 'to', 'ghana': 'gh', 'kenya': 'ke', 'morocco': 'ma',
      'montenegro': 'me'
    };

    const isoCode = countryToIso[countryName.toLowerCase()];
    return isoCode ? `https://flagcdn.com/w320/${isoCode}.png` : null;
  };

  const fallbackFlagUrl = getFallbackFlagUrl(countryName);
  
  // Use fallback flag if no flag found in media
  if (!flag && fallbackFlagUrl) {
    flag = {
      id: 0,
      country_id: 0,
      language_code: lang,
      title: `Flag of ${countryName}`,
      type: 'flag' as any,
      url: fallbackFlagUrl,
      attribution: 'FlagCDN',
      source_url: 'https://flagcdn.com',
      uploaded_at: new Date().toISOString()
    };
  }

  if (loading) {
    return (
      <div className={`border border-gray-300 bg-gray-50 ${className}`}>
        <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
          <h3 className="font-bold text-black">Symbole</h3>
        </div>
        <div className="p-3">
          <div className="animate-pulse flex space-x-4">
            <div className="w-16 h-12 bg-gray-200 rounded"></div>
            <div className="w-16 h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayFlag = flag || (fallbackFlagUrl && !flagError);
  const displayCoat = coatOfArms && !coatError;

  if (!displayFlag && !displayCoat) {
    return null; // Don't show the box if no symbols available
  }

  return (
    <div className={`border border-gray-300 bg-gray-50 text-sm ${className}`}>
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
        <h3 className="font-bold text-black">Symbole</h3>
      </div>
      <div className="p-3">
        <div className="flex space-x-4 items-start">
          {/* Flag */}
          {displayFlag && (
            <div className="flex-shrink-0">
              <div className="text-xs text-gray-600 mb-1 font-medium">Flagge</div>
              <div className="relative w-20 h-14 border border-gray-200 rounded overflow-hidden bg-white">
                <Image
                  src={flag?.url || fallbackFlagUrl || ''}
                  alt={flag?.title || `Flagge von ${countryName}`}
                  fill
                  className="object-contain p-1"
                  onError={() => setFlagError(true)}
                  sizes="80px"
                />
              </div>
              {flag?.attribution && (
                <div className="text-xs text-gray-400 mt-1">
                  {flag.attribution}
                </div>
              )}
            </div>
          )}

          {/* Coat of Arms */}
          {displayCoat && (
            <div className="flex-shrink-0">
              <div className="text-xs text-gray-600 mb-1 font-medium">Wappen</div>
              <div className="relative w-20 h-14 border border-gray-200 rounded overflow-hidden bg-white">
                <Image
                  src={coatOfArms.url}
                  alt={coatOfArms.title || `Wappen von ${countryName}`}
                  fill
                  className="object-contain p-1"
                  onError={() => setCoatError(true)}
                  sizes="80px"
                />
              </div>
              {coatOfArms.attribution && (
                <div className="text-xs text-gray-400 mt-1">
                  {coatOfArms.attribution}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional info */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Symbole:</span>
            <span>{(displayFlag ? 1 : 0) + (displayCoat ? 1 : 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
