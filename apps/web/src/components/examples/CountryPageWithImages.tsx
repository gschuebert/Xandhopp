/**
 * Example: How to integrate the new image components into country pages
 * 
 * This shows how to use:
 * 1. CountryCardWithMedia for country listings
 * 2. CountryHero for detail page headers
 * 3. CountryImageGallery for image galleries
 */

'use client';

import { CountryCardWithMedia, CountryHero, CountryImageGallery } from '../countries';

// Example: Enhanced Country Listing Page
export function CountryListingWithImages({ countries, lang, locale }: {
  countries: Array<{
    id: number;
    iso_code: string;
    name_en: string;
    continent: string | null;
    slug_en: string | null;
    slug_de: string | null;
  }>;
  lang: string;
  locale: string;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Countries</h1>
      
      {/* Grid with image cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {countries.map((country) => (
          <CountryCardWithMedia
            key={country.id}
            c={country}
            lang={lang}
            locale={locale}
            showImage={true}
          />
        ))}
      </div>
    </div>
  );
}

// Example: Enhanced Country Detail Page
export function CountryDetailWithImages({ 
  slug, 
  countryName, 
  continent, 
  lang, 
  locale 
}: {
  slug: string;
  countryName: string;
  continent?: string;
  lang: string;
  locale: string;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section with large images */}
      <CountryHero
        slug={slug}
        countryName={countryName}
        continent={continent}
        lang={lang}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                Country content goes here...
              </p>
            </section>
            
            {/* Other content sections */}
          </div>

          {/* Sidebar with image gallery */}
          <div className="space-y-8">
            <CountryImageGallery
              slug={slug}
              countryName={countryName}
              lang={lang}
              className="bg-gray-50 p-6 rounded-lg"
            />
            
            {/* Other sidebar content */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Example: Compact country cards without images (for mobile/lists)
export function CompactCountryList({ countries, lang, locale }: {
  countries: Array<{
    id: number;
    iso_code: string;
    name_en: string;
    continent: string | null;
    slug_en: string | null;
    slug_de: string | null;
  }>;
  lang: string;
  locale: string;
}) {
  return (
    <div className="space-y-2">
      {countries.map((country) => (
        <CountryCardWithMedia
          key={country.id}
          c={country}
          lang={lang}
          locale={locale}
          showImage={false} // No images for compact view
        />
      ))}
    </div>
  );
}
