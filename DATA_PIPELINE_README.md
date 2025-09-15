# Xandhopp Data Pipeline

## 🌍 Übersicht

Das Xandhopp Data Pipeline System ist eine professionelle, skalierbare Architektur für die Sammlung, Normalisierung und Bereitstellung von Länderinformationen aus verschiedenen öffentlichen und kommerziellen APIs.

## 🏗️ Architektur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │    │  Ingestion Layer │    │  Storage Layer  │
│                 │    │                  │    │                 │
│ • World Bank    │───▶│  BullMQ Worker   │───▶│  ClickHouse     │
│ • US State Dept │    │  • HTTP Client   │    │  • Indicators   │
│ • FCDO (UK)     │    │  • Rate Limiting │    │  • Advisories   │
│ • OpenAQ        │    │  • Retry Logic   │    │  • Air Quality  │
│ • WHO/GHO       │    │  • Scheduling    │    │  • Cost Living  │
│ • OECD          │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Layer     │    │   Redis Queue    │    │   PostgreSQL    │
│                 │    │                  │    │                 │
│ • REST APIs     │◀───│  • Job Queue     │    │  • Core Entities│
│ • GraphQL       │    │  • Scheduling    │    │  • Countries    │
│ • Health Checks │    │  • Monitoring    │    │  • Programs     │
│ • Rate Limiting │    │                  │    │  • Providers    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 Datenquellen

### 🏦 Economic & Social Indicators
- **World Bank**: GDP, Inflation, Arbeitslosigkeit, Lebenserwartung
- **OECD**: SDMX-basierte Indikatoren
- **WHO/GHO**: Gesundheitsindikatoren

### 🛡️ Travel & Security
- **US State Department**: Reisewarnungen (Level 1-4)
- **FCDO (UK)**: Britische Reisehinweise
- **Optional**: GDACS (Katastrophenwarnungen)

### 🌬️ Environmental Data
- **OpenAQ**: Luftqualitätsmessungen (PM2.5, PM10, NO2, O3)
- **Optional**: Climate APIs

### 💰 Cost of Living
- **Numbeo**: Lebenshaltungskosten (API Key erforderlich)
- **TradingEconomics**: Wirtschaftsdaten (API Key erforderlich)

## 🚀 Quick Start

### 1. Setup ausführen
```bash
# Clone und Dependencies installieren
pnpm install

# Environment konfigurieren
cp .env.example .env.local
# Bearbeite .env.local mit deinen Einstellungen

# Komplettes Setup (Infrastructure + Schema + Apps)
.\scripts\setup-data-pipeline.ps1
```

### 2. Manueller Start
```bash
# Infrastructure Services starten
pnpm run docker:up

# ClickHouse Schema anwenden
pnpm run ch:setup

# Ingestion Worker starten
pnpm run ingestion:dev

# Web & Admin Apps starten
pnpm run dev
```

### 3. System testen
```bash
# Vollständiger System-Test
.\scripts\test-data-pipeline.ps1

# Einzelne Endpoints testen
pnpm run data:health
pnpm run data:countries
pnpm run data:snapshot
```

## 📡 API Endpoints

### Health & Status
```http
GET /api/health
# Response: { status: "healthy", services: {...} }
```

### Countries
```http
GET /api/countries
# Response: { countries: ["DE", "ES", ...], total: 30 }
```

### Country Data
```http
# Vollständiger Snapshot
GET /api/country/{iso2}/snapshot
# Response: { advisory: {...}, indicators: [...], air_quality: [...] }

# Nur Indikatoren
GET /api/country/{iso2}/indicators?codes=NY.GDP.PCAP.KD,SP.DYN.LE00.IN

# Nur Luftqualität
GET /api/country/{iso2}/airquality?parameters=pm25,no2&hours=24
```

## 🗄️ Datenbank Schema

### ClickHouse Tables

#### `portalis.indicators`
```sql
CREATE TABLE portalis.indicators (
    country_iso2 FixedString(2),
    source LowCardinality(String),
    indicator_code LowCardinality(String),
    period Date,
    value Nullable(Float64),
    meta JSON,
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(period)
ORDER BY (country_iso2, indicator_code, period);
```

#### `portalis.advisories`
```sql
CREATE TABLE portalis.advisories (
    country_iso2 FixedString(2),
    source LowCardinality(String),
    level UInt8,
    headline String,
    url String,
    published_at DateTime,
    payload JSON,
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(published_at)
ORDER BY (country_iso2, published_at);
```

#### `portalis.air_quality`
```sql
CREATE TABLE portalis.air_quality (
    country_iso2 FixedString(2),
    city String,
    parameter LowCardinality(String),
    ts DateTime,
    value Nullable(Float64),
    unit LowCardinality(String),
    source LowCardinality(String),
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(ts)
ORDER BY (country_iso2, city, parameter, ts);
```

## ⚙️ Konfiguration

### Environment Variables (.env.local)
```bash
# ClickHouse
CLICKHOUSE_HTTP=http://localhost:8123
CLICKHOUSE_DATABASE=portalis

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys (Optional)
OPENAQ_API_KEY=your_key_here
NUMBEO_API_KEY=your_key_here
TRADING_ECONOMICS_KEY=your_key_here

# Scheduling (Milliseconds)
ADVISORIES_INTERVAL=21600000    # 6 hours
INDICATORS_INTERVAL=86400000    # 24 hours
AIR_QUALITY_INTERVAL=43200000   # 12 hours

# Countries to monitor
MONITOR_COUNTRIES=DE,ES,PT,US,GB,FR,IT,NL,BE,AT
```

### Job Scheduling
- **Travel Advisories**: Alle 6 Stunden
- **Economic Indicators**: Täglich
- **Air Quality**: Alle 12 Stunden

## 🔧 Development

### Package Structure
```
packages/
├── connectors/          # API Connectors & HTTP Clients
│   ├── src/
│   │   ├── http.ts      # Shared HTTP utilities
│   │   ├── worldbank.ts # World Bank API
│   │   ├── stateDept.ts # US State Department
│   │   ├── fcdo.ts      # UK Foreign Office
│   │   ├── openaq.ts    # Air Quality API
│   │   └── index.ts     # Exports
│   └── package.json
├── db-clickhouse/       # ClickHouse Schema
│   └── schema.sql
└── ...

apps/
├── ingestion-worker/    # BullMQ Job Worker
│   ├── src/
│   │   ├── index.ts     # Main worker
│   │   ├── config.ts    # Configuration
│   │   ├── database.ts  # ClickHouse service
│   │   └── jobs/        # Job processors
│   └── package.json
├── web/                 # Next.js Web App
│   ├── src/
│   │   ├── lib/clickhouse.ts    # ClickHouse client
│   │   └── pages/api/           # API routes
│   └── package.json
└── ...
```

### Neue Datenquellen hinzufügen

1. **Connector erstellen**:
```typescript
// packages/connectors/src/myapi.ts
export async function fetchMyAPI(country: string) {
  const response = await httpGetJson(`https://api.example.com/data/${country}`);
  return response.data.map(item => ({
    country_iso2: country.toUpperCase(),
    source: "myapi",
    // ... normalize data
  }));
}
```

2. **Job Processor hinzufügen**:
```typescript
// apps/ingestion-worker/src/jobs/myapi.ts
export async function processMyAPI(job: Job, clickhouse: ClickHouseService) {
  const data = await fetchMyAPI(job.data.country);
  await clickhouse.insertIndicators(data);
}
```

3. **Scheduling konfigurieren**:
```typescript
// apps/ingestion-worker/src/index.ts
await queue.add("myapi", { country: "DE" }, { 
  repeat: { every: 60000 } 
});
```

## 🚨 Monitoring & Debugging

### Logs
```bash
# Ingestion Worker Logs
docker-compose logs -f ingestion-worker

# ClickHouse Logs
docker-compose logs -f clickhouse

# All services
pnpm run docker:logs
```

### Health Checks
```bash
# System Health
curl http://localhost:3000/api/health

# ClickHouse Direct
curl http://localhost:8123/ping

# Redis
docker-compose exec redis redis-cli ping
```

### Performance Monitoring
```sql
-- ClickHouse Query Performance
SELECT query, query_duration_ms, memory_usage
FROM system.query_log 
WHERE type = 'QueryFinish'
ORDER BY event_time DESC LIMIT 10;

-- Data Volume
SELECT 
  table, 
  formatReadableSize(sum(bytes_on_disk)) as size,
  sum(rows) as rows
FROM system.parts 
WHERE database = 'portalis'
GROUP BY table;
```

## 🔒 Security & Rate Limiting

### API Rate Limits
- **World Bank**: 120 requests/minute
- **OpenAQ**: 2000 requests/hour (ohne API Key)
- **US State Dept**: Keine offiziellen Limits
- **FCDO**: Höfliche Nutzung empfohlen

### Retry Strategy
- **Initial Delay**: 500ms
- **Max Retries**: 3
- **Backoff**: Exponential
- **Rate Limit Handling**: Automatic delay

## 📈 Skalierung

### Horizontal Scaling
```yaml
# docker-compose.yml
ingestion-worker:
  deploy:
    replicas: 3
  environment:
    - WORKER_CONCURRENCY=2
```

### ClickHouse Optimierung
```sql
-- Materialized Views für häufige Abfragen
CREATE MATERIALIZED VIEW country_summary_mv AS
SELECT 
  country_iso2,
  argMax(value, period) as latest_gdp
FROM indicators 
WHERE indicator_code = 'NY.GDP.PCAP.KD'
GROUP BY country_iso2;
```

## 🐛 Troubleshooting

### Häufige Probleme

1. **ClickHouse Connection Failed**
   ```bash
   # Container Status prüfen
   docker-compose ps clickhouse
   
   # Logs prüfen
   docker-compose logs clickhouse
   
   # Schema erneut anwenden
   pnpm run ch:schema
   ```

2. **Keine Daten in APIs**
   ```bash
   # Worker Status prüfen
   curl http://localhost:3000/api/health
   
   # Job Queue Status (BullMQ Dashboard)
   # Oder Worker Logs prüfen
   ```

3. **Rate Limiting**
   ```bash
   # API Keys in .env.local setzen
   OPENAQ_API_KEY=your_key
   NUMBEO_API_KEY=your_key
   ```

## 📚 Nützliche Ressourcen

- [World Bank API Docs](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
- [OpenAQ API v3](https://docs.openaq.org/reference)
- [US State Dept Travel Advisories](https://travel.state.gov/content/travel/en/traveladvisories.html)
- [ClickHouse Documentation](https://clickhouse.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)

## 🎯 Nächste Schritte

1. **Zusätzliche Datenquellen**:
   - WHO Global Health Observatory
   - OECD SDMX APIs
   - UN SDG Indicators
   - Climate APIs

2. **Erweiterte Features**:
   - GraphQL API
   - Real-time Updates via WebSockets
   - Data Validation & Quality Checks
   - Automated Alerts

3. **Performance Optimierung**:
   - ClickHouse Cluster Setup
   - Caching Layer (Redis)
   - CDN für API Responses

4. **Monitoring & Observability**:
   - Prometheus Metrics
   - Grafana Dashboards
   - OpenTelemetry Tracing
