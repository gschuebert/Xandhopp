'use client';

import { useState, useEffect } from 'react';
import { type Locale } from '../../lib/i18n';
import { getContent } from '../../lib/i18n';
import { countriesAPI, type CountryDetailResponse, type SupportedLanguage, getContentByType, getFactByKey, formatCountryName } from '../../lib/countries-api';
import { CountryMap } from './CountryMap';
import { CountryComparison } from './CountryComparison';
import { RelatedCountries } from './RelatedCountries';

interface CountryDetailEnhancedProps {
  slug: string;
  locale: Locale;
  onBack?: () => void;
}

type ContentSection = 'overview' | 'culture' | 'demography' | 'economy' | 'history' | 'geography' | 'politics' | 'visa';

const sectionIcons: Record<ContentSection, string> = {
  overview: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
  culture: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  demography: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  economy: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  geography: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  politics: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  visa: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
};

export function CountryDetailEnhanced({ slug, locale, onBack }: CountryDetailEnhancedProps) {
  const [data, setData] = useState<CountryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ContentSection>('overview');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const content = getContent(locale);
  const lang = locale === 'de' ? 'de' : 'en';

  useEffect(() => {
    const loadCountryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const countryData = await countriesAPI.getCountryFullData(slug, lang as SupportedLanguage);
        setData(countryData);
      } catch (err) {
        console.error('Error loading country data:', err);
        setError('Failed to load country data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCountryData();
  }, [slug, lang]);

  if (isLoading) {
    return <CountryDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-lg text-gray-600 mb-4">{error}</p>
        {onBack && (
          <button onClick={onBack} className="btn-primary">
            {content.countries.backToSearch}
          </button>
        )}
      </div>
    );
  }

  const { country, contents, facts, media } = data;
  const countryName = formatCountryName(country, lang as SupportedLanguage);

  // Organize content by type
  const overviewContent = getContentByType(contents, 'overview');
  const cultureContent = getContentByType(contents, 'culture');
  const economyContent = getContentByType(contents, 'economy');
  const historyContent = getContentByType(contents, 'history');
  const geographyContent = getContentByType(contents, 'geography');
  const politicsContent = getContentByType(contents, 'politics');
  const visaContent = getContentByType(contents, 'visa');

  // Extract key facts
  const population = getFactByKey(facts, 'population');
  const area = getFactByKey(facts, 'area');
  const capital = getFactByKey(facts, 'capital');
  const currency = getFactByKey(facts, 'currency');
  const language = getFactByKey(facts, 'language');
  const gdp = getFactByKey(facts, 'gdp');

  // Available sections
  const availableSections: ContentSection[] = [
    'overview', 'culture', 'demography', 'economy', 'history', 'geography', 'politics', 'visa'
  ].filter(section => {
    const contentMap = {
      overview: overviewContent,
      culture: cultureContent,
      demography: getFactByKey(facts, 'demography'),
      economy: economyContent,
      history: historyContent,
      geography: geographyContent,
      politics: politicsContent,
      visa: visaContent
    };
    return contentMap[section];
  }) as ContentSection[];

  const currentContent = (() => {
    switch (activeSection) {
      case 'overview': return overviewContent;
      case 'culture': return cultureContent;
      case 'economy': return economyContent;
      case 'history': return historyContent;
      case 'geography': return geographyContent;
      case 'politics': return politicsContent;
      case 'visa': return visaContent;
      case 'demography': return getFactByKey(facts, 'demography');
      default: return null;
    }
  })();

  const formatNumber = (num: string | number) => {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return num;
    return new Intl.NumberFormat(locale).format(number);
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = `${countryName} - Xandhopp`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <a href={`/${locale}`} className="hover:text-xandhopp-blue">Home</a>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <a href={`/${locale}/countrys`} className="hover:text-xandhopp-blue">Countries</a>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">{countryName}</span>
      </nav>

      {/* Country Header */}
      <div className="bg-gradient-to-r from-xandhopp-accent to-xandhopp-accent-light rounded-2xl p-8 text-white mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {country.flag_url ? (
              <img
                src={country.flag_url}
                alt={`${countryName} flag`}
                className="w-24 h-16 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-24 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">{country.iso_code}</span>
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {countryName}
                {country.name_local && country.name_local !== country.name_en && (
                  <span className="text-2xl font-normal ml-3 opacity-90">
                    ({country.name_local})
                  </span>
                )}
              </h1>
              <div className="flex items-center space-x-4 text-lg opacity-90">
                <span>{country.continent}</span>
                {capital && (
                  <>
                    <span>•</span>
                    <span>Capital: {capital.value}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Compare Button */}
            <button
              onClick={() => setShowComparison(true)}
              className="btn btn-outline text-white border-white hover:bg-white hover:text-xandhopp-accent px-4 py-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="btn btn-outline text-white border-white hover:bg-white hover:text-xandhopp-accent px-4 py-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              )}
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="btn btn-primary px-6 py-3 font-medium shadow-lg"
              >
                {content.countries.backToSearch}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {population && (
          <StatCard
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            title="Population"
            value={formatNumber(population.value)}
            unit={population.unit}
            color="blue"
          />
        )}

        {area && (
          <StatCard
            icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
            title="Area"
            value={formatNumber(area.value)}
            unit={area.unit}
            color="green"
          />
        )}

        {currency && (
          <StatCard
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            title="Currency"
            value={currency.value}
            color="yellow"
          />
        )}

        {gdp && (
          <StatCard
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            title="GDP"
            value={formatNumber(gdp.value)}
            unit={gdp.unit}
            color="purple"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Content Navigation & Main Content */}
        <div className="lg:col-span-3">
          {/* Content Navigation */}
          {availableSections.length > 0 && (
            <div className="card p-6 mb-6">
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
                    <span className="capitalize">{section}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              {currentContent && (
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-xandhopp-blue mb-4 capitalize">
                      {activeSection}
                    </h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {currentContent.content || currentContent.value}
                    </div>
                    {currentContent.source_url && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a
                          href={currentContent.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Source: Wikipedia
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Quick Facts</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">ISO Code:</dt>
                <dd className="text-xandhopp-blue font-mono">{country.iso_code}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Continent:</dt>
                <dd className="text-xandhopp-blue">{country.continent}</dd>
              </div>
              {capital && (
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Capital:</dt>
                  <dd className="text-xandhopp-blue">{capital.value}</dd>
                </div>
              )}
              {language && (
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Language:</dt>
                  <dd className="text-xandhopp-blue">{language.value}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Interactive Map */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Location</h3>
            <CountryMap 
              countryName={countryName}
              latitude={parseFloat(getFactByKey(facts, 'latitude')?.value || '0')}
              longitude={parseFloat(getFactByKey(facts, 'longitude')?.value || '0')}
            />
          </div>

          {/* Media Gallery */}
          {media.length > 0 && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Images</h3>
              <div className="space-y-3">
                {media.slice(0, 3).map((item) => (
                  <div key={item.id} className="relative">
                    <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                      <span className="text-gray-500 text-sm">{item.title}</span>
                    </div>
                    {item.attribution && (
                      <p className="text-xs text-gray-500 mt-1">{item.attribution}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Facts */}
          <AdditionalFacts facts={facts} />

          {/* Related Countries */}
          <RelatedCountries
            currentCountrySlug={slug}
            currentContinent={country.continent}
            locale={locale}
          />
        </div>
      </div>

      {/* Back to Search Button at Bottom */}
      <div className="mt-8 text-center">
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-primary px-8 py-3 text-lg shadow-lg"
          >
            {content.countries.backToCountrySearch}
          </button>
        )}
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <CountryComparison
          currentCountrySlug={slug}
          locale={locale}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  unit?: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ icon, title, value, unit, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="card p-6 text-center">
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-full flex items-center justify-center mx-auto mb-3`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <h3 className="font-semibold text-xandhopp-blue mb-1">{title}</h3>
      <p className="text-2xl font-bold text-xandhopp-blue">
        {value}{unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// Additional Facts Component
interface AdditionalFactsProps {
  facts: any[];
}

function AdditionalFacts({ facts }: AdditionalFactsProps) {
  const additionalFacts = facts.filter(fact => 
    !['population', 'area', 'capital', 'currency', 'language', 'gdp'].includes(fact.key)
  );

  if (additionalFacts.length === 0) return null;

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-xandhopp-blue mb-4">Additional Information</h3>
      <div className="space-y-2">
        {additionalFacts.map((fact) => (
          <div key={fact.id}>
            <span className="font-medium text-gray-700 capitalize">{fact.key}:</span>
            <span className="ml-2 text-gray-600">
              {fact.value} {fact.unit && <span className="text-gray-500">{fact.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Skeleton
function CountryDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-16 bg-gray-400 rounded-lg animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-400 rounded animate-pulse w-64"></div>
            <div className="h-4 bg-gray-400 rounded animate-pulse w-32"></div>
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
