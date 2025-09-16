"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getContent, type Locale } from "../../../lib/i18n";

type Country = {
  id: number;
  iso_code: string;
  name_en: string;
  continent: string | null;
  slug_en: string | null;
  slug_de: string | null;
};

const LANGS = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
];

interface CountriesPageProps {
  params: {
    locale: Locale;
  };
}

export default function CountriesPage({ params }: CountriesPageProps) {
  const locale = params.locale || 'en';
  const content = getContent(locale);
  const router = useRouter();
  const sp = useSearchParams();

  const [lang, setLang] = useState(sp.get("lang") || "de");
  const [continent, setContinent] = useState(sp.get("continent") || "");
  const [countrySlug, setCountrySlug] = useState(sp.get("country") || "");
  const [loading, setLoading] = useState(true);

  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch all countries once to compute continents
  useEffect(() => {
    let abort = false;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082'}/api/countries`)
      .then((r) => r.json())
      .then((data: any) => {
        if (abort) return;
        const countriesData = data.countries || [];
        setAllCountries(countriesData);
        const conts = Array.from(
          new Set((countriesData.map((c: Country) => c.continent || "").filter(Boolean) as string[]))
        ).sort();
        setContinents(conts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      abort = true;
    };
  }, []);

  // Load countries by selected continent
  useEffect(() => {
    if (!continent) {
      setCountries(allCountries);
      return;
    }
    setCountries(allCountries.filter((c) => (c.continent || "") === continent));
  }, [continent, allCountries]);

  // Sync query params
  useEffect(() => {
    const urlParams = new URLSearchParams();
    if (lang) urlParams.set("lang", lang);
    if (continent) urlParams.set("continent", continent);
    if (countrySlug) urlParams.set("country", countrySlug);
    router.replace(`/${locale}/countrys?${urlParams.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, continent, countrySlug, locale]);

  const selectedCountry = useMemo(
    () => countries.find((c) => (c.slug_en || c.slug_de) === countrySlug),
    [countries, countrySlug]
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">{content.teasers.countries.headline}</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Continent</label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={continent}
              onChange={(e) => {
                setContinent(e.target.value);
                setCountrySlug("");
              }}
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
              onChange={(e) => setCountrySlug(e.target.value)}
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

        {/* Results */}
        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : (
          <>
            {selectedCountry ? (
              <CountryCard
                c={selectedCountry}
                lang={lang}
                locale={locale}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {countries
                  .slice()
                  .sort((a, b) => a.name_en.localeCompare(b.name_en))
                  .map((c) => (
                    <CountryCard key={c.id} c={c} lang={lang} locale={locale} />
                  ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer locale={locale} />
    </div>
  );
}

function CountryCard({ c, lang, locale }: { c: Country; lang: string; locale: string }) {
  const slug = (c.slug_en || c.slug_de || c.name_en).toLowerCase().replace(/\s+/g, "-");
  return (
    <a
      href={`/${locale}/countrys/${slug}?lang=${encodeURIComponent(lang)}`}
      className="block rounded border border-gray-200 hover:shadow-md transition p-4"
    >
      <div className="text-sm text-gray-500">{c.continent}</div>
      <div className="text-lg font-semibold">{c.name_en}</div>
      <div className="mt-2 text-sm text-blue-600">View details →</div>
    </a>
  );
}
