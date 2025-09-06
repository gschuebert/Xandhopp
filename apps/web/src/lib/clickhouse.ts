import { createClient, ClickHouseClient } from "@clickhouse/client";

let clickhouseClient: ClickHouseClient | null = null;

export function getClickHouseClient(): ClickHouseClient {
  if (!clickhouseClient) {
    clickhouseClient = createClient({
      url: process.env.CLICKHOUSE_HTTP || "http://localhost:8123",
      database: process.env.CLICKHOUSE_DATABASE || "portalis",
      username: process.env.CLICKHOUSE_USERNAME,
      password: process.env.CLICKHOUSE_PASSWORD,
      request_timeout: 30000,
      compression: {
        response: true,
        request: false,
      },
      // Add connection retry logic
      max_open_connections: 10,
    });
  }
  
  return clickhouseClient;
}

export interface CountrySnapshot {
  country_iso2: string;
  advisory: {
    source: string;
    level: number;
    headline: string;
    url: string;
    published_at: string;
  } | null;
  indicators: Array<{
    indicator_code: string;
    source: string;
    latest_value: number | null;
    latest_period: string;
    latest_meta: any;
  }>;
  air_quality: Array<{
    parameter: string;
    city: string;
    latest_value: number | null;
    unit: string;
    latest_ts: string;
  }>;
}

export async function getCountrySnapshot(iso2: string): Promise<CountrySnapshot | null> {
  const client = getClickHouseClient();
  const countryCode = iso2.toUpperCase();
  
  try {
    // Get latest advisory
    const advisoryResult = await client.query({
      query: `
        SELECT 
          source,
          level,
          headline,
          url,
          published_at
        FROM portalis.advisories 
        WHERE country_iso2 = {country:FixedString(2)}
        ORDER BY published_at DESC
        LIMIT 1
      `,
      query_params: { country: countryCode },
      format: "JSONEachRow",
    });
    
    const advisories = await advisoryResult.json<any>();
    const advisory = advisories.length > 0 ? advisories[0] : null;
    
    // Get latest indicators
    const indicatorsResult = await client.query({
      query: `
        SELECT 
          indicator_code,
          source,
          argMax(value, period) as latest_value,
          argMax(period, period) as latest_period,
          argMax(meta, period) as latest_meta
        FROM portalis.indicators 
        WHERE country_iso2 = {country:FixedString(2)}
        GROUP BY indicator_code, source
        ORDER BY indicator_code, source
      `,
      query_params: { country: countryCode },
      format: "JSONEachRow",
    });
    
    const indicators = await indicatorsResult.json<any>();
    
    // Get latest air quality data
    const airQualityResult = await client.query({
      query: `
        SELECT 
          parameter,
          city,
          argMax(value, ts) as latest_value,
          argMax(unit, ts) as unit,
          argMax(ts, ts) as latest_ts
        FROM portalis.air_quality 
        WHERE country_iso2 = {country:FixedString(2)}
        GROUP BY parameter, city
        ORDER BY parameter, city
      `,
      query_params: { country: countryCode },
      format: "JSONEachRow",
    });
    
    const air_quality = await airQualityResult.json<any>();
    
    return {
      country_iso2: countryCode,
      advisory,
      indicators,
      air_quality,
    };
    
  } catch (error) {
    console.error(`Failed to get country snapshot for ${iso2}:`, error);
    return null;
  }
}

export async function getCountryIndicators(
  iso2: string,
  indicatorCodes?: string[]
): Promise<Array<{
  indicator_code: string;
  source: string;
  period: string;
  value: number | null;
  meta: any;
}>> {
  const client = getClickHouseClient();
  const countryCode = iso2.toUpperCase();
  
  try {
    let whereClause = "WHERE country_iso2 = {country:FixedString(2)}";
    const queryParams: any = { country: countryCode };
    
    if (indicatorCodes && indicatorCodes.length > 0) {
      whereClause += " AND indicator_code IN ({indicators:Array(String)})";
      queryParams.indicators = indicatorCodes;
    }
    
    const result = await client.query({
      query: `
        SELECT 
          indicator_code,
          source,
          period,
          value,
          meta
        FROM portalis.indicators 
        ${whereClause}
        ORDER BY indicator_code, source, period DESC
      `,
      query_params: queryParams,
      format: "JSONEachRow",
    });
    
    return await result.json<any>();
    
  } catch (error) {
    console.error(`Failed to get indicators for ${iso2}:`, error);
    return [];
  }
}

export async function getCountryAirQuality(
  iso2: string,
  parameters?: string[],
  hoursBack = 24
): Promise<Array<{
  parameter: string;
  city: string;
  ts: string;
  value: number | null;
  unit: string;
}>> {
  const client = getClickHouseClient();
  const countryCode = iso2.toUpperCase();
  
  try {
    let whereClause = `
      WHERE country_iso2 = {country:FixedString(2)} 
      AND ts >= now() - INTERVAL {hoursBack:UInt32} HOUR
    `;
    const queryParams: any = { 
      country: countryCode,
      hoursBack 
    };
    
    if (parameters && parameters.length > 0) {
      whereClause += " AND parameter IN ({parameters:Array(String)})";
      queryParams.parameters = parameters;
    }
    
    const result = await client.query({
      query: `
        SELECT 
          parameter,
          city,
          ts,
          value,
          unit
        FROM portalis.air_quality 
        ${whereClause}
        ORDER BY parameter, city, ts DESC
      `,
      query_params: queryParams,
      format: "JSONEachRow",
    });
    
    return await result.json<any>();
    
  } catch (error) {
    console.error(`Failed to get air quality for ${iso2}:`, error);
    return [];
  }
}

export async function getCountriesWithData(): Promise<string[]> {
  const client = getClickHouseClient();
  
  try {
    const result = await client.query({
      query: `
        SELECT DISTINCT country_iso2
        FROM (
          SELECT DISTINCT country_iso2 FROM portalis.indicators
          UNION ALL
          SELECT DISTINCT country_iso2 FROM portalis.advisories
          UNION ALL
          SELECT DISTINCT country_iso2 FROM portalis.air_quality
        )
        ORDER BY country_iso2
      `,
      format: "JSONEachRow",
    });
    
    const countries = await result.json<{ country_iso2: string }>();
    return countries.map(c => c.country_iso2);
    
  } catch (error) {
    console.error("Failed to get countries with data:", error);
    return [];
  }
}
