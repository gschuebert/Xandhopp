# Xandhopp Local Subdomain Setup

Diese Anleitung zeigt dir, wie du das nervige Port-Problem löst und eine saubere lokale Subdomain einrichtest.

## 🎯 Was wird eingerichtet?

Statt vieler verschiedener Ports bekommst du saubere URLs:

- **Hauptanwendung**: `http://xandhopp.local` (statt localhost:3002)
- **Admin**: `http://admin.xandhopp.local` (statt localhost:3003)  
- **API**: `http://api.xandhopp.local` (statt localhost:8082)
- **Suche**: `http://search.xandhopp.local` (statt localhost:7701)
- **E-Mail**: `http://mail.xandhopp.local` (statt localhost:8025)
- **Storage**: `http://storage.xandhopp.local` (statt localhost:9005)

## 🚀 Setup (Windows)

1. **PowerShell als Administrator öffnen**
2. **Subdomain einrichten**:
   ```powershell
   .\setup-subdomain.ps1
   ```
3. **Services starten**:
   ```powershell
   docker-compose -f docker-compose.subdomain.yml up -d
   ```

## 🐧 Setup (Linux/WSL)

1. **Terminal öffnen**
2. **Subdomain einrichten**:
   ```bash
   sudo ./setup-subdomain.sh
   ```
3. **Services starten**:
   ```bash
   docker-compose -f docker-compose.subdomain.yml up -d
   ```

## 📁 Neue Dateien

- `nginx.conf` - Nginx Reverse Proxy Konfiguration
- `docker-compose.subdomain.yml` - Docker Compose mit Subdomain-Setup
- `setup-subdomain.ps1` - Windows Setup-Script
- `setup-subdomain.sh` - Linux Setup-Script

## 🔧 Wie es funktioniert

1. **Nginx** läuft auf Port 80 und leitet Anfragen an die richtigen Services weiter
2. **Hosts-Datei** wird erweitert um die lokalen Subdomains
3. **Docker Services** laufen intern ohne Port-Exposition
4. **CORS** wurde angepasst für die neuen Domains

## 🛑 Services stoppen

```bash
docker-compose -f docker-compose.subdomain.yml down
```

## 🔄 Zurück zum alten Setup

Falls du zurück willst:
```bash
docker-compose up -d  # Alte Konfiguration
```

## 🐛 Troubleshooting

**Subdomain funktioniert nicht?**
- Prüfe ob die Hosts-Datei korrekt erweitert wurde
- Stelle sicher, dass kein anderer Service auf Port 80 läuft
- Teste mit `ping xandhopp.local`

**Docker Services starten nicht?**
- Prüfe ob alle Ports frei sind: `docker ps`
- Schaue in die Logs: `docker-compose -f docker-compose.subdomain.yml logs`

**CORS-Fehler?**
- Die API wurde bereits für die neuen Domains konfiguriert
- Falls Probleme auftreten, prüfe die `CORS_ALLOW_ORIGIN` Variable
