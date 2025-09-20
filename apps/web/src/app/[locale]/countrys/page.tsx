"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getContent, type Locale } from "../../../lib/i18n";
import { useCountryMedia } from "../../../hooks/useCountryMedia";

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

// Function to translate continent names - supports all languages
const translateContinent = (continent: string, locale: Locale): string => {
  // First try to get from the existing content system
  const content = getContent(locale);
  const continentMapping: Record<string, keyof typeof content.continents> = {
    'Asia': 'asia',
    'Europe': 'europe',
    'North America': 'northAmerica',
    'South America': 'southAmerica',
    'Africa': 'africa',
    'Oceania': 'oceania',
    'Antarctica': 'antarctica'
  };
  
  const key = continentMapping[continent];
  if (key && content.continents[key]) {
    return content.continents[key];
  }

  // Fallback translations for all supported languages
  const fallbackTranslations: Record<string, Record<Locale, string>> = {
    'Asia': {
      en: 'Asia',
      de: 'Asien',
      es: 'Asia',
      zh: '亚洲',
      hi: 'एशिया'
    },
    'Europe': {
      en: 'Europe',
      de: 'Europa',
      es: 'Europa',
      zh: '欧洲',
      hi: 'यूरोप'
    },
    'North America': {
      en: 'North America',
      de: 'Nordamerika',
      es: 'América del Norte',
      zh: '北美洲',
      hi: 'उत्तरी अमेरिका'
    },
    'South America': {
      en: 'South America',
      de: 'Südamerika',
      es: 'América del Sur',
      zh: '南美洲',
      hi: 'दक्षिण अमेरिका'
    },
    'Africa': {
      en: 'Africa',
      de: 'Afrika',
      es: 'África',
      zh: '非洲',
      hi: 'अफ्रीका'
    },
    'Oceania': {
      en: 'Oceania',
      de: 'Ozeanien',
      es: 'Oceanía',
      zh: '大洋洲',
      hi: 'ओशिआनिया'
    },
    'Antarctica': {
      en: 'Antarctica',
      de: 'Antarktis',
      es: 'Antártida',
      zh: '南极洲',
      hi: 'अंटार्कटिका'
    }
  };

  return fallbackTranslations[continent]?.[locale] || continent;
};

// Function to translate country names based on locale
const translateCountry = (country: Country, locale: Locale): string => {
  // Try to get localized name from the country data first
  if (locale === 'de' && country.slug_de) {
    return country.slug_de;
  }
  
  // German country name translations
  if (locale === 'de') {
    const germanCountryNames: Record<string, string> = {
      'Germany': 'Deutschland',
      'France': 'Frankreich',
      'Italy': 'Italien',
      'Spain': 'Spanien',
      'United Kingdom': 'Vereinigtes Königreich',
      'Netherlands': 'Niederlande',
      'Belgium': 'Belgien',
      'Switzerland': 'Schweiz',
      'Austria': 'Österreich',
      'Poland': 'Polen',
      'Czech Republic': 'Tschechische Republik',
      'Hungary': 'Ungarn',
      'Portugal': 'Portugal',
      'Greece': 'Griechenland',
      'Sweden': 'Schweden',
      'Norway': 'Norwegen',
      'Denmark': 'Dänemark',
      'Finland': 'Finnland',
      'Ireland': 'Irland',
      'Croatia': 'Kroatien',
      'Slovenia': 'Slowenien',
      'Slovakia': 'Slowakei',
      'Estonia': 'Estland',
      'Latvia': 'Lettland',
      'Lithuania': 'Litauen',
      'Luxembourg': 'Luxemburg',
      'Malta': 'Malta',
      'Cyprus': 'Zypern',
      'Bulgaria': 'Bulgarien',
      'Romania': 'Rumänien',
      'United States': 'Vereinigte Staaten',
      'Canada': 'Kanada',
      'Mexico': 'Mexiko',
      'Brazil': 'Brasilien',
      'Argentina': 'Argentinien',
      'Chile': 'Chile',
      'Australia': 'Australien',
      'New Zealand': 'Neuseeland',
      'Japan': 'Japan',
      'China': 'China',
      'India': 'Indien',
      'Russia': 'Russland',
      'South Africa': 'Südafrika',
      'Egypt': 'Ägypten',
      'Nigeria': 'Nigeria',
      'Algeria': 'Algerien',
      'Angola': 'Angola',
      'Benin': 'Benin',
      'Botswana': 'Botswana',
      'Burkina Faso': 'Burkina Faso',
      'Burundi': 'Burundi',
      'Cameroon': 'Kamerun',
      'Cape Verde': 'Kap Verde',
      'Chad': 'Tschad',
      'Comoros': 'Komoren',
      'Democratic Republic of the Congo': 'Demokratische Republik Kongo',
      'Republic of the Congo': 'Republik Kongo',
      'Djibouti': 'Dschibuti',
      'Equatorial Guinea': 'Äquatorialguinea',
      'Eritrea': 'Eritrea',
      'Eswatini': 'Eswatini',
      'Ethiopia': 'Äthiopien',
      'Gabon': 'Gabun',
      'Gambia': 'Gambia',
      'Ghana': 'Ghana',
      'Guinea': 'Guinea',
      'Guinea-Bissau': 'Guinea-Bissau',
      'Ivory Coast': 'Elfenbeinküste',
      'Kenya': 'Kenia',
      'Lesotho': 'Lesotho',
      'Liberia': 'Liberia',
      'Libya': 'Libyen',
      'Madagascar': 'Madagaskar',
      'Malawi': 'Malawi',
      'Mali': 'Mali',
      'Mauritania': 'Mauretanien',
      'Mauritius': 'Mauritius',
      'Morocco': 'Marokko',
      'Mozambique': 'Mosambik',
      'Namibia': 'Namibia',
      'Niger': 'Niger',
      'Rwanda': 'Ruanda',
      'São Tomé and Príncipe': 'São Tomé und Príncipe',
      'Senegal': 'Senegal',
      'Seychelles': 'Seychellen',
      'Sierra Leone': 'Sierra Leone',
      'Somalia': 'Somalia',
      'South Sudan': 'Südsudan',
      'Sudan': 'Sudan',
      'Tanzania': 'Tansania',
      'Togo': 'Togo',
      'Tunisia': 'Tunesien',
      'Uganda': 'Uganda',
      'Zambia': 'Sambia',
      'Zimbabwe': 'Simbabwe',
      'Montenegro': 'Montenegro',
      // Additional countries from the screenshot
      'Dominican Republic': 'Dominikanische Republik',
      'East Timor': 'Osttimor',
      'Ecuador': 'Ecuador',
      'El Salvador': 'El Salvador',
      'Equatorial Guinea': 'Äquatorialguinea',
      'Eritrea': 'Eritrea',
      'Estonia': 'Estland',
      'Eswatini': 'Eswatini',
      'Ethiopia': 'Äthiopien',
      'Fiji': 'Fidschi',
      'Finland': 'Finnland',
      'France': 'Frankreich',
      'French Polynesia': 'Französisch-Polynesien',
      'Gabon': 'Gabun',
      'Gambia': 'Gambia',
      'Georgia': 'Georgien',
      'Germany': 'Deutschland',
      'Ghana': 'Ghana',
      'Greece': 'Griechenland'
    };
    
    return germanCountryNames[country.name_en] || country.name_en;
  }
  
  // Fallback to English name or slug
  return country.name_en || country.slug_en || 'Unknown';
};

// Function to get localized labels - automatically supports new languages
const getLocalizedLabels = (locale: Locale) => {
  const translations: Record<Locale, Record<string, string>> = {
    en: {
      continent: 'Continent',
      country: 'Country',
      allContinents: 'All continents',
      allCountries: 'All countries',
      selectContinentFirst: 'Select a continent and then a country to view details.',
      selectCountryFrom: 'Select a country from'
    },
    de: {
      continent: 'Kontinent',
      country: 'Land',
      allContinents: 'Alle Kontinente',
      allCountries: 'Alle Länder',
      selectContinentFirst: 'Wählen Sie einen Kontinent und dann ein Land aus, um Details anzuzeigen.',
      selectCountryFrom: 'Wählen Sie ein Land aus'
    },
    // Future languages can be added here automatically
    es: {
      continent: 'Continente',
      country: 'País',
      allContinents: 'Todos los continentes',
      allCountries: 'Todos los países',
      selectContinentFirst: 'Seleccione un continente y luego un país para ver los detalles.',
      selectCountryFrom: 'Seleccione un país de'
    },
    zh: {
      continent: '大洲',
      country: '国家',
      allContinents: '所有大洲',
      allCountries: '所有国家',
      selectContinentFirst: '选择一个大洲，然后选择一个国家以查看详细信息。',
      selectCountryFrom: '从以下选择一个国家'
    },
    hi: {
      continent: 'महाद्वीप',
      country: 'देश',
      allContinents: 'सभी महाद्वीप',
      allCountries: 'सभी देश',
      selectContinentFirst: 'विवरण देखने के लिए एक महाद्वीप और फिर एक देश चुनें।',
      selectCountryFrom: 'से एक देश चुनें'
    }
  };

  const t = translations[locale] || translations.en;
  
  return {
    continent: t.continent,
    country: t.country,
    allContinents: t.allContinents,
    allCountries: t.allCountries,
    selectContinentFirst: t.selectContinentFirst,
    selectCountryFrom: (continent: string) => 
      `${t.selectCountryFrom} ${translateContinent(continent, locale)} ${locale === 'en' ? 'to view details.' : locale === 'de' ? 'aus, um Details anzuzeigen.' : locale === 'es' ? 'para ver los detalles.' : locale === 'zh' ? '以查看详细信息。' : locale === 'hi' ? 'विवरण देखने के लिए।' : 'to view details.'}`
  };
};

interface CountriesPageProps {
  params: {
    locale: Locale;
  };
}

export default function CountriesPage({ params }: CountriesPageProps) {
  const locale = params.locale || 'en';
  const content = getContent(locale);
  const labels = getLocalizedLabels(locale);
  const router = useRouter();
  const sp = useSearchParams();

  const [lang, setLang] = useState(sp?.get("lang") || "de");
  const [continent, setContinent] = useState(sp?.get("continent") || "");
  const [countrySlug, setCountrySlug] = useState(sp?.get("country") || "");
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

  // Navigate directly to country details when a country is selected
  useEffect(() => {
    if (countrySlug && countrySlug !== "") {
      router.push(`/${locale}/countrys/${countrySlug}?lang=${lang}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countrySlug, locale, lang]);


  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">{content.teasers.countries.headline}</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {labels.continent}
            </label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={continent}
              onChange={(e) => {
                setContinent(e.target.value);
                setCountrySlug("");
              }}
            >
              <option value="">
                {labels.allContinents}
              </option>
              {continents.map((c) => (
                <option key={c} value={c}>
                  {translateContinent(c, locale)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {labels.country}
            </label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={countrySlug}
              onChange={(e) => setCountrySlug(e.target.value)}
            >
              <option value="">
                {labels.allCountries}
              </option>
              {countries
                .slice() // copy for safe sort
                .sort((a, b) => translateCountry(a, locale).localeCompare(translateCountry(b, locale)))
                .map((c) => {
                  const slug = (c.slug_en || c.slug_de || c.name_en).toLowerCase().replace(/\s+/g, "-");
                  return (
                    <option key={c.id} value={slug}>
                      {translateCountry(c, locale)}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Info Text */}
        {!loading && (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">
              {continent 
                ? labels.selectCountryFrom(continent)
                : labels.selectContinentFirst
              }
            </p>
          </div>
        )}
      </main>

    </div>
  );
}

