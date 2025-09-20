'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCountryMedia, type MediaAsset } from '../../hooks/useCountryMedia';
import { type Locale } from '../../lib/i18n';

interface CountryCardProps {
  c: {
    id: number;
    iso_code: string;
    name_en: string;
    continent: string | null;
    slug_en: string | null;
    slug_de: string | null;
  };
  lang: string;
  locale: Locale;
  showImage?: boolean;
}

// Function to translate country names based on locale
const translateCountry = (country: { name_en: string; slug_de: string | null }, locale: Locale): string => {
  // Try to get localized name from the country data first
  if (locale === 'de' && country.slug_de) {
    return country.slug_de;
  }
  
  // German country name translations
  if (locale === 'de') {
    const germanCountryNames: Record<string, string> = {
      'Germany': 'Deutschland',
      'France': 'Frankreich',
      'Italy': 'Italien',
      'Spain': 'Spanien',
      'United Kingdom': 'Vereinigtes Königreich',
      'Netherlands': 'Niederlande',
      'Belgium': 'Belgien',
      'Switzerland': 'Schweiz',
      'Austria': 'Österreich',
      'Poland': 'Polen',
      'Czech Republic': 'Tschechische Republik',
      'Hungary': 'Ungarn',
      'Portugal': 'Portugal',
      'Greece': 'Griechenland',
      'Sweden': 'Schweden',
      'Norway': 'Norwegen',
      'Denmark': 'Dänemark',
      'Finland': 'Finnland',
      'Ireland': 'Irland',
      'Croatia': 'Kroatien',
      'Slovenia': 'Slowenien',
      'Slovakia': 'Slowakei',
      'Estonia': 'Estland',
      'Latvia': 'Lettland',
      'Lithuania': 'Litauen',
      'Luxembourg': 'Luxemburg',
      'Malta': 'Malta',
      'Cyprus': 'Zypern',
      'Bulgaria': 'Bulgarien',
      'Romania': 'Rumänien',
      'United States': 'Vereinigte Staaten',
      'Canada': 'Kanada',
      'Mexico': 'Mexiko',
      'Brazil': 'Brasilien',
      'Argentina': 'Argentinien',
      'Chile': 'Chile',
      'Australia': 'Australien',
      'New Zealand': 'Neuseeland',
      'Japan': 'Japan',
      'China': 'China',
      'India': 'Indien',
      'Russia': 'Russland',
      'South Africa': 'Südafrika',
      'Egypt': 'Ägypten',
      'Nigeria': 'Nigeria',
      'Algeria': 'Algerien',
      'Angola': 'Angola',
      'Benin': 'Benin',
      'Botswana': 'Botswana',
      'Burkina Faso': 'Burkina Faso',
      'Burundi': 'Burundi',
      'Cameroon': 'Kamerun',
      'Cape Verde': 'Kap Verde',
      'Chad': 'Tschad',
      'Comoros': 'Komoren',
      'Democratic Republic of the Congo': 'Demokratische Republik Kongo',
      'Republic of the Congo': 'Republik Kongo',
      'Djibouti': 'Dschibuti',
      'Equatorial Guinea': 'Äquatorialguinea',
      'Eritrea': 'Eritrea',
      'Eswatini': 'Eswatini',
      'Ethiopia': 'Äthiopien',
      'Gabon': 'Gabun',
      'Gambia': 'Gambia',
      'Ghana': 'Ghana',
      'Guinea': 'Guinea',
      'Guinea-Bissau': 'Guinea-Bissau',
      'Ivory Coast': 'Elfenbeinküste',
      'Kenya': 'Kenia',
      'Lesotho': 'Lesotho',
      'Liberia': 'Liberia',
      'Libya': 'Libyen',
      'Madagascar': 'Madagaskar',
      'Malawi': 'Malawi',
      'Mali': 'Mali',
      'Mauritania': 'Mauretanien',
      'Mauritius': 'Mauritius',
      'Morocco': 'Marokko',
      'Mozambique': 'Mosambik',
      'Namibia': 'Namibia',
      'Niger': 'Niger',
      'Rwanda': 'Ruanda',
      'São Tomé and Príncipe': 'São Tomé und Príncipe',
      'Senegal': 'Senegal',
      'Seychelles': 'Seychellen',
      'Sierra Leone': 'Sierra Leone',
      'Somalia': 'Somalia',
      'South Sudan': 'Südsudan',
      'Sudan': 'Sudan',
      'Tanzania': 'Tansania',
      'Togo': 'Togo',
      'Tunisia': 'Tunesien',
      'Uganda': 'Uganda',
      'Zambia': 'Sambia',
      'Zimbabwe': 'Simbabwe',
      'Montenegro': 'Montenegro',
      'Dominican Republic': 'Dominikanische Republik',
      'East Timor': 'Osttimor',
      'Ecuador': 'Ecuador',
      'El Salvador': 'El Salvador',
      'Estonia': 'Estland',
      'Fiji': 'Fidschi',
      'France': 'Frankreich',
      'French Polynesia': 'Französisch-Polynesien',
      'Gabon': 'Gabun',
      'Georgia': 'Georgien',
      'Greece': 'Griechenland'
    };
    
    return germanCountryNames[country.name_en] || country.name_en;
  }
  
  // Fallback to English name
  return country.name_en;
};

// Function to translate continent names
const translateContinent = (continent: string, locale: Locale): string => {
  if (locale === 'de') {
    const continentTranslations: Record<string, string> = {
      'Asia': 'Asien',
      'Europe': 'Europa',
      'North America': 'Nordamerika',
      'South America': 'Südamerika',
      'Africa': 'Afrika',
      'Oceania': 'Ozeanien',
      'Antarctica': 'Antarktis'
    };
    return continentTranslations[continent] || continent;
  }
  return continent;
};

export function CountryCardWithMedia({ 
  c, 
  lang, 
  locale, 
  showImage = true 
}: CountryCardProps) {
  const slug = (c.slug_en || c.slug_de || c.name_en).toLowerCase().replace(/\s+/g, "-");
  const { getFirstThumbnail, loading: mediaLoading } = useCountryMedia(slug, lang, 'thumbnail');
  const [imageError, setImageError] = useState(false);

  const thumbnail = getFirstThumbnail();
  const hasValidImage = showImage && thumbnail && !imageError;

  return (
    <a
      href={`/${locale}/countrys/${slug}?lang=${encodeURIComponent(lang)}`}
      className="group block rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden bg-white"
    >
      {/* Image Section */}
      {showImage && (
        <div className="relative h-48 bg-gray-100">
          {hasValidImage ? (
            <Image
              src={thumbnail.url}
              alt={thumbnail.title}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-blue-100">
              {mediaLoading ? (
                <div className="animate-pulse">
                  <div className="w-8 h-8 bg-blue-200 rounded"></div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                    🌍
                  </div>
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
          )}
          
          {/* Continent Badge */}
          {c.continent && (
            <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              {translateContinent(c.continent, locale)}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            {!showImage && c.continent && (
              <div className="text-sm text-gray-500 mb-1">{translateContinent(c.continent, locale)}</div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {translateCountry(c, locale)}
            </h3>
            <div className="text-sm text-gray-500 mt-1">
              {c.iso_code}
            </div>
          </div>
          
          <div className="ml-4 text-blue-600 group-hover:text-blue-700 transition-colors">
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Attribution (only if image is shown) */}
        {hasValidImage && thumbnail.attribution && (
          <div className="mt-2 text-xs text-gray-400">
            {thumbnail.attribution}
          </div>
        )}
      </div>
    </a>
  );
}
