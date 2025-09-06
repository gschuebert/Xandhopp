import { z } from "zod";
import { httpGetJson, buildQueryParams } from "./http.js";

// World Bank API Response Schema
const WorldBankIndicatorSchema = z.object({
  indicator: z.object({
    id: z.string(),
    value: z.string(),
  }),
  country: z.object({
    id: z.string(),
    value: z.string(),
  }),
  countryiso3code: z.string(),
  date: z.string(),
  value: z.number().nullable(),
  unit: z.string().optional(),
  obs_status: z.string().optional(),
  decimal: z.number().optional(),
});

const WorldBankResponseSchema = z.tuple([
  z.object({
    page: z.number(),
    pages: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
  z.array(WorldBankIndicatorSchema).optional(),
]);

export type WorldBankIndicator = z.infer<typeof WorldBankIndicatorSchema>;
export type WorldBankResponse = z.infer<typeof WorldBankResponseSchema>;

/**
 * Normalized indicator data for ClickHouse
 */
export interface NormalizedIndicator {
  country_iso2: string;
  source: string;
  indicator_code: string;
  period: string; // YYYY-MM-DD format
  value: number | null;
  meta: Record<string, any>;
}

/**
 * Fetch World Bank indicators for a specific country
 * @param indicator World Bank indicator code (e.g., 'NY.GDP.PCAP.KD')
 * @param iso2 Country ISO2 code (e.g., 'DE')
 * @param since Start year (default: 2000)
 * @param until End year (default: current year + 1)
 */
export async function fetchWorldBankIndicator(
  indicator: string,
  iso2: string,
  since = 2000,
  until = new Date().getFullYear() + 1
): Promise<NormalizedIndicator[]> {
  const params = buildQueryParams({
    format: "json",
    per_page: 20000,
    date: `${since}:${until}`,
  });

  const url = `https://api.worldbank.org/v2/country/${iso2}/indicator/${indicator}?${params}`;
  
  try {
    const response = await httpGetJson<WorldBankResponse>(url);
    
    if (!response.data || response.status !== 200) {
      console.warn(`World Bank API returned status ${response.status} for ${iso2}/${indicator}`);
      return [];
    }

    const [metadata, data] = response.data;
    
    if (!data || data.length === 0) {
      console.info(`No data available for ${iso2}/${indicator}`);
      return [];
    }

    // Validate and normalize the data
    const validatedData = data.map((item) => WorldBankIndicatorSchema.parse(item));
    
    return validatedData.map((item) => ({
      country_iso2: item.country.id.toUpperCase(),
      source: "worldbank",
      indicator_code: item.indicator.id,
      period: `${item.date}-01-01`, // World Bank uses years, convert to date
      value: item.value,
      meta: {
        unit: item.unit,
        obs_status: item.obs_status,
        decimal: item.decimal,
        country_name: item.country.value,
        indicator_name: item.indicator.value,
      },
    }));
  } catch (error) {
    console.error(`Failed to fetch World Bank data for ${iso2}/${indicator}:`, error);
    return [];
  }
}

/**
 * Fetch multiple indicators for a country
 */
export async function fetchWorldBankIndicators(
  indicators: string[],
  iso2: string,
  since = 2000
): Promise<NormalizedIndicator[]> {
  const results = await Promise.allSettled(
    indicators.map((indicator) =>
      fetchWorldBankIndicator(indicator, iso2, since)
    )
  );

  return results
    .filter((result): result is PromiseFulfilledResult<NormalizedIndicator[]> =>
      result.status === "fulfilled"
    )
    .flatMap((result) => result.value);
}

/**
 * Common World Bank indicators for country profiles
 */
export const COMMON_INDICATORS = {
  // Economic
  GDP_PER_CAPITA: "NY.GDP.PCAP.KD", // GDP per capita (constant 2015 US$)
  GDP_GROWTH: "NY.GDP.MKTP.KD.ZG", // GDP growth (annual %)
  INFLATION: "FP.CPI.TOTL.ZG", // Inflation, consumer prices (annual %)
  UNEMPLOYMENT: "SL.UEM.TOTL.ZS", // Unemployment, total (% of total labor force)
  
  // Social
  LIFE_EXPECTANCY: "SP.DYN.LE00.IN", // Life expectancy at birth, total (years)
  POPULATION: "SP.POP.TOTL", // Population, total
  URBAN_POPULATION: "SP.URB.TOTL.IN.ZS", // Urban population (% of total population)
  LITERACY_RATE: "SE.ADT.LITR.ZS", // Literacy rate, adult total (% of people ages 15 and above)
  
  // Environment
  CO2_EMISSIONS: "EN.ATM.CO2E.PC", // CO2 emissions (metric tons per capita)
  FOREST_AREA: "AG.LND.FRST.ZS", // Forest area (% of land area)
  RENEWABLE_ENERGY: "EG.FEC.RNEW.ZS", // Renewable energy consumption (% of total final energy consumption)
  
  // Infrastructure
  INTERNET_USERS: "IT.NET.USER.ZS", // Individuals using the Internet (% of population)
  MOBILE_SUBSCRIPTIONS: "IT.CEL.SETS.P2", // Mobile cellular subscriptions (per 100 people)
} as const;

/**
 * Fetch all common indicators for a country
 */
export async function fetchCountryProfile(
  iso2: string,
  since = 2015
): Promise<NormalizedIndicator[]> {
  return fetchWorldBankIndicators(Object.values(COMMON_INDICATORS), iso2, since);
}
