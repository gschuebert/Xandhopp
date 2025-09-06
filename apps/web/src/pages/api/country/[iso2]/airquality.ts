import type { NextApiRequest, NextApiResponse } from "next";
import { getCountryAirQuality } from "../../../../lib/clickhouse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { iso2, parameters, hours } = req.query as { 
    iso2: string; 
    parameters?: string | string[];
    hours?: string;
  };

  if (!iso2 || typeof iso2 !== "string" || iso2.length !== 2) {
    return res.status(400).json({ 
      error: "Invalid country code. Must be a 2-letter ISO code (e.g., 'DE')" 
    });
  }

  try {
    // Parse parameters from query
    let parameterList: string[] | undefined;
    if (parameters) {
      if (typeof parameters === "string") {
        parameterList = parameters.split(",").map(p => p.trim().toLowerCase());
      } else {
        parameterList = parameters.map(p => p.toLowerCase());
      }
    }

    // Parse hours back (default 24)
    const hoursBack = hours ? parseInt(hours, 10) : 24;
    if (isNaN(hoursBack) || hoursBack < 1 || hoursBack > 168) { // Max 7 days
      return res.status(400).json({ 
        error: "Invalid hours parameter. Must be between 1 and 168 (7 days)" 
      });
    }

    const airQualityData = await getCountryAirQuality(iso2, parameterList, hoursBack);

    // Group by parameter and city for better structure
    const grouped = airQualityData.reduce((acc, item) => {
      const key = `${item.parameter}_${item.city}`;
      if (!acc[key]) {
        acc[key] = {
          parameter: item.parameter,
          city: item.city,
          unit: item.unit,
          measurements: [],
        };
      }
      acc[key].measurements.push({
        ts: item.ts,
        value: item.value,
      });
      return acc;
    }, {} as Record<string, any>);

    const structured = Object.values(grouped);

    // Add cache headers for 1 hour (air quality changes frequently)
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");
    
    return res.status(200).json({
      country_iso2: iso2.toUpperCase(),
      hours_back: hoursBack,
      parameters: parameterList || ["all"],
      data: structured,
      total_measurements: airQualityData.length,
    });
    
  } catch (error) {
    console.error(`Error fetching air quality for ${iso2}:`, error);
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}
