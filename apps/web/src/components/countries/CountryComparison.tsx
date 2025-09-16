'use client';

import { useState, useEffect } from 'react';
import { countriesAPI, type Country, type SupportedLanguage } from '../../lib/countries-api';

interface CountryComparisonProps {
  currentCountrySlug: string;
  locale: string;
  onClose: () => void;
}

interface ComparisonData {
  country: Country;
  facts: any[];
  contents: any[];
}

export function CountryComparison({ currentCountrySlug, locale, onClose }: CountryComparisonProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await countriesAPI.getCountries(undefined, locale as SupportedLanguage);
        setCountries(response.countries);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };

    loadCountries();
  }, [locale]);

  const handleCountrySelect = (countrySlug: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countrySlug)) {
        return prev.filter(slug => slug !== countrySlug);
      } else if (prev.length < 3) {
        return [...prev, countrySlug];
      }
      return prev;
    });
  };

  const loadComparisonData = async () => {
    if (selectedCountries.length === 0) return;

    setIsLoading(true);
    try {
      const data = await Promise.all(
        selectedCountries.map(async (slug) => {
          const [country, facts, contents] = await Promise.all([
            countriesAPI.getCountry(slug, locale as SupportedLanguage),
            countriesAPI.getCountryFacts(slug, locale as SupportedLanguage),
            countriesAPI.getCountryContent(slug, locale as SupportedLanguage)
          ]);
          return { country, facts, contents };
        })
      );
      setComparisonData(data);
    } catch (error) {
      console.error('Error loading comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountries.length > 0) {
      loadComparisonData();
    }
  }, [selectedCountries, locale]);

  const getFactValue = (facts: any[], key: string) => {
    const fact = facts.find(f => f.key === key);
    return fact ? `${fact.value} ${fact.unit || ''}`.trim() : 'N/A';
  };

  const getContentValue = (contents: any[], type: string) => {
    const content = contents.find(c => c.content_type?.key === type);
    return content ? content.content.substring(0, 100) + '...' : 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Compare Countries</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Country Selection */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Select up to 3 countries to compare:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-40 overflow-y-auto">
            {countries.map((country) => (
              <label
                key={country.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCountries.includes(country.slug_en)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country.slug_en)}
                  onChange={() => handleCountrySelect(country.slug_en)}
                  className="mr-3"
                  disabled={!selectedCountries.includes(country.slug_en) && selectedCountries.length >= 3}
                />
                <div>
                  <div className="font-medium">{country.name_en}</div>
                  <div className="text-sm text-gray-500">{country.continent}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comparison data...</p>
          </div>
        ) : comparisonData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  {comparisonData.map((data) => (
                    <th key={data.country.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {data.country.name_en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Population
                  </td>
                  {comparisonData.map((data) => (
                    <td key={data.country.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFactValue(data.facts, 'population')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Area
                  </td>
                  {comparisonData.map((data) => (
                    <td key={data.country.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFactValue(data.facts, 'area')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Capital
                  </td>
                  {comparisonData.map((data) => (
                    <td key={data.country.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFactValue(data.facts, 'capital')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Currency
                  </td>
                  {comparisonData.map((data) => (
                    <td key={data.country.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFactValue(data.facts, 'currency')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    GDP
                  </td>
                  {comparisonData.map((data) => (
                    <td key={data.country.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFactValue(data.facts, 'gdp')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Language
                  </td>
                  {comparisonData.map((data) => (
                    <td key={data.country.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFactValue(data.facts, 'language')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Overview
                  </td>
                  {comparisonData.map((data) => (
                    <td key={data.country.id} className="px-6 py-4 text-sm text-gray-900">
                      {getContentValue(data.contents, 'overview')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Select countries to compare their data</p>
          </div>
        )}
      </div>
    </div>
  );
}
