import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { logger } from "./logger.js";

/**
 * Simple fallback storage for when ClickHouse is unavailable
 * Stores data as JSON files that can be imported later
 */
export class FallbackStorage {
  private baseDir: string;

  constructor(baseDir = "./data/fallback") {
    this.baseDir = baseDir;
  }

  async ensureDir(): Promise<void> {
    try {
      await mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      logger.warn("Could not create fallback directory:", error);
    }
  }

  async storeIndicators(data: any[], country: string): Promise<void> {
    await this.ensureDir();
    const filename = `indicators_${country}_${Date.now()}.json`;
    const filepath = join(this.baseDir, filename);
    
    try {
      await writeFile(filepath, JSON.stringify(data, null, 2));
      logger.info(`Stored ${data.length} indicators for ${country} in fallback storage: ${filename}`);
    } catch (error) {
      logger.error("Failed to store indicators in fallback storage:", error);
    }
  }

  async storeAirQuality(data: any[], parameter: string): Promise<void> {
    await this.ensureDir();
    const filename = `airquality_${parameter}_${Date.now()}.json`;
    const filepath = join(this.baseDir, filename);
    
    try {
      await writeFile(filepath, JSON.stringify(data, null, 2));
      logger.info(`Stored ${data.length} air quality measurements (${parameter}) in fallback storage: ${filename}`);
    } catch (error) {
      logger.error("Failed to store air quality data in fallback storage:", error);
    }
  }

  async storeAdvisories(data: any[]): Promise<void> {
    await this.ensureDir();
    const filename = `advisories_${Date.now()}.json`;
    const filepath = join(this.baseDir, filename);
    
    try {
      await writeFile(filepath, JSON.stringify(data, null, 2));
      logger.info(`Stored ${data.length} advisories in fallback storage: ${filename}`);
    } catch (error) {
      logger.error("Failed to store advisories in fallback storage:", error);
    }
  }
}

export const fallbackStorage = new FallbackStorage();
