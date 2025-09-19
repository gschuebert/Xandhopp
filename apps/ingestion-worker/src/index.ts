import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { loadConfig, validateApiKeys } from "./config.js";
import { ClickHouseService } from "./database.js";
import { logger } from "./logger.js";

// For development: disable SSL verification if needed
if (process.env.NODE_ENV === 'development' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  logger.warn("⚠️ SSL certificate verification disabled for development");
}

// Job processors
import { processWorldBankIndicators, WORLDBANK_JOB_PRESETS } from "./jobs/worldbank.indicators.js";
import { processAdvisories, ADVISORY_JOB_PRESETS } from "./jobs/advisories.js";
import { processAirQuality, AIR_QUALITY_JOB_PRESETS } from "./jobs/airquality.js";

const config = loadConfig();

// Redis connection
const connection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// ClickHouse service
const clickhouse = new ClickHouseService(config.clickhouse);

// Queue setup
const queueName = "xandhopp-ingestion";
const queue = new Queue(queueName, { connection });

// Job worker
const worker = new Worker(
  queueName,
  async (job) => {
    logger.info({ jobId: job.id }, `Processing job: ${job.name}`);
    
    try {
      switch (job.name) {
        case "worldbank.indicators":
          await processWorldBankIndicators(job, clickhouse);
          break;
          
        case "advisories":
          await processAdvisories(job, clickhouse);
          break;
          
        case "airquality":
          await processAirQuality(job, clickhouse);
          break;
          
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
      
      logger.info(`Job completed successfully: ${job.name}`, { jobId: job.id });
      
    } catch (error) {
      logger.error(`Job failed: ${job.name}`, { 
        jobId: job.id, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Reduce concurrency to prevent lock conflicts
    removeOnComplete: { count: 10 }, // Keep fewer completed jobs
    removeOnFail: { count: 20 }, // Keep fewer failed jobs
    stalledInterval: 30 * 1000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 1, // Max times a job can be stalled before failed
  }
);

// Error handling
worker.on("failed", (job, err) => {
  logger.error({
    jobId: job?.id,
    error: err.message,
    stack: err.stack,
  }, `Job failed: ${job?.name}`);
});

worker.on("completed", (job) => {
  logger.info({
    jobId: job.id,
    duration: job.finishedOn ? job.finishedOn - job.processedOn! : 0,
  }, `Job completed: ${job.name}`);
});

worker.on("stalled", (jobId) => {
  logger.warn(`Job stalled: ${jobId}`);
});

worker.on("error", (err) => {
  logger.error("Worker error:", {
    error: err.message,
    stack: err.stack,
  });
});

// Prevent multiple workers from processing the same job
worker.on("active", (job) => {
  logger.debug(`Job started: ${job.name}`, { jobId: job.id });
});

worker.on("progress", (job, progress) => {
  logger.debug(`Job progress: ${job.name} - ${progress}%`, { jobId: job.id });
});

// Health check function
async function healthCheck(): Promise<boolean> {
  try {
    // Check Redis connection
    await connection.ping();
    logger.debug("Redis connection healthy");
    
    // Check ClickHouse connection (non-blocking)
    const chHealthy = await clickhouse.ping();
    
    if (!chHealthy) {
      logger.warn("ClickHouse not available - continuing in degraded mode");
      return false; // Return false but don't crash
    }
    
    logger.debug("Health check passed - all services healthy");
    return true;
  } catch (error) {
    logger.error("Health check failed:", error);
    return false;
  }
}

// Schedule recurring jobs
async function scheduleJobs(): Promise<void> {
  logger.info("Scheduling recurring jobs...");
  
  try {
    // Clear existing jobs to avoid duplicates
    await queue.obliterate({ force: true });
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Schedule World Bank indicators (daily)
    await queue.add(
      "worldbank.indicators",
      WORLDBANK_JOB_PRESETS.fullProfile(config.countries),
      {
        repeat: { every: config.scheduling.indicators.interval },
        jobId: "worldbank-indicators-daily",
      }
    );
    
    // Schedule travel advisories (every 6 hours) - only US State Dept for now
    await queue.add(
      "advisories",
      ADVISORY_JOB_PRESETS.usStateDeptOnly(),
      {
        repeat: { every: config.scheduling.advisories.interval },
        jobId: "advisories-6hourly",
      }
    );
    
    // Schedule air quality data (every 12 hours) - only if API key is available
    if (config.apiKeys.openaq) {
      await queue.add(
        "airquality",
        AIR_QUALITY_JOB_PRESETS.essential(config.countries),
        {
          repeat: { every: config.scheduling.airQuality.interval },
          jobId: "airquality-12hourly",
        }
      );
    } else {
      logger.warn("OpenAQ API key not configured - skipping air quality data collection");
    }
    
    logger.info("Recurring jobs scheduled successfully");
    
    // Run initial jobs immediately (with delays to prevent conflicts)
    logger.info("Triggering initial data fetch...");
    
    await queue.add(
      "advisories",
      ADVISORY_JOB_PRESETS.usStateDeptOnly(),
      { 
        priority: 10,
        delay: 1000, // 1 second delay
      }
    );
    
    // Only add air quality job if API key is available
    if (config.apiKeys.openaq) {
      await queue.add(
        "airquality",
        AIR_QUALITY_JOB_PRESETS.recent(config.countries.slice(0, 10)), // Start with first 10 countries
        { 
          priority: 5,
          delay: 5000, // 5 second delay
        }
      );
    }
    
    // World Bank indicators can take longer, so lower priority and longer delay
    await queue.add(
      "worldbank.indicators",
      WORLDBANK_JOB_PRESETS.economic(config.countries.slice(0, 8)), // Start with first 8 countries
      { 
        priority: 1,
        delay: 10000, // 10 second delay
      }
    );
    
  } catch (error) {
    logger.error("Failed to schedule jobs:", error);
    throw error;
  }
}

// Graceful shutdown
async function gracefulShutdown(): Promise<void> {
  logger.info("Starting graceful shutdown...");
  
  try {
    await worker.close();
    await queue.close();
    await clickhouse.close();
    await connection.quit();
    
    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Main startup function
async function main(): Promise<void> {
  logger.info("Starting Xandhopp Ingestion Worker", {
    countries: config.countries.length,
    redis: `${config.redis.host}:${config.redis.port}`,
    clickhouse: config.clickhouse.host,
  });
  
  // Validate API keys and show warnings
  validateApiKeys(config);
  
  // Health check before starting (non-blocking)
  const healthy = await healthCheck();
  if (!healthy) {
    logger.warn("⚠ Some services not available - running in degraded mode");
    logger.info("Worker will continue and retry connections periodically");
  } else {
    logger.info("✓ All services healthy - live data mode");
  }
  
  // Schedule jobs
  await scheduleJobs();
  
  // Set up periodic health checks (less aggressive)
  setInterval(async () => {
    const healthy = await healthCheck();
    if (!healthy) {
      logger.warn("Health check failed - continuing in degraded mode");
      // Don't shut down automatically, just log the issue
    }
  }, 300000); // Every 5 minutes instead of 1 minute
  
  logger.info("Ingestion worker started successfully");
}

// Handle process signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

// Start the application
main().catch((error) => {
  logger.error("Failed to start ingestion worker:", error);
  process.exit(1);
});
