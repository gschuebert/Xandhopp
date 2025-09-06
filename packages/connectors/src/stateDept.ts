import { z } from "zod";
import { httpGetJson } from "./http.js";

// US State Department Travel Advisory Schema
const TravelAdvisorySchema = z.object({
  CountryCode: z.string(),
  CountryName: z.string(),
  TravelAdvisoryLevel: z.string(),
  TravelAdvisoryHeadlineText: z.string(),
  TravelAdvisoryURL: z.string(),
  NotifiedDate: z.string().optional(),
  LastUpdatedDate: z.string().optional(),
  TravelAdvisoryText: z.string().optional(),
});

// Support both object with data array and direct array response
const StateDeptResponseSchema = z.union([
  z.object({
    data: z.array(TravelAdvisorySchema),
    success: z.boolean().optional(),
    message: z.string().optional(),
  }),
  z.array(TravelAdvisorySchema), // Direct array response
]);

export type TravelAdvisory = z.infer<typeof TravelAdvisorySchema>;
export type StateDeptResponse = z.infer<typeof StateDeptResponseSchema>;

/**
 * Normalized advisory data for ClickHouse
 */
export interface NormalizedAdvisory {
  country_iso2: string;
  source: string;
  level: number;
  headline: string;
  url: string;
  published_at: string; // ISO datetime string
  payload: Record<string, any>;
}

/**
 * Parse travel advisory level from text
 */
function parseAdvisoryLevel(levelText: string): number {
  // Extract number from strings like "Level 2: Exercise Increased Caution"
  const match = levelText.match(/Level\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // Fallback mapping for common phrases
  const lowerText = levelText.toLowerCase();
  if (lowerText.includes("normal precautions") || lowerText.includes("level 1")) return 1;
  if (lowerText.includes("increased caution") || lowerText.includes("level 2")) return 2;
  if (lowerText.includes("reconsider travel") || lowerText.includes("level 3")) return 3;
  if (lowerText.includes("do not travel") || lowerText.includes("level 4")) return 4;
  
  return 0; // Unknown level
}

/**
 * Convert country name to ISO2 code (best effort mapping)
 */
function countryNameToISO2(countryName: string): string {
  // This is a simplified mapping - in production, use a comprehensive country database
  const mapping: Record<string, string> = {
    "Germany": "DE",
    "Spain": "ES",
    "Portugal": "PT",
    "United States": "US",
    "United Kingdom": "GB",
    "France": "FR",
    "Italy": "IT",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Austria": "AT",
    "Switzerland": "CH",
    "Poland": "PL",
    "Czech Republic": "CZ",
    "Hungary": "HU",
    "Croatia": "HR",
    "Greece": "GR",
    "Cyprus": "CY",
    "Malta": "MT",
    "Estonia": "EE",
    "Latvia": "LV",
    "Lithuania": "LT",
    "Slovakia": "SK",
    "Slovenia": "SI",
    "Bulgaria": "BG",
    "Romania": "RO",
    "Ireland": "IE",
    "Luxembourg": "LU",
    "Denmark": "DK",
    "Sweden": "SE",
    "Finland": "FI",
    "Canada": "CA",
    "Australia": "AU",
    "New Zealand": "NZ",
    "Japan": "JP",
    "South Korea": "KR",
    "Singapore": "SG",
    "Hong Kong": "HK",
    "Taiwan": "TW",
    "Thailand": "TH",
    "Malaysia": "MY",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Vietnam": "VN",
    "India": "IN",
    "China": "CN",
    "Brazil": "BR",
    "Mexico": "MX",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Peru": "PE",
    "Uruguay": "UY",
    "Paraguay": "PY",
    "Ecuador": "EC",
    "Bolivia": "BO",
    "Venezuela": "VE",
    "South Africa": "ZA",
    "Egypt": "EG",
    "Morocco": "MA",
    "Tunisia": "TN",
    "Turkey": "TR",
    "Israel": "IL",
    "Jordan": "JO",
    "Lebanon": "LB",
    "UAE": "AE",
    "Qatar": "QA",
    "Saudi Arabia": "SA",
    "Kuwait": "KW",
    "Bahrain": "BH",
    "Oman": "OM",
    "Russia": "RU",
    "Ukraine": "UA",
    "Belarus": "BY",
    "Moldova": "MD",
    "Georgia": "GE",
    "Armenia": "AM",
    "Azerbaijan": "AZ",
    "Kazakhstan": "KZ",
    "Uzbekistan": "UZ",
    "Kyrgyzstan": "KG",
    "Tajikistan": "TJ",
    "Turkmenistan": "TM",
    "Mongolia": "MN",
    "North Korea": "KP",
  };
  
  return mapping[countryName] || countryName.substring(0, 2).toUpperCase();
}

/**
 * Fetch US State Department travel advisories
 */
export async function fetchUSTravelAdvisories(): Promise<NormalizedAdvisory[]> {
  const url = "https://cadataapi.state.gov/api/TravelAdvisories";
  
  try {
    const response = await httpGetJson<StateDeptResponse>(url);
    
    if (!response.data || response.status !== 200) {
      console.warn(`US State Dept API returned status ${response.status}`);
      return [];
    }

    const validatedData = StateDeptResponseSchema.parse(response.data);
    
    // Handle both response formats: object with data array or direct array
    const advisories = Array.isArray(validatedData) ? validatedData : validatedData.data;
    
    if (!advisories || advisories.length === 0) {
      console.info("No travel advisories available from US State Department");
      return [];
    }

    return advisories.map((advisory) => {
      const iso2 = advisory.CountryCode?.toUpperCase() || countryNameToISO2(advisory.CountryName);
      const level = parseAdvisoryLevel(advisory.TravelAdvisoryLevel);
      const publishedDate = advisory.NotifiedDate || advisory.LastUpdatedDate || new Date().toISOString();

      return {
        country_iso2: iso2,
        source: "us_state_dept",
        level,
        headline: advisory.TravelAdvisoryHeadlineText || advisory.TravelAdvisoryLevel,
        url: advisory.TravelAdvisoryURL || "",
        published_at: publishedDate,
        payload: {
          country_name: advisory.CountryName,
          level_text: advisory.TravelAdvisoryLevel,
          advisory_text: advisory.TravelAdvisoryText,
          last_updated: advisory.LastUpdatedDate,
          notified_date: advisory.NotifiedDate,
        },
      };
    });
  } catch (error) {
    console.error("Failed to fetch US State Department travel advisories:", error);
    return [];
  }
}

/**
 * Fetch travel advisory for a specific country
 */
export async function fetchUSTravelAdvisory(iso2: string): Promise<NormalizedAdvisory | null> {
  const advisories = await fetchUSTravelAdvisories();
  return advisories.find((advisory) => advisory.country_iso2 === iso2.toUpperCase()) || null;
}
