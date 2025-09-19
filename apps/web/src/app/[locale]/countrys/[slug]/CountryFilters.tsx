'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Locale } from '../../../../lib/i18n';

type Country = {
  id: number;
  iso_code: string;
  name_en: string;
  continent: string | null;
  slug_en: string | null;
  slug_de: string | null;
};

interface CountryFiltersProps {
  locale: Locale;
  currentSlug: string;
  currentLang: string;
}

export default function CountryFilters({ locale, currentSlug, currentLang }: CountryFiltersProps) {
  const router = useRouter();
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [continent, setContinent] = useState<string>('');
  const [countrySlug, setCountrySlug] = useState<string>(currentSlug);

  // Fetch all countries once to compute continents
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082'}/api/countries`)
      .then((r) => r.json())
      .then((data: any) => {
        const countriesData = data.countries || [];
        setAllCountries(countriesData);
        const conts = Array.from(
          new Set((countriesData.map((c: Country) => c.continent || "").filter(Boolean) as string[]))
        ).sort();
        setContinents(conts);
        
        // Find current country's continent
        const currentCountry = countriesData.find((c: Country) => 
          (c.slug_en || c.slug_de) === currentSlug
        );
        if (currentCountry) {
          setContinent(currentCountry.continent || '');
        }
      })
      .catch(console.error);
  }, [currentSlug]);

  // Load countries by selected continent
  useEffect(() => {
    if (!continent) {
      setCountries(allCountries);
      return;
    }
    setCountries(allCountries.filter((c) => (c.continent || "") === continent));
  }, [continent, allCountries]);

  const handleContinentChange = (newContinent: string) => {
    setContinent(newContinent);
    setCountrySlug('');
  };

  const handleCountryChange = (newCountrySlug: string) => {
    setCountrySlug(newCountrySlug);
    if (newCountrySlug) {
      router.push(`/${locale}/countrys/${newCountrySlug}?lang=${currentLang}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Continent</label>
        <select
          className="w-full rounded border border-gray-300 px-3 py-2"
          value={continent}
          onChange={(e) => handleContinentChange(e.target.value)}
        >
          <option value="">All continents</option>
          {continents.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Country</label>
        <select
          className="w-full rounded border border-gray-300 px-3 py-2"
          value={countrySlug}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          <option value="">All countries</option>
          {countries
            .slice() // copy for safe sort
            .sort((a, b) => a.name_en.localeCompare(b.name_en))
            .map((c) => {
              const slug = (c.slug_en || c.slug_de || c.name_en).toLowerCase().replace(/\s+/g, "-");
              return (
                <option key={c.id} value={slug}>
                  {c.name_en}
                </option>
              );
            })}
        </select>
      </div>
    </div>
  );
}
