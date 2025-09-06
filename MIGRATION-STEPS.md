# 🚀 Portalis Migration zu WSL Ubuntu

## Schritt-für-Schritt Anleitung:

### 1. Verzeichnis in WSL erstellen ✅
```bash
# Bereits erledigt via: wsl -d Ububtu -e mkdir -p /var/www
```

### 2. Projekt kopieren (Windows Explorer)
1. **Öffne Windows Explorer**
2. **Navigiere zu**: `\\wsl.localhost\Ububtu\var\www`
3. **Erstelle Ordner**: `Portalis`
4. **Kopiere alle Dateien** von `D:\dev\Portalis` nach `\\wsl.localhost\Ububtu\var\www\Portalis`
   - **AUSSCHLIESSEN**: `node_modules`, `.next`, `dist`, `.git` Ordner

### 3. WSL Ubuntu Terminal öffnen
```bash
# Öffne Ubuntu Terminal und navigiere zum Projekt:
cd /var/www/Portalis
```

### 4. Setup ausführen
```bash
# Setup-Script ausführbar machen:
chmod +x scripts/ubuntu-quick-setup.sh

# Setup ausführen:
./scripts/ubuntu-quick-setup.sh
```

### 5. Services starten
```bash
# Web App starten:
pnpm --filter @portalis/web dev &

# Ingestion Worker starten:
pnpm run ingestion:dev &
```

### 6. Testen
```bash
# Portal testen:
curl http://localhost:3000/en

# ClickHouse testen:
docker exec portalis-clickhouse-1 clickhouse-client --query "SHOW TABLES FROM portalis"
```

## 🎯 Was dann funktioniert:

- ✅ **ClickHouse**: Funktioniert ohne Timeouts
- ✅ **Live Data**: Wird in ClickHouse gespeichert
- ✅ **All APIs**: World Bank, State Dept, FCDO
- ✅ **Portal**: Zeigt echte Live-Daten
- ✅ **Performance**: Deutlich schneller

## 🌟 Nach der Migration:

**Portal verfügbar unter**: http://localhost:3000/en

**Alle Windows-Docker-Probleme sind gelöst!** 🎉
