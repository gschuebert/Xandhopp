# Windows Setup für Portalis

## Schnellstart (Empfohlen)

Da Docker auf Windows manchmal Probleme macht, hier die einfachste Lösung:

### 1. Dependencies installieren
```powershell
pnpm install
```

### 2. Nur Datenbank per Docker starten
```powershell
docker-compose -f docker-compose.simple.yml up -d postgres
```

### 3. Frontend-Apps lokal starten
```powershell
# Terminal 1: Web App
cd apps\web
pnpm dev

# Terminal 2: Admin App (neues Terminal)
cd apps\admin
pnpm dev
```

### 4. Zugriff auf die Apps
- **Web App**: http://localhost:3000
- **Admin App**: http://localhost:3001

## Vollständiges Setup (Optional)

Falls du auch die API brauchst:

### 1. Alle Services starten
```powershell
pnpm run docker:up
```

### 2. Bei Problemen: Nur Backend-Services
```powershell
docker-compose -f docker-compose.simple.yml up -d
```

### 3. API lokal starten (falls Docker-API nicht funktioniert)
```powershell
cd apps\symfony-api
php -S localhost:8080 -t public
```

## Häufige Windows-Probleme

### Problem: `make` funktioniert nicht
**Lösung**: Verwende die pnpm-Skripte statt make:
```powershell
# Statt: make up
pnpm run docker:up

# Statt: make down  
pnpm run docker:down
```

### Problem: Docker Build schlägt fehl
**Lösung**: Starte die Frontend-Apps lokal:
```powershell
pnpm dev
```

### Problem: PowerShell Execution Policy
**Lösung**: Führe Skripte so aus:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

### Problem: Symfony API startet nicht
**Lösung**: Verwende PHP Built-in Server:
```powershell
cd apps\symfony-api
php -S localhost:8080 -t public
```

## Minimaler Workflow für Windows

1. **Einmalig**: `pnpm install`
2. **Datenbank**: `docker-compose -f docker-compose.simple.yml up -d postgres` 
3. **Development**: `pnpm dev`
4. **Zugriff**: http://localhost:3000 und http://localhost:3001

Das war's! Die Frontend-Apps funktionieren auch ohne die komplette API.

## Nützliche Befehle

```powershell
# Alle Services stoppen
docker-compose down

# Nur Frontend starten
pnpm dev

# Logs anzeigen
docker-compose logs -f

# Services neustarten
docker-compose restart
```
