import type { NextApiRequest, NextApiResponse } from "next";
import { getCountryIndicators } from "../../../../lib/clickhouse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { iso2, codes } = req.query as { 
    iso2: string; 
    codes?: string | string[]; 
  };

  if (!iso2 || typeof iso2 !== "string" || iso2.length !== 2) {
    return res.status(400).json({ 
      error: "Invalid country code. Must be a 2-letter ISO code (e.g., 'DE')" 
    });
  }

  try {
    // Parse indicator codes from query parameter
    let indicatorCodes: string[] | undefined;
    if (codes) {
      if (typeof codes === "string") {
        indicatorCodes = codes.split(",").map(c => c.trim());
      } else {
        indicatorCodes = codes;
      }
    }

    const indicators = await getCountryIndicators(iso2, indicatorCodes);

    // Add cache headers for 6 hours (indicators change less frequently)
    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate");
    
    return res.status(200).json({
      country_iso2: iso2.toUpperCase(),
      indicators,
      total: indicators.length,
    });
    
  } catch (error) {
    console.error(`Error fetching indicators for ${iso2}:`, error);
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}
