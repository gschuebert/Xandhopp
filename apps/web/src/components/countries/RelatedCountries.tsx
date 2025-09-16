'use client';

import { useState, useEffect } from 'react';
import { countriesAPI, type Country, type SupportedLanguage } from '../../lib/countries-api';
import { useRouter } from 'next/navigation';

interface RelatedCountriesProps {
  currentCountrySlug: string;
  currentContinent: string;
  locale: string;
}

export function RelatedCountries({ currentCountrySlug, currentContinent, locale }: RelatedCountriesProps) {
  const [relatedCountries, setRelatedCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadRelatedCountries = async () => {
      try {
        setIsLoading(true);
        const response = await countriesAPI.getCountries(undefined, locale as SupportedLanguage);
        
        // Filter countries from the same continent, excluding current country
        const related = response.countries
          .filter(country => 
            country.continent === currentContinent && 
            country.slug_en !== currentCountrySlug
          )
          .slice(0, 6); // Show up to 6 related countries
        
        setRelatedCountries(related);
      } catch (error) {
        console.error('Error loading related countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRelatedCountries();
  }, [currentCountrySlug, currentContinent, locale]);

  const handleCountryClick = (countrySlug: string) => {
    router.push(`/${locale}/countrys/${countrySlug}`);
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Related Countries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedCountries.length === 0) {
    return null;
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-xandhopp-blue mb-4">
        Other Countries in {currentContinent}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedCountries.map((country) => (
          <div
            key={country.id}
            onClick={() => handleCountryClick(country.slug_en)}
            className="p-4 border border-gray-200 rounded-lg hover:border-xandhopp-accent hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded border flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">
                  {country.iso_code}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 group-hover:text-xandhopp-accent transition-colors">
                  {country.name_en}
                </h4>
                <p className="text-sm text-gray-500">{country.continent}</p>
              </div>
              <svg 
                className="w-4 h-4 text-gray-400 group-hover:text-xandhopp-accent transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
