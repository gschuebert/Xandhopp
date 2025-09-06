import type { NextApiRequest, NextApiResponse } from "next";
import { getCountrySnapshot } from "../../../../lib/clickhouse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { iso2 } = req.query as { iso2: string };

  if (!iso2 || typeof iso2 !== "string" || iso2.length !== 2) {
    return res.status(400).json({ 
      error: "Invalid country code. Must be a 2-letter ISO code (e.g., 'DE')" 
    });
  }

  try {
    const snapshot = await getCountrySnapshot(iso2);
    
    if (!snapshot) {
      return res.status(404).json({ 
        error: `No data found for country ${iso2.toUpperCase()}` 
      });
    }

    // Add cache headers for 1 hour
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");
    
    return res.status(200).json(snapshot);
    
  } catch (error) {
    console.error(`Error fetching snapshot for ${iso2}:`, error);
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}
