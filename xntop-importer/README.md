# XNTOP Importer

Wikipedia-Importer für Länderdaten in die XNTOP PostgreSQL-Datenbank.

## Features

- Importiert Wikipedia-Intros & Pageimages für 25 Länder pro Kontinent
- Unterstützt 5 Sprachen: EN, DE, ES, ZH, HI
- Robuste Wikipedia-API Calls mit Retries, Backoff und Timeout
- Saubere Upserts in PostgreSQL-Datenbank
- Content-Type: overview

## Kontinente

- Africa (25 Länder)
- Americas (25 Länder) 
- Asia (25 Länder)
- Europe (25 Länder)
- Oceania (25 Länder)

**Total: 125 Länder**

## Installation

```bash
pip install -r requirements.txt
```

## Konfiguration

1. Kopieren Sie `.env.example` zu `.env`
2. Passen Sie die Datenbankverbindung an
3. Führen Sie das Import-Skript aus

## Verwendung

```bash
python main.py
```

## Datenbank-Schema

Das Skript verwendet das Schema aus `sql/xntop_schema_full.sql`.
