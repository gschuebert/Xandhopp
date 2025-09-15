'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { PortalisLogo } from '../../../components/xandhopp-logo';
import { getContent, type Locale } from '../../../lib/i18n';
import { CountrySearch } from '../../../components/countries/CountrySearch';
import { CountryDetail } from '../../../components/countries/CountryDetail';

interface CountriesPageProps {
  params: {
    locale: Locale;
  };
}

interface Country {
  id: string;
  name: string;
  nameLocal?: string;
  continent: string;
  capital?: string;
  flag?: string;
  slug: string;
}

interface CountryDetailData {
  slug: string;
  iso2: string;
  iso3: string;
  name_en: string;
  name_local?: string;
  continent: string;
  capital?: string;
  population?: number;
  area_km2?: string;
  lat?: string;
  lon?: string;
  calling_code?: string;
  currency_code?: string;
  languages?: string[] | string;
  flag_svg_url?: string;
  overview_en?: string;
  culture_en?: string;
  demography_en?: string;
  economy_en?: string;
  history_en?: string;
  advisory?: {
    level?: number;
    updated_at?: string;
  };
  fx?: {
    EUR_to_local?: string;
    USD_to_local?: string;
  };
  refreshed_at: string;
}

export default function CountriesPage({ params }: CountriesPageProps) {
  const content = getContent(params.locale);
  const [selectedCountry, setSelectedCountry] = useState<CountryDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCountrySelect = useCallback(async (country: Country) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/countries/${country.slug}/public`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCountry(data);
      }
    } catch (error) {
      console.error('Error fetching country details:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBackToSearch = () => {
    setSelectedCountry(null);
  };

  if (selectedCountry) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        {/* Country Detail */}
        <main className="container-default py-8">
          <CountryDetail 
            country={selectedCountry} 
            locale={params.locale}
            onBack={handleBackToSearch}
          />
        </main>
        
        <Footer locale={params.locale} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="container-default py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-xandhopp-accent to-xandhopp-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-xandhopp-blue mb-6">
              {content.teasers.countries.headline}
            </h1>
            
            <p className="text-xl text-xandhopp-blue/80 mb-8 leading-relaxed">
              {content.teasers.countries.description}
            </p>
          </div>

          {/* Search Component */}
          <div className="card p-8">
            <CountrySearch 
              onCountrySelect={handleCountrySelect}
              locale={params.locale}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      <Footer locale={params.locale} />
    </div>
  );
}