import { Job } from "bullmq";
import { fetchWorldBankIndicators, COMMON_INDICATORS } from "@portalis/connectors/worldbank";
import { ClickHouseService } from "../database.js";
import { logger } from "../logger.js";
import { fallbackStorage } from "../fallback-storage.js";

export interface WorldBankIndicatorJobData {
  indicators: string[];
  countries: string[];
  since?: number;
}

export async function processWorldBankIndicators(
  job: Job<WorldBankIndicatorJobData>,
  clickhouse: ClickHouseService
): Promise<void> {
  const { indicators, countries, since = 2015 } = job.data;
  
  logger.info(`Processing World Bank indicators for ${countries.length} countries`, {
    jobId: job.id,
    indicators: indicators.length,
    countries,
  });

  let totalProcessed = 0;
  let totalErrors = 0;

  for (const country of countries) {
    try {
      // Update job progress
      const progress = Math.round((totalProcessed / countries.length) * 100);
      await job.updateProgress(progress);

      logger.debug(`Fetching World Bank indicators for ${country}`);
      
      const indicatorData = await fetchWorldBankIndicators(indicators, country, since);
      
      if (indicatorData.length > 0) {
        try {
          await clickhouse.insertIndicators(indicatorData);
          logger.info(`Successfully processed ${indicatorData.length} indicators for ${country}`);
        } catch (dbError) {
          logger.error(`Failed to insert indicators for ${country} into ClickHouse:`, dbError);
          // Store in fallback storage when ClickHouse is unavailable
          await fallbackStorage.storeIndicators(indicatorData, country);
        }
      } else {
        logger.warn(`No indicator data found for ${country}`);
      }
      
      totalProcessed++;
      
      // Small delay to be respectful to the World Bank API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      totalErrors++;
      logger.error(`Failed to process World Bank indicators for ${country}:`, {
        error: error instanceof Error ? error.message : String(error),
        country,
        jobId: job.id,
      });
      
      // Continue with other countries even if one fails
      continue;
    }
  }

  await job.updateProgress(100);
  
  logger.info(`World Bank indicators job completed`, {
    jobId: job.id,
    totalProcessed,
    totalErrors,
    successRate: `${Math.round((totalProcessed / countries.length) * 100)}%`,
  });
}

export function createWorldBankIndicatorJob(
  countries: string[],
  indicators: string[] = Object.values(COMMON_INDICATORS),
  since = 2015
): WorldBankIndicatorJobData {
  return {
    indicators,
    countries,
    since,
  };
}

// Preset job configurations
export const WORLDBANK_JOB_PRESETS = {
  // Essential economic indicators for all monitored countries
  economic: (countries: string[]) => createWorldBankIndicatorJob(countries, [
    COMMON_INDICATORS.GDP_PER_CAPITA,
    COMMON_INDICATORS.GDP_GROWTH,
    COMMON_INDICATORS.INFLATION,
    COMMON_INDICATORS.UNEMPLOYMENT,
  ]),
  
  // Social and demographic indicators
  social: (countries: string[]) => createWorldBankIndicatorJob(countries, [
    COMMON_INDICATORS.LIFE_EXPECTANCY,
    COMMON_INDICATORS.POPULATION,
    COMMON_INDICATORS.URBAN_POPULATION,
    COMMON_INDICATORS.LITERACY_RATE,
  ]),
  
  // Environmental indicators
  environmental: (countries: string[]) => createWorldBankIndicatorJob(countries, [
    COMMON_INDICATORS.CO2_EMISSIONS,
    COMMON_INDICATORS.FOREST_AREA,
    COMMON_INDICATORS.RENEWABLE_ENERGY,
  ]),
  
  // Infrastructure and technology indicators
  infrastructure: (countries: string[]) => createWorldBankIndicatorJob(countries, [
    COMMON_INDICATORS.INTERNET_USERS,
    COMMON_INDICATORS.MOBILE_SUBSCRIPTIONS,
  ]),
  
  // Full profile with all common indicators
  fullProfile: (countries: string[]) => createWorldBankIndicatorJob(countries),
};
