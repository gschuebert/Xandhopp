'use client';

import { useState, useEffect, useRef } from 'react';
import { type Locale } from '../../lib/i18n';

interface Country {
  id: string;
  name: string;
  nameLocal?: string;
  continent: string;
  capital?: string;
  flag?: string;
  slug: string;
}

interface CountrySearchProps {
  onCountrySelect: (country: Country) => void;
  locale: Locale;
  isLoading: boolean;
}

export function CountrySearch({ onCountrySelect, locale, isLoading }: CountrySearchProps) {
  const [query, setQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [continents, setContinents] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load continents on mount
  useEffect(() => {
    const loadContinents = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/countries/continents');
        if (response.ok) {
          const data = await response.json();
          setContinents(data.continents);
        }
      } catch (error) {
        console.error('Error loading continents:', error);
      }
    };
    loadContinents();
  }, []);

  // Search for countries
  useEffect(() => {
    const searchCountries = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: '8'
        });
        
        if (selectedContinent) {
          params.append('continent', selectedContinent);
        }

        const response = await fetch(`http://localhost:8080/api/countries/autocomplete?${params}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.results);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error searching countries:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchCountries, 300);
    return () => clearTimeout(timeoutId);
  }, [query, selectedContinent]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryClick = (country: Country) => {
    setQuery(country.name);
    setShowSuggestions(false);
    onCountrySelect(country);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-xandhopp-blue mb-2">
          Find Your Perfect Destination
        </h2>
        <p className="text-xandhopp-blue/70">
          Search for countries and discover detailed information about living, working, and traveling.
        </p>
      </div>

      <div className="space-y-4">
        {/* Continent Filter */}
        <div>
          <label htmlFor="continent" className="block text-sm font-medium text-xandhopp-blue mb-2">
            Filter by Continent (Optional)
          </label>
          <select
            id="continent"
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portalis-accent focus:border-transparent"
          >
            <option value="">All Continents</option>
            {continents.map((continent) => (
              <option key={continent} value={continent}>
                {continent}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div ref={searchRef} className="relative">
          <label htmlFor="country-search" className="block text-sm font-medium text-xandhopp-blue mb-2">
            Search for a Country
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="country-search"
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Start typing a country name..."
              className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portalis-accent focus:border-transparent text-lg"
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-portalis-accent"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {suggestions.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleCountryClick(country)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {country.flag && (
                      <img
                        src={country.flag}
                        alt={`${country.name} flag`}
                        className="w-8 h-6 object-cover rounded-sm"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-xandhopp-blue">
                        {country.name}
                        {country.nameLocal && country.nameLocal !== country.name && (
                          <span className="text-gray-500 ml-2">({country.nameLocal})</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {country.continent}
                        {country.capital && ` • ${country.capital}`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showSuggestions && query.length >= 2 && suggestions.length === 0 && !isSearching && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
                </svg>
                <p>No countries found for "{query}"</p>
                {selectedContinent && (
                  <p className="text-sm mt-1">Try removing the continent filter</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-xandhopp-blue mb-4">Popular Destinations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Germany', 'France', 'United States', 'Japan'].map((countryName) => (
            <button
              key={countryName}
              onClick={() => setQuery(countryName)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xandhopp-blue"
            >
              {countryName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
