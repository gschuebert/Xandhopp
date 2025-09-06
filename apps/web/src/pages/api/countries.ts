import type { NextApiRequest, NextApiResponse } from "next";
import { getCountriesWithData } from "../../lib/clickhouse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const countries = await getCountriesWithData();

    // Add cache headers for 1 hour
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");
    
    return res.status(200).json({
      countries,
      total: countries.length,
    });
    
  } catch (error) {
    console.error("Error fetching countries:", error);
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}
