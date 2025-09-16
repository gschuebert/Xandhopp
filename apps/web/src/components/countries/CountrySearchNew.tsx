'use client';

import { useState, useEffect, useMemo } from 'react';
import { countriesAPI, type Country, type SupportedLanguage } from '../../lib/countries-api';

interface CountrySearchNewProps {
  locale: SupportedLanguage;
  onCountrySelect?: (country: Country) => void;
  placeholder?: string;
  className?: string;
}

export function CountrySearchNew({ 
  locale, 
  onCountrySelect, 
  placeholder = "Länder suchen...",
  className = ""
}: CountrySearchNewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await countriesAPI.searchCountries(query, locale, 10);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, locale]);

  const handleCountrySelect = (country: Country) => {
    setQuery('');
    setShowResults(false);
    if (onCountrySelect) {
      onCountrySelect(country);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 150);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-xandhopp-blue focus:border-xandhopp-blue text-lg"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-xandhopp-blue"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {results.length === 0 && !isLoading ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              Keine Länder gefunden
            </div>
          ) : (
            results.map((country) => (
              <SearchResultItem
                key={country.id}
                country={country}
                onClick={() => handleCountrySelect(country)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Einzelnes Suchergebnis
interface SearchResultItemProps {
  country: Country;
  onClick: () => void;
}

function SearchResultItem({ country, onClick }: SearchResultItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
    >
      <div className="flex items-center">
        {/* Flagge Platzhalter */}
        <div className="w-8 h-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded border mr-3 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">
            {country.iso_code}
          </span>
        </div>
        
        {/* Land-Info */}
        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {country.name_en}
          </div>
          <div className="text-sm text-gray-500">
            {country.continent}
          </div>
        </div>
      </div>
    </button>
  );
}
