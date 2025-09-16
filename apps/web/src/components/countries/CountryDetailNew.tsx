'use client';

import { useState, useEffect } from 'react';
import { countriesAPI, type CountryDetailResponse, type SupportedLanguage, getContentByType, getFactByKey, formatCountryName } from '../../lib/countries-api';

interface CountryDetailNewProps {
  slug: string;
  locale: SupportedLanguage;
  onBack?: () => void;
}

export function CountryDetailNew({ slug, locale, onBack }: CountryDetailNewProps) {
  const [data, setData] = useState<CountryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const countryData = await countriesAPI.getCountryFullData(slug, locale);
        setData(countryData);
      } catch (err) {
        console.error('Error loading country data:', err);
        setError('Failed to load country data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCountryData();
  }, [slug, locale]);

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
            Zurück zur Übersicht
          </button>
        )}
      </div>
    );
  }

  const { country, contents, facts, media } = data;
  const countryName = formatCountryName(country, locale);

  // Inhalte nach Typ organisieren
  const overviewContent = getContentByType(contents, 'overview');
  const cultureContent = getContentByType(contents, 'culture');
  const economyContent = getContentByType(contents, 'economy');
  const historyContent = getContentByType(contents, 'history');

  // Fakten extrahieren
  const population = getFactByKey(facts, 'population');
  const area = getFactByKey(facts, 'area');
  const capital = getFactByKey(facts, 'capital');
  const currency = getFactByKey(facts, 'currency');
  const language = getFactByKey(facts, 'language');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Zurück-Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-xandhopp-blue transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Übersicht
        </button>
      )}

      {/* Header mit Flagge und Basis-Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Flagge */}
          <div className="flex-shrink-0">
            <div className="w-32 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded border flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {country.iso_code}
              </span>
            </div>
          </div>

          {/* Basis-Informationen */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {countryName}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {country.continent}
            </p>

            {/* Infobox */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capital && (
                <div>
                  <span className="font-semibold text-gray-700">Hauptstadt:</span>
                  <span className="ml-2 text-gray-600">{capital.value}</span>
                </div>
              )}
              {population && (
                <div>
                  <span className="font-semibold text-gray-700">Bevölkerung:</span>
                  <span className="ml-2 text-gray-600">{population.value} {population.unit}</span>
                </div>
              )}
              {area && (
                <div>
                  <span className="font-semibold text-gray-700">Fläche:</span>
                  <span className="ml-2 text-gray-600">{area.value} {area.unit}</span>
                </div>
              )}
              {currency && (
                <div>
                  <span className="font-semibold text-gray-700">Währung:</span>
                  <span className="ml-2 text-gray-600">{currency.value}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hauptinhalt (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Überblick */}
          {overviewContent && (
            <ContentSection
              title="Überblick"
              content={overviewContent.content}
              sourceUrl={overviewContent.source_url}
            />
          )}

          {/* Kultur */}
          {cultureContent && (
            <ContentSection
              title="Kultur"
              content={cultureContent.content}
              sourceUrl={cultureContent.source_url}
            />
          )}

          {/* Wirtschaft */}
          {economyContent && (
            <ContentSection
              title="Wirtschaft"
              content={economyContent.content}
              sourceUrl={economyContent.source_url}
            />
          )}

          {/* Geschichte */}
          {historyContent && (
            <ContentSection
              title="Geschichte"
              content={historyContent.content}
              sourceUrl={historyContent.source_url}
            />
          )}
        </div>

        {/* Seitenleiste (1/3) */}
        <div className="space-y-6">
          {/* Infobox */}
          <Infobox facts={facts} />

          {/* Medien */}
          {media.length > 0 && (
            <MediaSection media={media} />
          )}

          {/* Weitere Fakten */}
          <AdditionalFacts facts={facts} />
        </div>
      </div>
    </div>
  );
}

// Inhalts-Sektion
interface ContentSectionProps {
  title: string;
  content: string;
  sourceUrl?: string;
}

function ContentSection({ title, content, sourceUrl }: ContentSectionProps) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>
      {sourceUrl && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Quelle: Wikipedia
          </a>
        </div>
      )}
    </section>
  );
}

// Infobox
interface InfoboxProps {
  facts: any[];
}

function Infobox({ facts }: InfoboxProps) {
  const importantFacts = facts.filter(fact => 
    ['population', 'area', 'capital', 'currency', 'language', 'gdp'].includes(fact.key)
  );

  if (importantFacts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-900 mb-3 text-lg">Infobox</h3>
      <div className="space-y-2">
        {importantFacts.map((fact) => (
          <div key={fact.id} className="flex justify-between">
            <span className="text-gray-600 capitalize">{fact.key}:</span>
            <span className="font-medium text-gray-900">
              {fact.value} {fact.unit && <span className="text-gray-500">{fact.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Medien-Sektion
interface MediaSectionProps {
  media: any[];
}

function MediaSection({ media }: MediaSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-900 mb-3 text-lg">Bilder</h3>
      <div className="space-y-3">
        {media.slice(0, 3).map((item) => (
          <div key={item.id} className="relative">
            <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
              <span className="text-gray-500 text-sm">Bild: {item.title}</span>
            </div>
            {item.attribution && (
              <p className="text-xs text-gray-500 mt-1">{item.attribution}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Weitere Fakten
interface AdditionalFactsProps {
  facts: any[];
}

function AdditionalFacts({ facts }: AdditionalFactsProps) {
  const additionalFacts = facts.filter(fact => 
    !['population', 'area', 'capital', 'currency', 'language', 'gdp'].includes(fact.key)
  );

  if (additionalFacts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-900 mb-3 text-lg">Weitere Informationen</h3>
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2 mb-3"></div>
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
