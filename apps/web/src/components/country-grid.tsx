"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
}

// Featured countries with their data
const FEATURED_COUNTRIES: Country[] = [
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", region: "Europe" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", region: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "Europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "Europe" },
  { code: "US", name: "United States", flag: "🇺🇸", region: "North America" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "North America" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "Oceania" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "Asia" },
  { code: "JP", name: "Japan", flag: "🇯🇵", region: "Asia" },
];

export function CountryGrid() {
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch available countries from API
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        if (data.countries) {
          setAvailableCountries(data.countries);
        }
      })
      .catch(err => {
        console.log('API not ready yet, showing featured countries');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {FEATURED_COUNTRIES.map((country) => {
        const hasData = availableCountries.includes(country.code);
        
        return (
          <Link
            key={country.code}
            href={`/country/${country.code}`}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 ${
              hasData ? 'border-green-500 hover:border-green-600' : 'border-gray-300'
            }`}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{country.flag}</span>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {country.name}
                </h3>
                <p className="text-sm text-gray-500">{country.region}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {country.code}
              </span>
              <div className="flex items-center">
                {hasData ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Data Available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
