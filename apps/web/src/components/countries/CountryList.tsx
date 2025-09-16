'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { countriesAPI, type Country, type Continent, type SupportedLanguage } from '../../lib/countries-api';

interface CountryListProps {
  locale: SupportedLanguage;
  initialContinent?: Continent;
  onCountrySelect?: (country: Country) => void;
}

export function CountryList({ locale, initialContinent, onCountrySelect }: CountryListProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<Continent[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'all'>(initialContinent || 'all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Länder laden
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const continent = selectedContinent === 'all' ? undefined : selectedContinent;
        const response = await countriesAPI.getCountries(continent, locale);
        setCountries(response.countries);
      } catch (err) {
        console.error('Error loading countries:', err);
        setError('Failed to load countries');
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, [selectedContinent, locale]);

  // Kontinente laden
  useEffect(() => {
    const loadContinents = async () => {
      try {
        const continentList = await countriesAPI.getContinents();
        setContinents(continentList);
      } catch (err) {
        console.error('Error loading continents:', err);
      }
    };

    loadContinents();
  }, []);

  // Gefilterte Länder
  const filteredCountries = useMemo(() => {
    if (selectedContinent === 'all') return countries;
    return countries.filter(country => country.continent === selectedContinent);
  }, [countries, selectedContinent]);

  // Kontinent-Namen für Anzeige
  const getContinentDisplayName = (continent: string): string => {
    const names: Record<string, string> = {
      'Africa': 'Afrika',
      'Americas': 'Amerika',
      'Asia': 'Asien',
      'Europe': 'Europa',
      'Oceania': 'Ozeanien'
    };
    return names[continent] || continent;
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-lg text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kontinent-Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedContinent('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedContinent === 'all'
              ? 'bg-xandhopp-blue text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Alle Kontinente
        </button>
        {continents.map((continent) => (
          <button
            key={continent}
            onClick={() => setSelectedContinent(continent)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedContinent === continent
                ? 'bg-xandhopp-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getContinentDisplayName(continent)}
          </button>
        ))}
      </div>

      {/* Länder-Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32 mb-3"></div>
              <div className="bg-gray-200 rounded h-4 mb-2"></div>
              <div className="bg-gray-200 rounded h-3 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCountries.map((country) => (
            <CountryCard
              key={country.id}
              country={country}
              locale={locale}
              onClick={onCountrySelect}
            />
          ))}
        </div>
      )}

      {/* Keine Ergebnisse */}
      {!isLoading && filteredCountries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
          </div>
          <p className="text-lg text-gray-600">
            Keine Länder in {selectedContinent === 'all' ? 'allen Kontinenten' : getContinentDisplayName(selectedContinent)} gefunden
          </p>
        </div>
      )}

      {/* Statistiken */}
      {!isLoading && filteredCountries.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          {filteredCountries.length} {filteredCountries.length === 1 ? 'Land' : 'Länder'} 
          {selectedContinent !== 'all' && ` in ${getContinentDisplayName(selectedContinent)}`}
        </div>
      )}
    </div>
  );
}

// Einzelne Länder-Karte
interface CountryCardProps {
  country: Country;
  locale: SupportedLanguage;
  onClick?: (country: Country) => void;
}

function CountryCard({ country, locale, onClick }: CountryCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(country);
    }
  };

  const cardContent = (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-xandhopp-blue hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <div className="p-4">
        {/* Flagge Platzhalter */}
        <div className="w-12 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded mb-3 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">
            {country.iso_code}
          </span>
        </div>
        
        {/* Land-Name */}
        <h3 className="font-semibold text-gray-900 group-hover:text-xandhopp-blue transition-colors mb-1">
          {country.name_en}
        </h3>
        
        {/* Kontinent */}
        <p className="text-sm text-gray-500">
          {country.continent}
        </p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={handleClick} className="w-full text-left">
        {cardContent}
      </button>
    );
  }

  return (
    <Link href={`/${locale}/countries/${country.slug_en}`}>
      {cardContent}
    </Link>
  );
}
