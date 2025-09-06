import { z } from "zod";
import { httpGetJson, buildQueryParams } from "./http.js";

// OpenAQ API v3 Schema
const OpenAQLocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  countryCode: z.string(),
  city: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

const OpenAQMeasurementSchema = z.object({
  locationId: z.number(),
  location: OpenAQLocationSchema.optional(),
  parameter: z.string(),
  value: z.number().nullable(),
  unit: z.string(),
  date: z.object({
    utc: z.string(),
    local: z.string(),
  }),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  isMobile: z.boolean().optional(),
  isAnalysis: z.boolean().optional(),
  entity: z.string().optional(),
  sensorType: z.string().optional(),
});

const OpenAQResponseSchema = z.object({
  meta: z.object({
    name: z.string(),
    website: z.string(),
    page: z.number(),
    limit: z.number(),
    found: z.number(),
  }),
  results: z.array(OpenAQMeasurementSchema),
});

export type OpenAQMeasurement = z.infer<typeof OpenAQMeasurementSchema>;
export type OpenAQResponse = z.infer<typeof OpenAQResponseSchema>;

/**
 * Normalized air quality data for ClickHouse
 */
export interface NormalizedAirQuality {
  country_iso2: string;
  city: string;
  parameter: string;
  ts: string; // ISO datetime string
  value: number | null;
  unit: string;
  source: string;
}

/**
 * Air quality parameter mapping and descriptions
 */
export const AIR_QUALITY_PARAMETERS = {
  pm25: { name: "PM2.5", description: "Fine particulate matter (≤2.5μm)" },
  pm10: { name: "PM10", description: "Coarse particulate matter (≤10μm)" },
  o3: { name: "Ozone", description: "Ground-level ozone" },
  no2: { name: "NO2", description: "Nitrogen dioxide" },
  so2: { name: "SO2", description: "Sulfur dioxide" },
  co: { name: "CO", description: "Carbon monoxide" },
  bc: { name: "Black Carbon", description: "Black carbon particles" },
} as const;

/**
 * Fetch air quality measurements for a specific country
 */
export async function fetchOpenAQByCountry(
  countryCode: string,
  options: {
    limit?: number;
    page?: number;
    parameter?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
): Promise<NormalizedAirQuality[]> {
  const {
    limit = 1000,
    page = 1,
    parameter,
    dateFrom,
    dateTo,
  } = options;

  const params = buildQueryParams({
    country_id: countryCode.toUpperCase(),
    limit,
    page,
    parameter,
    date_from: dateFrom,
    date_to: dateTo,
    sort: "desc",
    order_by: "datetime",
  });

  const url = `https://api.openaq.org/v3/measurements?${params}`;

  try {
    // Prepare headers - only include API key if it exists
    const headers: Record<string, string> = {};
    if (process.env.OPENAQ_API_KEY) {
      headers["X-API-Key"] = process.env.OPENAQ_API_KEY;
    }

    const response = await httpGetJson<OpenAQResponse>(url, {
      headers,
      retries: 2, // Reduce retries for faster failure
    });

    if (!response.data || response.status !== 200) {
      console.warn(`OpenAQ API returned status ${response.status} for ${countryCode}`);
      return [];
    }

    const data = OpenAQResponseSchema.parse(response.data);

    if (!data.results || data.results.length === 0) {
      console.info(`No air quality data available for ${countryCode}`);
      return [];
    }

    return data.results.map((measurement) => ({
      country_iso2: (measurement.location?.countryCode || measurement.country || countryCode).toUpperCase(),
      city: measurement.location?.city || measurement.city || measurement.location?.name || "Unknown",
      parameter: measurement.parameter.toLowerCase(),
      ts: measurement.date.utc,
      value: measurement.value,
      unit: measurement.unit,
      source: "openaq",
    }));
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('401')) {
      console.warn(`OpenAQ API authentication failed for ${countryCode}. Consider setting OPENAQ_API_KEY environment variable for higher rate limits.`);
    } else if (error instanceof Error && error.message.includes('429')) {
      console.warn(`OpenAQ API rate limit exceeded for ${countryCode}. Retrying later...`);
    } else {
      console.error(`Failed to fetch OpenAQ data for ${countryCode}:`, error);
    }
    return [];
  }
}

/**
 * Fetch air quality measurements for a specific city
 */
export async function fetchOpenAQByCity(
  cityName: string,
  countryCode?: string,
  options: {
    limit?: number;
    parameter?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
): Promise<NormalizedAirQuality[]> {
  const {
    limit = 1000,
    parameter,
    dateFrom,
    dateTo,
  } = options;

  const params = buildQueryParams({
    city: cityName,
    country_id: countryCode?.toUpperCase(),
    limit,
    parameter,
    date_from: dateFrom,
    date_to: dateTo,
    sort: "desc",
    order_by: "datetime",
  });

  const url = `https://api.openaq.org/v3/measurements?${params}`;

  try {
    // Prepare headers - only include API key if it exists
    const headers: Record<string, string> = {};
    if (process.env.OPENAQ_API_KEY) {
      headers["X-API-Key"] = process.env.OPENAQ_API_KEY;
    }

    const response = await httpGetJson<OpenAQResponse>(url, {
      headers,
      retries: 2, // Reduce retries for faster failure
    });

    if (!response.data || response.status !== 200) {
      console.warn(`OpenAQ API returned status ${response.status} for ${cityName}`);
      return [];
    }

    const data = OpenAQResponseSchema.parse(response.data);

    return data.results.map((measurement) => ({
      country_iso2: (measurement.location?.countryCode || measurement.country || "").toUpperCase(),
      city: measurement.location?.city || measurement.city || measurement.location?.name || cityName,
      parameter: measurement.parameter.toLowerCase(),
      ts: measurement.date.utc,
      value: measurement.value,
      unit: measurement.unit,
      source: "openaq",
    }));
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('401')) {
      console.warn(`OpenAQ API authentication failed for ${cityName}. Consider setting OPENAQ_API_KEY environment variable for higher rate limits.`);
    } else if (error instanceof Error && error.message.includes('429')) {
      console.warn(`OpenAQ API rate limit exceeded for ${cityName}. Retrying later...`);
    } else {
      console.error(`Failed to fetch OpenAQ data for ${cityName}:`, error);
    }
    return [];
  }
}

/**
 * Fetch latest air quality measurements for multiple countries
 */
export async function fetchOpenAQMultipleCountries(
  countryCodes: string[],
  options: {
    parameter?: string;
    limit?: number;
  } = {}
): Promise<NormalizedAirQuality[]> {
  const { parameter, limit = 100 } = options;

  const results = await Promise.allSettled(
    countryCodes.map((countryCode) =>
      fetchOpenAQByCountry(countryCode, {
        parameter,
        limit,
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      })
    )
  );

  return results
    .filter((result): result is PromiseFulfilledResult<NormalizedAirQuality[]> =>
      result.status === "fulfilled"
    )
    .flatMap((result) => result.value);
}

/**
 * Get air quality summary for a country (latest measurements by parameter)
 */
export async function getAirQualitySummary(countryCode: string): Promise<Record<string, NormalizedAirQuality[]>> {
  const measurements = await fetchOpenAQByCountry(countryCode, {
    limit: 1000,
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
  });

  // Group by parameter
  const summary: Record<string, NormalizedAirQuality[]> = {};
  
  measurements.forEach((measurement) => {
    if (!summary[measurement.parameter]) {
      summary[measurement.parameter] = [];
    }
    summary[measurement.parameter].push(measurement);
  });

  // Sort each parameter group by timestamp (most recent first)
  Object.keys(summary).forEach((parameter) => {
    summary[parameter].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  });

  return summary;
}
