import { ClickHouseClient, createClient } from "@clickhouse/client";
import { Config } from "./config.js";
import { logger } from "./logger.js";

export class ClickHouseService {
  private client: ClickHouseClient;

  constructor(config: Config["clickhouse"]) {
    this.client = createClient({
      url: config.host,
      database: config.database,
      username: config.username,
      password: config.password,
      request_timeout: 30000,
      compression: {
        response: true,
        request: false,
      },
      max_open_connections: 10,
    });
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.query({
        query: "SELECT 1 as ping",
        format: "JSONEachRow",
      });
      
      // Ensure we can read the result
      const data = await result.json();
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      logger.error("ClickHouse ping failed:", error);
      return false;
    }
  }

  async insertIndicators(data: any[]): Promise<void> {
    if (data.length === 0) {
      logger.debug("No indicators to insert");
      return;
    }

    // Check if ClickHouse is available first
    const isHealthy = await this.ping();
    if (!isHealthy) {
      throw new Error("ClickHouse is not available - running in degraded mode");
    }

    try {
      await this.client.insert({
        table: "portalis.indicators",
        values: data,
        format: "JSONEachRow",
      });
      logger.info(`Inserted ${data.length} indicators into ClickHouse`);
    } catch (error) {
      logger.error("Failed to insert indicators:", {
        error: error instanceof Error ? error.message : String(error),
        dataCount: data.length,
        sampleData: data.slice(0, 2), // Log first 2 records for debugging
      });
      throw error;
    }
  }

  async insertAdvisories(data: any[]): Promise<void> {
    if (data.length === 0) {
      logger.debug("No advisories to insert");
      return;
    }

    try {
      await this.client.insert({
        table: "portalis.advisories",
        values: data,
        format: "JSONEachRow",
      });
      logger.info(`Inserted ${data.length} advisories into ClickHouse`);
    } catch (error) {
      logger.error("Failed to insert advisories:", error);
      throw error;
    }
  }

  async insertAirQuality(data: any[]): Promise<void> {
    if (data.length === 0) {
      logger.debug("No air quality data to insert");
      return;
    }

    // Check if ClickHouse is available first
    const isHealthy = await this.ping();
    if (!isHealthy) {
      throw new Error("ClickHouse is not available - running in degraded mode");
    }

    try {
      await this.client.insert({
        table: "portalis.air_quality",
        values: data,
        format: "JSONEachRow",
      });
      logger.info(`Inserted ${data.length} air quality measurements into ClickHouse`);
    } catch (error) {
      logger.error("Failed to insert air quality data:", {
        error: error instanceof Error ? error.message : String(error),
        dataCount: data.length,
        sampleData: data.slice(0, 2), // Log first 2 records for debugging
      });
      throw error;
    }
  }

  async insertCostOfLiving(data: any[]): Promise<void> {
    if (data.length === 0) {
      logger.debug("No cost of living data to insert");
      return;
    }

    try {
      await this.client.insert({
        table: "portalis.cost_of_living",
        values: data,
        format: "JSONEachRow",
      });
      logger.info(`Inserted ${data.length} cost of living records into ClickHouse`);
    } catch (error) {
      logger.error("Failed to insert cost of living data:", error);
      throw error;
    }
  }

  async getLastIngestionTime(table: string, source: string, country?: string): Promise<Date | null> {
    try {
      const whereClause = country 
        ? `WHERE source = {source:String} AND country_iso2 = {country:FixedString(2)}`
        : `WHERE source = {source:String}`;
      
      const result = await this.client.query({
        query: `SELECT max(ingested_at) as last_ingestion FROM portalis.${table} ${whereClause}`,
        query_params: {
          source,
          ...(country && { country: country.toUpperCase() }),
        },
        format: "JSONEachRow",
      });

      const rows = await result.json<{ last_ingestion: string }>();
      
      if (rows.length > 0 && rows[0].last_ingestion) {
        return new Date(rows[0].last_ingestion);
      }
      
      return null;
    } catch (error) {
      logger.error(`Failed to get last ingestion time for ${table}/${source}:`, error);
      return null;
    }
  }

  async getCountryIndicatorSummary(countryIso2: string): Promise<any[]> {
    try {
      const result = await this.client.query({
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
        query_params: { country: countryIso2.toUpperCase() },
        format: "JSONEachRow",
      });

      return await result.json();
    } catch (error) {
      logger.error(`Failed to get indicator summary for ${countryIso2}:`, error);
      return [];
    }
  }

  async getLatestAdvisory(countryIso2: string): Promise<any | null> {
    try {
      const result = await this.client.query({
        query: `
          SELECT *
          FROM portalis.advisories 
          WHERE country_iso2 = {country:FixedString(2)}
          ORDER BY published_at DESC
          LIMIT 1
        `,
        query_params: { country: countryIso2.toUpperCase() },
        format: "JSONEachRow",
      });

      const rows = await result.json();
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get latest advisory for ${countryIso2}:`, error);
      return null;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
    logger.info("ClickHouse client closed");
  }
}
