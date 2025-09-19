import type { Metadata } from "next";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { getContent, type Locale } from "../../../../lib/i18n";
import CountryFilters from "./CountryFilters";
import { CountryDetailWikipedia } from "../../../../components/countries/CountryDetailWikipedia";
import { CountryHero } from "../../../../components/countries/CountryHero";

type Fact = { key: string; value: string; unit?: string | null };
type Content = { content_key: string; content_type?: string; content: string };

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } }); // ISR 1h
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return res.json();
}

function formatCountryNameFromSlug(slug: string): string {
  // Spezielle Behandlung für bekannte problematische Slugs
  const specialCases: Record<string, string> = {
    'democratic_republic_of_the_congo': 'Democratic Republic of the Congo',
    'democratic-republic-of-the-congo': 'Democratic Republic of the Congo',
    'republic_of_the_congo': 'Republic of the Congo',
    'republic-of-the-congo': 'Republic of the Congo',
    'united_states': 'United States',
    'united-states': 'United States',
    'united_kingdom': 'United Kingdom',
    'united-kingdom': 'United Kingdom',
    'new_zealand': 'New Zealand',
    'new-zealand': 'New Zealand',
    'south_africa': 'South Africa',
    'south-africa': 'South Africa',
    'north_korea': 'North Korea',
    'north-korea': 'North Korea',
    'south_korea': 'South Korea',
    'south-korea': 'South Korea',
    'costa_rica': 'Costa Rica',
    'costa-rica': 'Costa Rica',
    'el_salvador': 'El Salvador',
    'el-salvador': 'El Salvador',
    'sri_lanka': 'Sri Lanka',
    'sri-lanka': 'Sri Lanka',
    'saudi_arabia': 'Saudi Arabia',
    'saudi-arabia': 'Saudi Arabia',
    'united_arab_emirates': 'United Arab Emirates',
    'united-arab-emirates': 'United Arab Emirates',
    'czech_republic': 'Czech Republic',
    'czech-republic': 'Czech Republic',
    'papua_new_guinea': 'Papua New Guinea',
    'papua-new-guinea': 'Papua New Guinea',
    'burkina_faso': 'Burkina Faso',
    'burkina-faso': 'Burkina Faso',
    'cape_verde': 'Cape Verde',
    'cape-verde': 'Cape Verde',
    'central_african_republic': 'Central African Republic',
    'central-african-republic': 'Central African Republic',
    'equatorial_guinea': 'Equatorial Guinea',
    'equatorial-guinea': 'Equatorial Guinea',
    'ivory_coast': 'Ivory Coast',
    'ivory-coast': 'Ivory Coast',
    'sierra_leone': 'Sierra Leone',
    'sierra-leone': 'Sierra Leone',
    'sao_tome_and_principe': 'São Tomé and Príncipe',
    'sao-tome-and-principe': 'São Tomé and Príncipe'
  };

  // Prüfe zuerst spezielle Fälle
  if (specialCases[slug]) {
    return specialCases[slug];
  }

  // Fallback: Ersetze Bindestriche/Unterstriche und kapitalisiere
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string; locale: string };
  searchParams: { lang?: string };
}): Promise<Metadata> {
  const lang = searchParams.lang || "de";
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';
  
  try {
    const country = await getJSON<any>(`${base}/api/countries/${params.slug}?lang=${lang}`);
    return {
      title: `${country?.name_en || params.slug} — XNTOP`,
      description: country?.overview?.slice(0, 150) || `Information about ${params.slug}`,
    };
  } catch (error) {
    return {
      title: `${params.slug} — XNTOP`,
      description: `Information about ${params.slug}`,
    };
  }
}

interface CountryDetailPageProps {
  params: {
    slug: string;
    locale: Locale;
  };
  searchParams: {
    lang?: string;
  };
}

export default async function CountryDetailPage({
  params,
  searchParams,
}: CountryDetailPageProps) {
  const content = getContent(params.locale);
  const lang = searchParams.lang || "de";
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';

  let country: any = null;
  let contents: Content[] = [];
  let facts: Fact[] = [];

  try {
    // First, get the country from the list
    const allCountriesResponse = await getJSON<any>(`${base}/api/countries?lang=${lang}`);
    const allCountries = allCountriesResponse.countries || [];
    const foundCountry = allCountries.find((c: any) => 
      (c.slug_en || c.slug_de) === params.slug
    );

    if (foundCountry) {
      country = {
        name_en: foundCountry.name_en,
        continent: foundCountry.continent,
        iso_code: foundCountry.iso_code,
        slug_en: foundCountry.slug_en,
        slug_de: foundCountry.slug_de
      };
    }

    // Try to get content and facts (these endpoints might not exist yet)
    try {
      [contents, facts] = await Promise.all([
        getJSON<Content[]>(`${base}/api/countries/${params.slug}/content?lang=${lang}`),
        getJSON<Fact[]>(`${base}/api/countries/${params.slug}/facts?lang=${lang}`),
      ]);
    } catch (contentError) {
      // Content endpoints not available yet, use fallback
      contents = [
        {
          content_key: 'overview',
          content_type: 'overview',
          content: `This is placeholder content for ${country?.name_en || params.slug}. The content will be populated from Wikipedia data once the import is complete.`
        }
      ];
      facts = [
        { key: 'population', value: 'Data will be imported from Wikipedia', unit: 'people' },
        { key: 'area', value: 'Data will be imported from Wikipedia', unit: 'km²' }
      ];
    }
  } catch (error) {
    // Complete fallback: create dummy data
    country = {
      name_en: params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      continent: 'Unknown'
    };
    contents = [
      {
        content_key: 'overview',
        content_type: 'overview',
        content: `This is placeholder content for ${params.slug}. The content will be populated from Wikipedia data.`
      }
    ];
    facts = [
      { key: 'population', value: 'Unknown', unit: 'people' },
      { key: 'area', value: 'Unknown', unit: 'km²' }
    ];
  }

  // Mappe Inhalte in Abschnitte
  const sectionsOrder = [
    "overview",
    "visa",
    "cost_of_living",
    "economy",
    "demography",
    "politics",
    "culture",
    "geography"
  ];

  const byKey: Record<string, string> = {};
  contents.forEach((c) => {
    const key = (c.content_key || c.content_type || "overview").toLowerCase();
    // Nimm den ersten Treffer bevorzugt
    if (!byKey[key]) byKey[key] = c.content;
  });

  const availableSections = sectionsOrder.filter((k) => byKey[k]);
  const displayName: Record<string, string> = {
    overview: "Überblick",
    visa: "Visa",
    cost_of_living: "Lebenshaltungskosten",
    economy: "Wirtschaft",
    demography: "Demografie",
    politics: "Politik",
    culture: "Kultur",
    geography: "Geografie",
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Country Images */}
      <CountryHero 
        slug={params.slug}
        countryName={country?.name_en || formatCountryNameFromSlug(params.slug)}
        continent={country?.continent && country.continent !== 'Unknown' ? country.continent : undefined}
        lang={lang}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Country Filters */}
        <CountryFilters 
          locale={params.locale}
          currentSlug={params.slug}
          currentLang={lang}
        />

        {/* Wikipedia-style Country Detail Component */}
        <CountryDetailWikipedia 
          slug={params.slug}
          locale={params.locale}
        />
      </main>

    </div>
  );
}
