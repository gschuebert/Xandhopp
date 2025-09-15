# Portalis Migration zu Ubuntu/WSL

## 🎯 Warum Ubuntu/WSL besser ist:

- ✅ ClickHouse funktioniert ohne Timeouts
- ✅ Alle Shell-Commands funktionieren nativ
- ✅ Docker läuft performanter
- ✅ Keine PowerShell-Syntax-Probleme
- ✅ Bessere Development Experience

## 🚀 Migration Steps:

### 1. Projekt nach Ubuntu kopieren
```bash
# In WSL Ubuntu Terminal
cd ~
mkdir -p projects
cd projects

# Kopiere das Portalis Projekt von Windows
cp -r /mnt/d/dev/Portalis .
cd Portalis
```

### 2. Node.js & pnpm installieren
```bash
# Node.js 18 installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm installieren
npm install -g pnpm

# Dependencies installieren
pnpm install
```

### 3. Docker Setup
```bash
# Docker ist bereits in WSL verfügbar
# Services starten
docker-compose up -d

# Warten bis ClickHouse bereit ist
sleep 30

# Schema anwenden
docker exec -i xandhopp-clickhouse-1 clickhouse-client --multiquery < packages/db-clickhouse/schema.sql
```

### 4. Services starten
```bash
# Web App
pnpm --filter @xandhopp/web dev &

# Admin App  
pnpm --filter @xandhopp/admin dev &

# Ingestion Worker
pnpm run ingestion:dev &
```

### 5. Testen
```bash
# APIs testen
curl http://localhost:3000/en
curl http://localhost:3000/api/health

# ClickHouse testen
docker exec xandhopp-clickhouse-1 clickhouse-client --query "SHOW TABLES FROM xandhopp"
```

## 🎊 Vorteile nach Migration:

- ✅ ClickHouse funktioniert perfekt
- ✅ Echte Daten werden gespeichert
- ✅ Alle APIs funktionieren
- ✅ Keine Windows-spezifischen Probleme
- ✅ Bessere Performance
- ✅ Einfachere Entwicklung

## 📊 Was dann funktioniert:

1. **Live Data Pipeline**: Vollständig operational
2. **ClickHouse**: Speichert echte API-Daten
3. **All APIs**: World Bank, State Dept, FCDO, OpenAQ
4. **Portal**: Zeigt echte Live-Daten
5. **Performance**: Deutlich schneller

## 🌟 Empfehlung:

**Migriere zu Ubuntu/WSL - du wirst den Unterschied sofort merken!**

Die Windows-Docker-Probleme verschwinden und alles funktioniert wie geplant.
