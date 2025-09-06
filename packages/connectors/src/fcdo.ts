import { z } from "zod";
import { httpGetJson } from "./http.js";

// FCDO (UK Foreign Office) API Schema
const FCDODetailsSchema = z.object({
  reviewed_at: z.string().optional(),
  updated_at: z.string().optional(),
  change_history: z.array(z.object({
    note: z.string(),
    public_timestamp: z.string(),
  })).optional(),
});

const FCDOResponseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  public_updated_at: z.string().optional(),
  updated_at: z.string().optional(), // Alternative field
  details: FCDODetailsSchema.optional(),
  links: z.object({
    self: z.string().optional(),
  }).optional(),
  document_type: z.string().optional(),
  schema_name: z.string().optional(),
  // Add more optional fields that might be present
  summary: z.string().optional(),
  base_path: z.string().optional(),
  locale: z.string().optional(),
}).passthrough(); // Allow additional unknown fields

export type FCDOResponse = z.infer<typeof FCDOResponseSchema>;

/**
 * Normalized FCDO advisory data
 */
export interface NormalizedFCDOAdvisory {
  country_iso2: string;
  source: string;
  level: number;
  headline: string;
  url: string;
  published_at: string;
  payload: Record<string, any>;
}

/**
 * Map country path slugs to ISO2 codes
 */
const FCDO_COUNTRY_MAPPING: Record<string, string> = {
  "germany": "DE",
  "spain": "ES",
  "portugal": "PT",
  "france": "FR",
  "italy": "IT",
  "netherlands": "NL",
  "belgium": "BE",
  "austria": "AT",
  "switzerland": "CH",
  "poland": "PL",
  "czech-republic": "CZ",
  "hungary": "HU",
  "croatia": "HR",
  "greece": "GR",
  "cyprus": "CY",
  "malta": "MT",
  "estonia": "EE",
  "latvia": "LV",
  "lithuania": "LT",
  "slovakia": "SK",
  "slovenia": "SI",
  "bulgaria": "BG",
  "romania": "RO",
  "ireland": "IE",
  "luxembourg": "LU",
  "denmark": "DK",
  "sweden": "SE",
  "finland": "FI",
  "usa": "US",
  "united-states": "US",
  "canada": "CA",
  "australia": "AU",
  "new-zealand": "NZ",
  "japan": "JP",
  "south-korea": "KR",
  "singapore": "SG",
  "hong-kong": "HK",
  "taiwan": "TW",
  "thailand": "TH",
  "malaysia": "MY",
  "indonesia": "ID",
  "philippines": "PH",
  "vietnam": "VN",
  "india": "IN",
  "china": "CN",
  "brazil": "BR",
  "mexico": "MX",
  "argentina": "AR",
  "chile": "CL",
  "colombia": "CO",
  "peru": "PE",
  "uruguay": "UY",
  "paraguay": "PY",
  "ecuador": "EC",
  "bolivia": "BO",
  "venezuela": "VE",
  "south-africa": "ZA",
  "egypt": "EG",
  "morocco": "MA",
  "tunisia": "TN",
  "turkey": "TR",
  "israel": "IL",
  "jordan": "JO",
  "lebanon": "LB",
  "uae": "AE",
  "united-arab-emirates": "AE",
  "qatar": "QA",
  "saudi-arabia": "SA",
  "kuwait": "KW",
  "bahrain": "BH",
  "oman": "OM",
  "russia": "RU",
  "ukraine": "UA",
  "belarus": "BY",
  "moldova": "MD",
  "georgia": "GE",
  "armenia": "AM",
  "azerbaijan": "AZ",
  "kazakhstan": "KZ",
  "uzbekistan": "UZ",
  "kyrgyzstan": "KG",
  "tajikistan": "TJ",
  "turkmenistan": "TM",
  "mongolia": "MN",
  "north-korea": "KP",
};

/**
 * Parse FCDO advisory level from title and description
 */
function parseFCDOLevel(title: string, description?: string): number {
  const text = `${title} ${description || ""}`.toLowerCase();
  
  if (text.includes("do not travel") || text.includes("avoid all travel")) return 4;
  if (text.includes("avoid all but essential travel") || text.includes("reconsider")) return 3;
  if (text.includes("see our travel advice") || text.includes("check latest")) return 2;
  
  return 1; // Default to normal precautions
}

/**
 * Fetch FCDO travel advice for a specific country
 */
export async function fetchFCDOCountryAdvice(pathSlug: string): Promise<NormalizedFCDOAdvisory | null> {
  const url = `https://www.gov.uk/api/content/foreign-travel-advice/${pathSlug}`;
  
  try {
    const response = await httpGetJson<FCDOResponse>(url);
    
    if (!response.data || response.status !== 200) {
      console.warn(`FCDO API returned status ${response.status} for ${pathSlug}`);
      return null;
    }

    // Try to parse with schema validation, but handle errors gracefully
    let data: FCDOResponse;
    try {
      data = FCDOResponseSchema.parse(response.data);
    } catch (schemaError) {
      console.warn(`FCDO API schema validation failed for ${pathSlug}:`, schemaError);
      // Try to extract basic information even if schema doesn't match
      const rawData = response.data as any;
      data = {
        title: rawData.title || `Travel advice for ${pathSlug}`,
        description: rawData.description || rawData.summary || "",
        public_updated_at: rawData.public_updated_at || rawData.updated_at || new Date().toISOString(),
        details: rawData.details,
        links: rawData.links,
        document_type: rawData.document_type,
        schema_name: rawData.schema_name,
      };
    }
    const iso2 = FCDO_COUNTRY_MAPPING[pathSlug] || pathSlug.substring(0, 2).toUpperCase();
    const level = parseFCDOLevel(data.title, data.description);
    const publishedDate = data.public_updated_at || data.details?.reviewed_at || new Date().toISOString();

    return {
      country_iso2: iso2,
      source: "fcdo_uk",
      level,
      headline: data.title,
      url: `https://www.gov.uk/foreign-travel-advice/${pathSlug}`,
      published_at: publishedDate,
      payload: {
        description: data.description,
        document_type: data.document_type,
        schema_name: data.schema_name,
        details: data.details,
        change_history: data.details?.change_history,
        updated_at: data.details?.updated_at,
        reviewed_at: data.details?.reviewed_at,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch FCDO advice for ${pathSlug}:`, error);
    return null;
  }
}

/**
 * Fetch FCDO advice for multiple countries
 */
export async function fetchFCDOMultipleCountries(pathSlugs: string[]): Promise<NormalizedFCDOAdvisory[]> {
  const results = await Promise.allSettled(
    pathSlugs.map((slug) => fetchFCDOCountryAdvice(slug))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<NormalizedFCDOAdvisory | null> =>
      result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value!);
}

/**
 * Common European countries for FCDO monitoring
 */
export const FCDO_EU_COUNTRIES = [
  "germany",
  "spain", 
  "portugal",
  "france",
  "italy",
  "netherlands",
  "belgium",
  "austria",
  "switzerland",
  "poland",
  "czech-republic",
  "hungary",
  "croatia",
  "greece",
  "cyprus",
  "malta",
  "estonia",
  "latvia",
  "lithuania",
  "slovakia",
  "slovenia",
  "bulgaria",
  "romania",
  "ireland",
  "luxembourg",
  "denmark",
  "sweden",
  "finland",
] as const;

/**
 * Fetch FCDO advice for all EU countries
 */
export async function fetchFCDOEUCountries(): Promise<NormalizedFCDOAdvisory[]> {
  return fetchFCDOMultipleCountries([...FCDO_EU_COUNTRIES]);
}
