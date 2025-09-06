-- ClickHouse schema for Portalis country data analytics
-- Run with: docker exec -i $(docker ps -qf name=clickhouse) clickhouse-client --multiquery < packages/db-clickhouse/schema.sql

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS portalis;

-- Use the database
USE portalis;

-- Large time series & indicator data from World Bank, OECD, WHO, etc.
CREATE TABLE IF NOT EXISTS portalis.indicators (
    country_iso2 FixedString(2),
    source LowCardinality(String),
    indicator_code LowCardinality(String),
    period Date,
    value Nullable(Float64),
    meta String,             -- JSON as string
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(period)
ORDER BY (country_iso2, indicator_code, period)
SETTINGS index_granularity = 8192;

-- Travel advisories from US State Dept, FCDO, etc.
CREATE TABLE IF NOT EXISTS portalis.advisories (
    country_iso2 FixedString(2),
    source LowCardinality(String),
    level UInt8,                 -- 1..4 or similar
    headline String,
    url String,
    published_at DateTime,
    payload String,
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(published_at)
ORDER BY (country_iso2, published_at);

-- Air quality data from OpenAQ and other sources
CREATE TABLE IF NOT EXISTS portalis.air_quality (
    country_iso2 FixedString(2),
    city String,
    parameter LowCardinality(String), -- pm25, no2, o3, etc.
    ts DateTime,
    value Nullable(Float64),
    unit LowCardinality(String),
    source LowCardinality(String),
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(ts)
ORDER BY (country_iso2, city, parameter, ts);

-- Cost of living data from Numbeo, TradingEconomics, etc.
CREATE TABLE IF NOT EXISTS portalis.cost_of_living (
    country_iso2 FixedString(2),
    city String,
    category LowCardinality(String), -- housing, food, transport, etc.
    item String,
    value Nullable(Float64),
    currency FixedString(3),
    source LowCardinality(String),
    period Date,
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(period)
ORDER BY (country_iso2, city, category, period);

-- Materialized View: latest advisory per country
CREATE MATERIALIZED VIEW IF NOT EXISTS portalis.latest_advisory_mv
ENGINE = ReplacingMergeTree()
ORDER BY country_iso2 AS
SELECT 
    country_iso2,
    source,
    level,
    headline,
    url,
    published_at,
    payload
FROM (
    SELECT 
        *,
        row_number() OVER (PARTITION BY country_iso2 ORDER BY published_at DESC) as rn
    FROM portalis.advisories
) WHERE rn = 1;

-- Materialized View: latest indicators per country
CREATE MATERIALIZED VIEW IF NOT EXISTS portalis.latest_indicators_mv
ENGINE = ReplacingMergeTree()
ORDER BY (country_iso2, indicator_code) AS
SELECT 
    country_iso2,
    indicator_code,
    source,
    argMax(value, period) as latest_value,
    argMax(period, period) as latest_period,
    argMax(meta, period) as latest_meta
FROM portalis.indicators
GROUP BY country_iso2, indicator_code, source;

-- Materialized View: air quality summary per city
CREATE MATERIALIZED VIEW IF NOT EXISTS portalis.air_quality_latest_mv
ENGINE = ReplacingMergeTree()
ORDER BY (country_iso2, city, parameter) AS
SELECT 
    country_iso2,
    city,
    parameter,
    source,
    argMax(value, ts) as latest_value,
    argMax(unit, ts) as unit,
    argMax(ts, ts) as latest_ts
FROM portalis.air_quality
GROUP BY country_iso2, city, parameter, source;

-- Create indexes for better query performance
-- Note: ClickHouse doesn't have traditional indexes, but we can optimize with projections

-- Projection for country-level aggregations
ALTER TABLE portalis.indicators ADD PROJECTION IF NOT EXISTS country_summary (
    SELECT 
        country_iso2,
        indicator_code,
        toYear(period) as year,
        avg(value) as avg_value,
        max(value) as max_value,
        min(value) as min_value
    GROUP BY country_iso2, indicator_code, year
);

-- Add some sample data for testing (optional)
-- This will be replaced by the ingestion worker
INSERT INTO portalis.indicators VALUES 
    ('DE', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 46259.52, '{}', now()),
    ('US', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 70248.63, '{}', now()),
    ('ES', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 27057.16, '{}', now()),
    ('PT', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 24252.95, '{}', now());

INSERT INTO portalis.advisories VALUES 
    ('DE', 'us_state_dept', 1, 'Exercise Normal Precautions', 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/germany-travel-advisory.html', now(), '{}', now()),
    ('ES', 'us_state_dept', 2, 'Exercise Increased Caution', 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/spain-travel-advisory.html', now(), '{}', now());

-- Show table info
SHOW TABLES FROM portalis;
