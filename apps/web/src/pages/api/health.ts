import type { NextApiRequest, NextApiResponse } from "next";
import { getClickHouseClient } from "../../lib/clickhouse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const services = {
    clickhouse: false,
    api: true, // API is running if this endpoint responds
  };

  try {
    // Test ClickHouse connection
    const client = getClickHouseClient();
    await client.query({
      query: "SELECT 1 as test",
      format: "JSONEachRow",
    });
    services.clickhouse = true;
  } catch (error) {
    console.error("ClickHouse health check failed:", error);
  }

  const allHealthy = Object.values(services).every(status => status === true);
  const statusCode = allHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: allHealthy ? "healthy" : "unhealthy",
    services,
    timestamp: new Date().toISOString(),
  });
}
