import type { Metadata } from "next";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { getContent, type Locale } from "../../../../lib/i18n";
import CountryFilters from "./CountryFilters";
import { CountryDetailWikipedia } from "../../../../components/countries/CountryDetailWikipedia";

type Fact = { key: string; value: string; unit?: string | null };
type Content = { content_key: string; content_type?: string; content: string };

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } }); // ISR 1h
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return res.json();
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

      <Footer locale={params.locale} />
    </div>
  );
}
