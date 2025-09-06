import { Job } from "bullmq";
import { fetchOpenAQMultipleCountries } from "@portalis/connectors/openaq";
import { ClickHouseService } from "../database.js";
import { logger } from "../logger.js";
import { fallbackStorage } from "../fallback-storage.js";

export interface AirQualityJobData {
  countries: string[];
  parameters?: string[]; // pm25, pm10, o3, no2, so2, co
  limit?: number;
  hoursBack?: number; // How many hours back to fetch data
}

export async function processAirQuality(
  job: Job<AirQualityJobData>,
  clickhouse: ClickHouseService
): Promise<void> {
  const { 
    countries, 
    parameters, 
    limit = 100, 
    hoursBack = 24 
  } = job.data;
  
  logger.info(`Processing air quality data for ${countries.length} countries`, {
    jobId: job.id,
    countries,
    parameters,
    limit,
    hoursBack,
  });

  let totalProcessed = 0;
  let totalErrors = 0;

  // Process each parameter separately if specified
  const parametersToFetch = parameters || ["pm25", "pm10", "o3", "no2"];
  
  for (let i = 0; i < parametersToFetch.length; i++) {
    const parameter = parametersToFetch[i];
    
    try {
      logger.debug(`Fetching ${parameter} data for all countries`);
      
      const airQualityData = await fetchOpenAQMultipleCountries(countries, {
        parameter,
        limit: Math.floor(limit / parametersToFetch.length), // Distribute limit across parameters
      });
      
      if (airQualityData.length > 0) {
        try {
          await clickhouse.insertAirQuality(airQualityData);
          logger.info(`Successfully processed ${airQualityData.length} ${parameter} measurements`);
          totalProcessed += airQualityData.length;
        } catch (dbError) {
          logger.error(`Failed to insert ${parameter} data into ClickHouse:`, dbError);
          // Store in fallback storage when ClickHouse is unavailable
          await fallbackStorage.storeAirQuality(airQualityData, parameter);
        }
      } else {
        logger.warn(`No ${parameter} data found for countries: ${countries.join(", ")}`);
      }
      
      // Update progress
      const progress = Math.round(((i + 1) / parametersToFetch.length) * 100);
      await job.updateProgress(progress);
      
      // Small delay to be respectful to the OpenAQ API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay
      
    } catch (error) {
      totalErrors++;
      logger.error(`Failed to fetch ${parameter} air quality data:`, error);
      
      // Continue with other parameters even if one fails
      continue;
    }
  }

  logger.info(`Air quality job completed`, {
    jobId: job.id,
    totalProcessed,
    totalErrors,
    parameters: parametersToFetch,
    countries,
  });
}

export function createAirQualityJob(
  countries: string[],
  options: {
    parameters?: string[];
    limit?: number;
    hoursBack?: number;
  } = {}
): AirQualityJobData {
  return {
    countries,
    parameters: options.parameters,
    limit: options.limit,
    hoursBack: options.hoursBack,
  };
}

// Preset job configurations
export const AIR_QUALITY_JOB_PRESETS = {
  // Essential air quality parameters for all monitored countries
  essential: (countries: string[]) => createAirQualityJob(countries, {
    parameters: ["pm25", "pm10", "no2"],
    limit: 200,
    hoursBack: 24,
  }),
  
  // Full air quality monitoring
  comprehensive: (countries: string[]) => createAirQualityJob(countries, {
    parameters: ["pm25", "pm10", "o3", "no2", "so2", "co"],
    limit: 500,
    hoursBack: 48,
  }),
  
  // PM2.5 only (most important for health)
  pm25Only: (countries: string[]) => createAirQualityJob(countries, {
    parameters: ["pm25"],
    limit: 300,
    hoursBack: 24,
  }),
  
  // Recent data only (last 6 hours)
  recent: (countries: string[]) => createAirQualityJob(countries, {
    parameters: ["pm25", "pm10", "no2"],
    limit: 100,
    hoursBack: 6,
  }),
};
