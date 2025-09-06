import { z } from "zod";

const ConfigSchema = z.object({
  // Redis configuration
  redis: z.object({
    host: z.string().default("localhost"),
    port: z.number().default(6379),
    password: z.string().optional(),
    db: z.number().default(0),
  }),
  
  // ClickHouse configuration
  clickhouse: z.object({
    host: z.string().default("http://localhost:8123"),
    database: z.string().default("portalis"),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
  
  // API keys (optional)
  apiKeys: z.object({
    openaq: z.string().optional(),
    numbeo: z.string().optional(),
    tradingEconomics: z.string().optional(),
  }),
  
  // Job scheduling configuration
  scheduling: z.object({
    advisories: z.object({
      interval: z.number().default(6 * 60 * 60 * 1000), // 6 hours
    }),
    indicators: z.object({
      interval: z.number().default(24 * 60 * 60 * 1000), // 24 hours
    }),
    airQuality: z.object({
      interval: z.number().default(12 * 60 * 60 * 1000), // 12 hours
    }),
  }),
  
  // Countries to monitor
  countries: z.array(z.string()).default([
    "DE", "ES", "PT", "US", "GB", "FR", "IT", "NL", "BE", "AT",
    "CH", "PL", "CZ", "HU", "HR", "GR", "CY", "MT", "EE", "LV",
    "LT", "SK", "SI", "BG", "RO", "IE", "LU", "DK", "SE", "FI",
  ]),
  
  // Logging
  logging: z.object({
    level: z.enum(["debug", "info", "warn", "error"]).default("info"),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  // Set SSL configuration for development
  if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn("⚠️ SSL certificate verification disabled for development");
  }
  
  const config = {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB || "0"),
    },
    clickhouse: {
      host: process.env.CLICKHOUSE_HTTP || "http://localhost:8123",
      database: process.env.CLICKHOUSE_DATABASE || "portalis",
      username: process.env.CLICKHOUSE_USERNAME,
      password: process.env.CLICKHOUSE_PASSWORD,
    },
    apiKeys: {
      openaq: process.env.OPENAQ_API_KEY,
      numbeo: process.env.NUMBEO_API_KEY,
      tradingEconomics: process.env.TRADING_ECONOMICS_KEY,
    },
    scheduling: {
      advisories: {
        interval: Number(process.env.ADVISORIES_INTERVAL || String(6 * 60 * 60 * 1000)),
      },
      indicators: {
        interval: Number(process.env.INDICATORS_INTERVAL || String(24 * 60 * 60 * 1000)),
      },
      airQuality: {
        interval: Number(process.env.AIR_QUALITY_INTERVAL || String(12 * 60 * 60 * 1000)),
      },
    },
    countries: process.env.MONITOR_COUNTRIES?.split(",").map(c => c.trim()) || [
      "DE", "ES", "PT", "US", "GB", "FR", "IT", "NL", "BE", "AT",
      "CH", "PL", "CZ", "HU", "HR", "GR", "CY", "MT", "EE", "LV", 
      "LT", "SK", "SI", "BG", "RO", "IE", "LU", "DK", "SE", "FI",
    ],
    logging: {
      level: (process.env.LOG_LEVEL as any) || "info",
    },
  };

  return ConfigSchema.parse(config);
}

export function validateApiKeys(config: Config): void {
  const warnings: string[] = [];
  
  if (!config.apiKeys.openaq) {
    warnings.push("OPENAQ_API_KEY not set - using public API with rate limits");
  }
  
  if (!config.apiKeys.numbeo) {
    warnings.push("NUMBEO_API_KEY not set - cost of living data may be limited");
  }
  
  if (!config.apiKeys.tradingEconomics) {
    warnings.push("TRADING_ECONOMICS_KEY not set - economic data may be limited");
  }
  
  if (warnings.length > 0) {
    console.warn("API Key Configuration Warnings:");
    warnings.forEach(warning => console.warn(`  - ${warning}`));
    console.warn("Set the missing API keys to improve data collection capabilities.");
  }
}