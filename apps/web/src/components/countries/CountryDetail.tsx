'use client';

import { useState } from 'react';
import { type Locale } from '../../lib/i18n';
import { useTranslations } from 'next-intl';

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

interface CountryDetailProps {
  country: CountryDetailData;
  locale: Locale;
  onBack: () => void;
}

type ContentSection = 'overview' | 'culture' | 'demography' | 'economy' | 'history';

// Section labels will be translated using the t() function

const sectionIcons: Record<ContentSection, string> = {
  overview: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
  culture: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  demography: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  economy: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
};

export function CountryDetail({ country, locale, onBack }: CountryDetailProps) {
  const [activeSection, setActiveSection] = useState<ContentSection>('overview');
  const t = useTranslations('countries');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  const formatArea = (area: string) => {
    const num = parseFloat(area);
    return new Intl.NumberFormat(locale).format(num) + ' km²';
  };

  const getSectionContent = (section: ContentSection): string | null => {
    switch (section) {
      case 'overview':
        return country.overview_en || null;
      case 'culture':
        return country.culture_en || null;
      case 'demography':
        return country.demography_en || null;
      case 'economy':
        return country.economy_en || null;
      case 'history':
        return country.history_en || null;
      default:
        return null;
    }
  };

  const availableSections = (Object.keys(sectionLabels) as ContentSection[]).filter(
    section => getSectionContent(section)
  );

  const currentContent = getSectionContent(activeSection);

  return (
    <div className="space-y-8">
      {/* Country Header */}
      <div className="bg-gradient-to-r from-xandhopp-accent to-xandhopp-accent-light rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {country.flag_svg_url && (
              <img
                src={country.flag_svg_url}
                alt={`${country.name_en} flag`}
                className="w-20 h-15 object-cover rounded-lg shadow-lg"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {country.name_en}
                {country.name_local && country.name_local !== country.name_en && (
                  <span className="text-2xl font-normal ml-3 opacity-90">
                    ({country.name_local})
                  </span>
                )}
              </h1>
              <div className="flex items-center space-x-4 text-lg opacity-90">
                <span>{country.continent}</span>
                {country.capital && (
                  <>
                    <span>•</span>
                    <span>Capital: {country.capital}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="btn btn-primary px-6 py-3 font-medium shadow-lg"
          >
            {t('backToSearch')}
          </button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {country.population && (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xandhopp-blue mb-1">Population</h3>
            <p className="text-2xl font-bold text-xandhopp-blue">{formatNumber(country.population)}</p>
          </div>
        )}

        {country.area_km2 && (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <h3 className="font-semibold text-xandhopp-blue mb-1">Area</h3>
            <p className="text-2xl font-bold text-xandhopp-blue">{formatArea(country.area_km2)}</p>
          </div>
        )}

        {country.currency_code && (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xandhopp-blue mb-1">Currency</h3>
            <p className="text-2xl font-bold text-xandhopp-blue">{country.currency_code}</p>
          </div>
        )}

        {country.calling_code && (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xandhopp-blue mb-1">Calling Code</h3>
            <p className="text-2xl font-bold text-xandhopp-blue">{country.calling_code}</p>
          </div>
        )}
      </div>

      {/* Content Navigation */}
      {availableSections.length > 0 && (
        <div className="card p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {availableSections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === section
                    ? 'bg-xandhopp-accent text-white'
                    : 'bg-gray-100 text-xandhopp-blue hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sectionIcons[section]} />
                </svg>
                <span>{t(section)}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {currentContent && (
            <div className="prose prose-lg max-w-none">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-xandhopp-blue mb-4">
                  {t(activeSection)}
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {currentContent}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Data Section */}
      {(country.fx || country.advisory) && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Live Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {country.fx && (country.fx.EUR_to_local || country.fx.USD_to_local) && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Exchange Rates</h4>
                <dl className="space-y-2">
                  {country.fx.EUR_to_local && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">EUR to {country.currency_code}:</dt>
                      <dd className="font-mono text-green-600">{country.fx.EUR_to_local}</dd>
                    </div>
                  )}
                  {country.fx.USD_to_local && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">USD to {country.currency_code}:</dt>
                      <dd className="font-mono text-green-600">{country.fx.USD_to_local}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
            
            {country.advisory && country.advisory.level && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Travel Advisory</h4>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    country.advisory.level <= 2 ? 'bg-green-500' :
                    country.advisory.level === 3 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700">
                    Level {country.advisory.level} 
                    {country.advisory.level <= 2 ? ' (Low Risk)' :
                     country.advisory.level === 3 ? ' (Moderate Risk)' :
                     ' (High Risk)'}
                  </span>
                </div>
                {country.advisory.updated_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    Updated: {new Date(country.advisory.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date(country.refreshed_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Basic Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-600">ISO 2 Code:</dt>
              <dd className="text-xandhopp-blue font-mono">{country.iso2}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-600">ISO 3 Code:</dt>
              <dd className="text-xandhopp-blue font-mono">{country.iso3}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-600">Continent:</dt>
              <dd className="text-xandhopp-blue">{country.continent}</dd>
            </div>
            {country.capital && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Capital:</dt>
                <dd className="text-xandhopp-blue">{country.capital}</dd>
              </div>
            )}
            {country.languages && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Languages:</dt>
                <dd className="text-xandhopp-blue">
                  {Array.isArray(country.languages) 
                    ? country.languages.join(', ')
                    : country.languages.toString().replace(/[{}]/g, '').replace(/"/g, '')
                  }
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Geographic Info */}
        {(country.lat || country.lon) && (
          <div className="card p-6">
            <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Geographic Information</h3>
            <dl className="space-y-3">
              {country.lat && (
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Latitude:</dt>
                  <dd className="text-xandhopp-blue">{country.lat}°</dd>
                </div>
              )}
              {country.lon && (
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Longitude:</dt>
                  <dd className="text-xandhopp-blue">{country.lon}°</dd>
                </div>
              )}
            </dl>
            {country.lat && country.lon && (
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps?q=${country.lat},${country.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-xandhopp-accent hover:text-xandhopp-accent-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>View on Google Maps</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back to Search Button at Bottom */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="btn btn-primary px-8 py-3 text-lg shadow-lg"
        >
          {t('backToCountrySearch')}
        </button>
      </div>
    </div>
  );
}
