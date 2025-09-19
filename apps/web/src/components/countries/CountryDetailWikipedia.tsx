'use client';

import { useState, useEffect } from 'react';
import { type Locale } from '../../lib/i18n';
import { getContent } from '../../lib/i18n';
import { countriesAPI, type CountryDetailResponse, type SupportedLanguage, getContentByType, getFactByKey, formatCountryName } from '../../lib/countries-api';
import { CountryMap } from './CountryMap';
import { processWikipediaContent, processWikipediaHTML, intelligentParagraphBreaker, isHTMLContent } from '../../lib/html-utils';
import { htmlToCleanText } from '../../lib/textCleaner';
import { CountryFlagBox } from './CountryFlagBox';

interface CountryDetailWikipediaProps {
  slug: string;
  locale: Locale;
  onBack?: () => void;
}

type WikipediaSection = 'allgemein' | 'geographie' | 'bevoelkerung' | 'geschichte' | 'politik' | 'wirtschaft' | 'verkehr' | 'kultur' | 'siehe-auch';

const sectionLabels: Record<WikipediaSection, string> = {
  allgemein: 'Allgemein',
  geographie: 'Geographie',
  bevoelkerung: 'Bevölkerung',
  geschichte: 'Geschichte',
  politik: 'Politik',
  wirtschaft: 'Wirtschaft',
  verkehr: 'Verkehr',
  kultur: 'Kultur',
  'siehe-auch': 'Siehe auch'
};

const sectionIcons: Record<WikipediaSection, string> = {
  allgemein: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  geographie: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  bevoelkerung: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  geschichte: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  politik: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  wirtschaft: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  verkehr: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  kultur: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'siehe-auch': 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
};

export function CountryDetailWikipedia({ slug, locale, onBack }: CountryDetailWikipediaProps) {
  const [data, setData] = useState<CountryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<WikipediaSection>('allgemein');

  const content = getContent(locale);
  const lang = locale === 'de' ? 'de' : 'en';
  
  // Labels for different languages
  const labels = {
    de: {
      capital: 'Hauptstadt',
      continent: 'Kontinent',
      isoCode: 'ISO-Code',
      population: 'Bevölkerung',
      area: 'Fläche',
      currency: 'Währung',
      officialLanguage: 'Amtssprache',
      gdp: 'BIP (nominal)',
      administration: 'Verwaltung',
      regionalDivision: 'Regionale Gliederung',
      updated: 'Aktualisiert',
      coordinates: 'Koordinaten',
      geoDataNotAvailable: 'Geodaten nicht verfügbar',
      inhabitants: 'Einwohner',
      populationDensity: 'Bevölkerungsdichte',
      statistics: 'Statistiken',
      weblinks: 'Weblinks',
      literature: 'Literatur',
      additionalInfo: 'Weitere Informationen',
      geodata: 'Geodaten',
      inWikipedia: 'in der Wikipedia',
      atGoogleMaps: 'bei Google Maps',
      ciaFactbook: 'CIA World Factbook',
      additionalSource: 'Weitere Quelle'
    },
    en: {
      capital: 'Capital',
      continent: 'Continent',
      isoCode: 'ISO Code',
      population: 'Population',
      area: 'Area',
      currency: 'Currency',
      officialLanguage: 'Official Language',
      gdp: 'GDP (nominal)',
      administration: 'Administration',
      regionalDivision: 'Regional Division',
      updated: 'Updated',
      coordinates: 'Coordinates',
      geoDataNotAvailable: 'Geodata not available',
      inhabitants: 'Inhabitants',
      populationDensity: 'Population Density',
      statistics: 'Statistics',
      weblinks: 'External Links',
      literature: 'Literature',
      additionalInfo: 'Additional Information',
      geodata: 'Geodata',
      inWikipedia: 'on Wikipedia',
      atGoogleMaps: 'on Google Maps',
      ciaFactbook: 'CIA World Factbook',
      additionalSource: 'Additional Source'
    }
  };
  
  const t = labels[lang] || labels.en;

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
    return <WikipediaSkeleton />;
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

  // Organize content by type - mapping Wikipedia sections to content types
  const getContentForSection = (section: WikipediaSection) => {
    const contentTypeMap: Record<WikipediaSection, string> = {
      allgemein: 'overview',
      geographie: 'geography',
      bevoelkerung: 'demography',
      geschichte: 'history',
      politik: 'politics',
      wirtschaft: 'economy',
      verkehr: 'transport',
      kultur: 'culture',
      'siehe-auch': 'references'
    };
    
    const contentType = contentTypeMap[section];
    return getContentByType(contents, contentType);
  };

  // Get content for specific sections
  const overviewContent = getContentByType(contents, 'overview');
  const cultureContent = getContentByType(contents, 'culture');
  const economyContent = getContentByType(contents, 'economy');
  const historyContent = getContentByType(contents, 'history');
  const geographyContent = getContentByType(contents, 'geography');
  const politicsContent = getContentByType(contents, 'politics');
  const demographyContent = getContentByType(contents, 'demography');
  const transportContent = getContentByType(contents, 'transport');

  // Extract key facts
  const population = getFactByKey(facts, 'population');
  const area = getFactByKey(facts, 'area');
  const capital = getFactByKey(facts, 'capital');
  const currency = getFactByKey(facts, 'currency');
  const language = getFactByKey(facts, 'language');
  const gdp = getFactByKey(facts, 'gdp');
  const latitude = getFactByKey(facts, 'latitude');
  const longitude = getFactByKey(facts, 'longitude');

  const formatNumber = (num: string | number) => {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return num;
    return new Intl.NumberFormat(locale).format(number);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Wikipedia-style Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-3xl font-normal text-black mb-1 font-serif leading-tight">
              {countryName}
            </h1>
            <div className="text-sm text-gray-600 mb-3">
              {country.continent}
              {capital && (
                <>
                  <span className="mx-1">•</span>
                  <span>Hauptstadt: {capital.value}</span>
                </>
              )}
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="ml-4 px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              ← Zurück
            </button>
          )}
        </div>
        <hr className="border-t border-gray-300 mb-4" />
      </div>

      {/* Wikipedia 3-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Navigation */}
        <aside className="col-span-12 lg:col-span-2">
          <nav className="sticky top-6">
            <div className="border border-gray-300 bg-gray-50">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                <h3 className="text-sm font-bold text-black">
                  Inhaltsverzeichnis
                </h3>
              </div>
              <div className="p-3">
                <ul className="space-y-0">
                  {(['allgemein', 'geographie', 'bevoelkerung', 'geschichte', 'politik', 'wirtschaft', 'verkehr', 'kultur', 'siehe-auch'] as WikipediaSection[]).map((key, index) => (
                    <li key={key} className="leading-tight">
                      <button
                        onClick={() => setActiveSection(key)}
                        className={`w-full text-left py-1 text-sm hover:underline transition-colors ${
                          activeSection === key
                            ? 'text-black font-bold'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        {index + 1} {sectionLabels[key]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="col-span-12 lg:col-span-7">
          <DynamicContentSection 
            section={activeSection}
            sectionLabel={sectionLabels[activeSection]}
            content={getContentForSection(activeSection)}
            facts={facts}
            countryName={countryName}
            formatNumber={formatNumber}
          />
        </main>

        {/* Right Sidebar - Infobox */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-6 space-y-4">
            {/* Flag and Coat of Arms Box */}
            <CountryFlagBox 
              slug={slug}
              countryName={countryName}
              lang={lang}
            />

            {/* Wikipedia-style Infobox */}
            <div className="border border-gray-300 bg-gray-50 text-sm">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 text-center">
                <h3 className="font-bold text-black text-base">{countryName}</h3>
              </div>
              <div className="p-3">

                {/* Comprehensive Info Table */}
                <table className="w-full text-xs">
                  <tbody>
                    {capital && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.capital}:</td>
                        <td className="py-1 text-black">{capital.value}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-200">
                      <td className="py-1 pr-2 text-gray-700 font-medium">{t.continent}:</td>
                      <td className="py-1 text-black">{country.continent}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1 pr-2 text-gray-700 font-medium">{t.isoCode}:</td>
                      <td className="py-1 text-black font-mono">{country.iso_code}</td>
                    </tr>
                    {population && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.population}:</td>
                        <td className="py-1 text-black">{formatNumber(population.value)}</td>
                      </tr>
                    )}
                    {getFactByKey(facts, 'area_km2') && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.area}:</td>
                        <td className="py-1 text-black">{formatNumber(getFactByKey(facts, 'area_km2')?.value || '')} km²</td>
                      </tr>
                    )}
                    {currency && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.currency}:</td>
                        <td className="py-1 text-black">{currency.value}</td>
                      </tr>
                    )}
                    {getFactByKey(facts, 'official_language') && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.officialLanguage}:</td>
                        <td className="py-1 text-black">{getFactByKey(facts, 'official_language')?.value}</td>
                      </tr>
                    )}
                    {getFactByKey(facts, 'gdp_nominal') && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.gdp}:</td>
                        <td className="py-1 text-black">{formatNumber(getFactByKey(facts, 'gdp_nominal')?.value || '')}</td>
                      </tr>
                    )}
                    {getFactByKey(facts, 'bip_nominal') && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.gdp}:</td>
                        <td className="py-1 text-black">{formatNumber(getFactByKey(facts, 'bip_nominal')?.value || '')}</td>
                      </tr>
                    )}
                    {country.has_subregions && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-700 font-medium">{t.administration}:</td>
                        <td className="py-1 text-black">{t.regionalDivision}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1 pr-2 text-gray-700 font-medium">{t.updated}:</td>
                      <td className="py-1 text-gray-500 text-xs">{new Date(country.updated_at).toLocaleDateString(locale)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Geodaten Box */}
            <div className="border border-gray-300 bg-gray-50 text-sm">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                <h3 className="font-bold text-black">{t.geodata}</h3>
              </div>
              <div className="p-3">
                {latitude && longitude ? (
                  <div className="space-y-3">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr>
                          <td className="py-1 pr-2 text-gray-700 font-medium">{t.coordinates}:</td>
                          <td className="py-1 text-black font-mono text-xs">
                            {parseFloat(latitude.value).toFixed(2)}° N, {parseFloat(longitude.value).toFixed(2)}° {lang === 'de' ? 'O' : 'E'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <CountryMap 
                      countryName={countryName}
                      latitude={parseFloat(latitude.value)}
                      longitude={parseFloat(longitude.value)}
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">
                    {t.geoDataNotAvailable}
                  </div>
                )}
              </div>
            </div>

            {/* Statistiken Box */}
            <StatisticsBox facts={facts} formatNumber={formatNumber} labels={t} lang={lang} />

            {/* Externe Links Box */}
            <ExternalLinksBox countryName={countryName} contents={contents} labels={t} lang={lang} />

            {/* Literatur Box */}
            <LiteratureBox contents={contents} labels={t} />

            {/* Additional Facts */}
            <AdditionalFactsBox facts={facts} labels={t} />
          </div>
        </aside>
      </div>
    </div>
  );
}

// Dynamic Content Section Component
interface DynamicContentSectionProps {
  section: WikipediaSection;
  sectionLabel: string;
  content: any;
  facts: any[];
  countryName: string;
  formatNumber: (num: string | number) => string | number;
}

function DynamicContentSection({ 
  section, 
  sectionLabel, 
  content, 
  facts, 
  countryName, 
  formatNumber 
}: DynamicContentSectionProps) {
  const population = facts.find(f => f.key === 'population');
  const language = facts.find(f => f.key === 'language');
  const gdp = facts.find(f => f.key === 'gdp');
  const currency = facts.find(f => f.key === 'currency');

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-normal text-black mb-3 font-serif border-b border-gray-300 pb-1">
        {sectionLabel}
      </h2>
      
      {/* Content from localized_contents table */}
      {content ? (
        <div className="text-black text-sm leading-relaxed">
          {/* Process content with enhanced text cleaning */}
          <div className="space-y-4">
            {htmlToCleanText(content.content).split('\n\n').map((paragraph, index) => {
              const trimmedParagraph = paragraph.trim();
              if (trimmedParagraph.length === 0) return null;
              
              return (
                <p key={index} className="text-justify leading-6 mb-4 text-black">
                  {trimmedParagraph}
                </p>
              );
            })}
          </div>
          {content.source_url && (
            <div className="mt-6 pt-3 border-t border-gray-300 text-xs text-gray-600">
              <a
                href={content.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Quelle: {content.source_url.includes('wikipedia') ? 'Wikipedia' : 'Externe Quelle'}
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-600 italic mb-6">
          {sectionLabel === 'Allgemein' ? 'Allgemeine Informationen werden geladen...' :
           sectionLabel === 'Geographie' ? 'Geographische Informationen werden geladen...' :
           sectionLabel === 'Bevölkerung' ? 'Bevölkerungsinformationen werden geladen...' :
           sectionLabel === 'Geschichte' ? 'Historische Informationen werden geladen...' :
           sectionLabel === 'Politik' ? 'Politische Informationen werden geladen...' :
           sectionLabel === 'Wirtschaft' ? 'Wirtschaftsinformationen werden geladen...' :
           sectionLabel === 'Verkehr' ? 'Verkehrsinformationen werden geladen...' :
           sectionLabel === 'Kultur' ? 'Kulturelle Informationen werden geladen...' :
           'Informationen werden geladen...'}
        </div>
      )}

      {/* Additional section-specific content */}
      {section === 'bevoelkerung' && (
        <div className="space-y-4">
          {population && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Bevölkerung</h3>
              <p className="text-lg">
                {formatNumber(population.value)} {population.unit}
              </p>
            </div>
          )}
          {language && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Sprachen</h3>
              <p className="text-gray-700">{language.value}</p>
            </div>
          )}
        </div>
      )}

      {section === 'wirtschaft' && (
        <div className="space-y-4">
          {gdp && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Bruttoinlandsprodukt</h3>
              <p className="text-lg">
                {formatNumber(gdp.value)} {gdp.unit}
              </p>
            </div>
          )}
          {currency && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Währung</h3>
              <p className="text-lg">{currency.value}</p>
            </div>
          )}
        </div>
      )}

      {section === 'siehe-auch' && (
        <div className="space-y-2">
          <a href={`https://de.wikipedia.org/wiki/${encodeURIComponent(countryName)}`} 
             target="_blank" 
             rel="noopener noreferrer"
             className="text-blue-600 hover:text-blue-800 underline block">
            {countryName} auf Wikipedia
          </a>
          <a href={`https://www.google.com/maps/search/${encodeURIComponent(countryName)}`}
             target="_blank"
             rel="noopener noreferrer"
             className="text-blue-600 hover:text-blue-800 underline block">
            {countryName} auf Google Maps
          </a>
        </div>
      )}
    </section>
  );
}

// Statistics Box Component
interface StatisticsBoxProps {
  facts: any[];
  formatNumber: (num: string | number) => string | number;
  labels: any;
  lang: string;
}

function StatisticsBox({ facts, formatNumber, labels, lang }: StatisticsBoxProps) {
  const population = getFactByKey(facts, 'population');
  const area = getFactByKey(facts, 'area_km2');
  const gdpNominal = getFactByKey(facts, 'gdp_nominal') || getFactByKey(facts, 'bip_nominal');
  
  // Calculate population density if we have both population and area
  let populationDensity = null;
  if (population && area) {
    const popValue = parseFloat(population.value);
    const areaValue = parseFloat(area.value);
    if (!isNaN(popValue) && !isNaN(areaValue) && areaValue > 0) {
      populationDensity = Math.round(popValue / areaValue);
    }
  }

  const hasStatistics = population || area || gdpNominal || populationDensity;
  
  if (!hasStatistics) return null;

  return (
    <div className="border border-gray-300 bg-gray-50 text-sm">
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
        <h3 className="font-bold text-black">{labels.statistics}</h3>
      </div>
      <div className="p-3">
        <table className="w-full text-xs">
          <tbody>
            {population && (
              <tr className="border-b border-gray-200">
                <td className="py-1 pr-2 text-gray-700 font-medium">{labels.inhabitants}:</td>
                <td className="py-1 text-black">{formatNumber(population.value)}</td>
              </tr>
            )}
            {area && (
              <tr className="border-b border-gray-200">
                <td className="py-1 pr-2 text-gray-700 font-medium">{labels.area}:</td>
                <td className="py-1 text-black">{formatNumber(area.value)} km²</td>
              </tr>
            )}
            {populationDensity && (
              <tr className="border-b border-gray-200">
                <td className="py-1 pr-2 text-gray-700 font-medium">{labels.populationDensity}:</td>
                <td className="py-1 text-black">{populationDensity} {lang === 'de' ? 'Einw./km²' : 'inh./km²'}</td>
              </tr>
            )}
            {gdpNominal && (
              <tr>
                <td className="py-1 pr-2 text-gray-700 font-medium">{labels.gdp}:</td>
                <td className="py-1 text-black">{formatNumber(gdpNominal.value)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// External Links Box Component
interface ExternalLinksBoxProps {
  countryName: string;
  contents: any[];
  labels: any;
  lang: string;
}

function ExternalLinksBox({ countryName, contents, labels, lang }: ExternalLinksBoxProps) {
  const externalLinksContent = getContentByType(contents, 'external_links');
  
  return (
    <div className="border border-gray-300 bg-gray-50 text-sm">
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
        <h3 className="font-bold text-black">{labels.weblinks}</h3>
      </div>
      <div className="p-3">
        <ul className="space-y-1 text-xs">
          <li>
            <a 
              href={`https://${lang === 'de' ? 'de' : 'en'}.wikipedia.org/wiki/${encodeURIComponent(countryName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {countryName} {labels.inWikipedia}
            </a>
          </li>
          <li>
            <a 
              href={`https://www.google.com/maps/search/${encodeURIComponent(countryName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {countryName} {labels.atGoogleMaps}
            </a>
          </li>
          <li>
            <a 
              href={`https://www.cia.gov/the-world-factbook/countries/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {labels.ciaFactbook}
            </a>
          </li>
          {externalLinksContent && (
            <li className="pt-2 border-t border-gray-200 mt-2">
              <div className="text-gray-700 text-xs">
                {processWikipediaContent(externalLinksContent.content).split('\n').slice(0, 3).map((link, index) => (
                  <div key={index} className="mb-1">
                    <a 
                      href={link.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {labels.additionalSource} {index + 1}
                    </a>
                  </div>
                ))}
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Literature Box Component
interface LiteratureBoxProps {
  contents: any[];
  labels: any;
}

function LiteratureBox({ contents, labels }: LiteratureBoxProps) {
  const literatureContent = getContentByType(contents, 'literature');
  
  if (!literatureContent) return null;

  // Process HTML content in literature
  const processedContent = isHTMLContent(literatureContent.content) 
    ? processWikipediaContent(literatureContent.content)
    : literatureContent.content;

  // Further clean up literature-specific HTML artifacts
  const cleanedContent = processedContent
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return (
    <div className="border border-gray-300 bg-gray-50 text-sm">
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
        <h3 className="font-bold text-black">{labels.literature}</h3>
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-700 leading-relaxed">
          {cleanedContent.split(/[.!?]\s+/).slice(0, 5).map((item, index) => {
            const trimmedItem = item.trim();
            if (trimmedItem.length < 10) return null;
            
            return (
              <div key={index} className="mb-2">
                • {trimmedItem}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Additional Facts Box Component
interface AdditionalFactsBoxProps {
  facts: any[];
  labels: any;
}

function AdditionalFactsBox({ facts, labels }: AdditionalFactsBoxProps) {
  const additionalFacts = facts.filter(fact => 
    !['population', 'area', 'capital', 'currency', 'language', 'gdp', 'latitude', 'longitude'].includes(fact.key)
  );

  if (additionalFacts.length === 0) return null;

  return (
    <div className="border border-gray-300 bg-gray-50 text-sm">
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
        <h3 className="font-bold text-black">{labels.additionalInfo}</h3>
      </div>
      <div className="p-3">
        <table className="w-full text-xs">
          <tbody>
            {additionalFacts.map((fact, index) => (
              <tr key={fact.id} className={index < additionalFacts.length - 1 ? "border-b border-gray-200" : ""}>
                <td className="py-1 pr-2 text-gray-700 font-medium capitalize">{fact.key}:</td>
                <td className="py-1 text-black">
                  {fact.value} {fact.unit && <span className="text-gray-500">{fact.unit}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Wikipedia-style Loading Skeleton
function WikipediaSkeleton() {
  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
      </div>

      {/* 3-Column Layout Skeleton */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar Skeleton */}
        <aside className="col-span-12 lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="col-span-12 lg:col-span-7">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-lg p-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2 mb-3"></div>
              <div className="w-32 h-20 bg-gray-200 rounded animate-pulse mx-auto mb-3"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
