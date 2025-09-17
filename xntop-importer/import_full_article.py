#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import logging
from typing import Dict, List, Optional, Tuple

import psycopg2
import psycopg2.extras
import requests
from bs4 import BeautifulSoup

# ──────────────────────────────────────────────────────────────
# ENV / Konfiguration
# ──────────────────────────────────────────────────────────────

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5433"))
DB_NAME = os.getenv("DB_NAME", "xandhopp")
DB_USER = os.getenv("DB_USER", "xandhopp")
DB_PASSWORD = os.getenv("DB_PASSWORD", "xandhopp")

# Sprachen, die importiert werden sollen
LANGS = os.getenv("LANGS", "en,de,es,zh,hi").split(",")

# wichtig: sauberer User-Agent, sonst 403
WIKI_UA = os.getenv(
    "WIKIPEDIA_USER_AGENT",
    "XNTOP/1.0 (https://xntop.app; contact@you.example)"
)

REQUEST_TIMEOUT = int(os.getenv("WIKI_TIMEOUT", "30"))
REQUEST_DELAY = float(os.getenv("WIKI_DELAY", "0.25"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - import_full_article - %(levelname)s - %(message)s",
)
log = logging.getLogger("import_full_article")

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": WIKI_UA, "Accept": "application/json"})

# ──────────────────────────────────────────────────────────────
# DB Helpers
# ──────────────────────────────────────────────────────────────

def db():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )

def ensure_aux_schema(conn):
    """Legt Hilfstabellen/Content-Typen an (idempotent)."""
    with conn.cursor() as cur:
        # Tabelle zum Cachen der lokalisierten Titel je Sprache
        cur.execute("""
        CREATE TABLE IF NOT EXISTS wikipedia_titles (
            country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
            language_code VARCHAR(10) NOT NULL,
            title TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (country_id, language_code)
        )
        """)

        # Content-Typen (linke Spalte + Basis)
        content_types = [
            ("overview", "Overview"),
            ("geography", "Geography"),
            ("demography", "Demography"),
            ("history", "History"),
            ("politics", "Politics"),
            ("economy", "Economy"),
            ("transport", "Transport"),
            ("culture", "Culture"),
            ("see_also", "See also"),
            ("literature", "Literature"),
            ("external_links", "External links"),
            ("notes", "Notes"),
            ("references", "References"),
        ]
        for key, name_en in content_types:
            cur.execute("""
            INSERT INTO content_types(key, name_en)
            VALUES (%s, %s)
            ON CONFLICT (key) DO NOTHING
            """, (key, name_en))
    conn.commit()

def load_content_type_ids(conn) -> Dict[str, int]:
    with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute("SELECT id, key FROM content_types")
        rows = cur.fetchall()
    return {row["key"]: row["id"] for row in rows}

def get_countries(conn) -> List[Dict]:
    with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute("SELECT id, name_en, iso_code, wikidata_id FROM countries ORDER BY name_en")
        return [dict(r) for r in cur.fetchall()]

def upsert_wikidata_id(conn, country_id: int, qid: str):
    if not qid:
        return
    with conn.cursor() as cur:
        cur.execute("""
        UPDATE countries SET wikidata_id = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND (wikidata_id IS NULL OR wikidata_id <> %s)
        """, (qid, country_id, qid))
    conn.commit()

def upsert_local_title(conn, country_id: int, lang: str, title: str):
    if not title:
        return
    with conn.cursor() as cur:
        cur.execute("""
        INSERT INTO wikipedia_titles(country_id, language_code, title, updated_at)
        VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (country_id, language_code)
        DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP
        """, (country_id, lang, title))
    conn.commit()

def get_cached_local_title(conn, country_id: int, lang: str) -> Optional[str]:
    with conn.cursor() as cur:
        cur.execute("""
        SELECT title FROM wikipedia_titles WHERE country_id = %s AND language_code = %s
        """, (country_id, lang))
        row = cur.fetchone()
    return row[0] if row else None

def upsert_localized_html(conn, country_id: int, lang: str, content_type_id: int, html: str, source_url: Optional[str]):
    """Speichert HTML in localized_contents. Erwartet Unique-Constraint gemäß Empfehlung."""
    if not html:
        return
    with conn.cursor() as cur:
        # Wenn deine DB die benannte Constraint hat:
        # ON CONFLICT ON CONSTRAINT uq_localized_content
        # Andernfalls: ersatzweise WHERE (unique) prüfen.
        cur.execute("""
        INSERT INTO localized_contents(country_id, subregion_id, language_code, content_type_id, content, source_url, updated_at)
        VALUES (%s, NULL, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT ON CONSTRAINT uq_localized_content
        DO UPDATE SET content = EXCLUDED.content, source_url = EXCLUDED.source_url, updated_at = CURRENT_TIMESTAMP
        """, (country_id, lang, content_type_id, html, source_url))
    conn.commit()

def upsert_fact(conn, country_id: int, lang: str, key: str, value: str, unit: Optional[str] = None):
    if not value:
        return
    with conn.cursor() as cur:
        cur.execute("""
        INSERT INTO country_facts(country_id, language_code, key, value, unit)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (country_id, language_code, key)
        DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, last_updated = CURRENT_TIMESTAMP
        """, (country_id, lang, key, value, unit))
    conn.commit()

# ──────────────────────────────────────────────────────────────
# Wikipedia + Wikidata Helpers
# ──────────────────────────────────────────────────────────────

def req_json(url: str, params=None, lang_host: Optional[str] = None, accept: str = "application/json") -> Tuple[Optional[Dict], int]:
    headers = {"User-Agent": WIKI_UA, "Accept": accept}
    try:
        r = SESSION.get(url, params=params, headers=headers, timeout=REQUEST_TIMEOUT)
        return (r.json() if r.status_code == 200 else None, r.status_code)
    except requests.RequestException as e:
        log.warning(f"HTTP error: {e} for {url}")
        return (None, 0)

def req_text(url: str, params=None, accept: str = "text/html") -> Tuple[Optional[str], int]:
    headers = {"User-Agent": WIKI_UA, "Accept": accept}
    try:
        r = SESSION.get(url, params=params, headers=headers, timeout=REQUEST_TIMEOUT)
        return (r.text if r.status_code == 200 else None, r.status_code)
    except requests.RequestException as e:
        log.warning(f"HTTP error: {e} for {url}")
        return (None, 0)

def get_qid_from_title(title: str, lang: str) -> Optional[str]:
    url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query", "format": "json",
        "prop": "pageprops", "redirects": 1, "titles": title
    }
    data, status = req_json(url, params=params)
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    if not pages:
        return None
    page = next(iter(pages.values()))
    return (page.get("pageprops") or {}).get("wikibase_item")

def search_title(lang: str, query: str) -> Optional[str]:
    """Sucht den besten Titel in einer Sprachwiki (zur Not)."""
    url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query", "format": "json",
        "list": "search", "srlimit": 1, "srprop": "", "srsearch": query
    }
    data, status = req_json(url, params=params)
    try:
        hits = data.get("query", {}).get("search", [])
        if hits:
            return hits[0]["title"]
    except Exception:
        pass
    return None

def get_localized_title_via_wikidata(qid: str, target_lang: str) -> Optional[str]:
    url = "https://www.wikidata.org/w/api.php"
    params = {"action": "wbgetentities", "format": "json", "props": "sitelinks", "ids": qid}
    data, status = req_json(url, params=params)
    if not data:
        return None
    ent = data.get("entities", {}).get(qid, {})
    site = f"{target_lang}wiki"
    return (ent.get("sitelinks", {}).get(site) or {}).get("title")

def get_localized_title_via_langlinks(source_title: str, source_lang: str, target_lang: str) -> Optional[str]:
    url = f"https://{source_lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query", "format": "json",
        "prop": "langlinks", "redirects": 1, "lllimit": "max", "titles": source_title
    }
    data, status = req_json(url, params=params)
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    if not pages:
        return None
    page = next(iter(pages.values()))
    for ll in page.get("langlinks", []) or []:
        if ll.get("lang") == target_lang:
            return ll.get("*")
    return None

def fetch_summary_plain(title: str, lang: str) -> Tuple[Optional[str], Optional[str]]:
    """Optional, falls du eine kurze Plaintext-Zusammenfassung willst."""
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}"
    data, status = req_json(url)
    if not data:
        return None, None
    extract = data.get("extract")
    page_url = (data.get("content_urls", {}).get("desktop") or {}).get("page")
    return extract, page_url

def fetch_parsoid_html(title: str, lang: str) -> Optional[str]:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/html/{title}"
    html, status = req_text(url, accept="text/html")
    if status == 403:
        return None  # blockiert → später parse-Fallback
    return html if status == 200 else None

def fetch_action_parse_html(title: str, lang: str) -> Optional[str]:
    """Fallback: Action API parse → HTML."""
    url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "parse", "format": "json", "prop": "text",
        "page": title, "redirects": 1
    }
    data, status = req_json(url, params=params)
    try:
        html = data["parse"]["text"]["*"]
        return html
    except Exception:
        return None

# ──────────────────────────────────────────────────────────────
# Abschnitts-Mapping
# ──────────────────────────────────────────────────────────────

ALIASES = {
    "en": {
        "geography": ["geography","location","climate","environment"],
        "demography": ["demography","demographics","population"],
        "history": ["history","prehistory","modern history"],
        "politics": ["politics","government","administration","foreign relations"],
        "economy": ["economy","economic","industries","finance"],
        "transport": ["transport","transportation","infrastructure"],
        "culture": ["culture","arts","media","education","religion","sport"],
        "see_also": ["see also"],
        "literature": ["bibliography","further reading"],
        "external_links": ["external links"],
        "notes": ["notes","footnotes"],
        "references": ["references","citations"]
    },
    "de": {
        "geography": ["geographie","lage","klima","naturräumliche gliederung"],
        "demography": ["bevölkerung","demografie"],
        "history": ["geschichte","vorgeschichte","neuzeit"],
        "politics": ["politik","staat","verwaltung","außenpolitik"],
        "economy": ["wirtschaft","finanzen","industrie"],
        "transport": ["verkehr","infrastruktur"],
        "culture": ["kultur","bildung","religion","medien","sport"],
        "see_also": ["siehe auch"],
        "literature": ["literatur","weiterführende literatur"],
        "external_links": ["weblinks"],
        "notes": ["anmerkungen"],
        "references": ["einzelnachweise","referenzen","belege"]
    },
    "es": {
        "geography": ["geografía","ubicación","clima","medio ambiente"],
        "demography": ["demografía","población"],
        "history": ["historia"],
        "politics": ["política","gobierno"],
        "economy": ["economía"],
        "transport": ["transporte","infraestructura"],
        "culture": ["cultura","educación","religión","deporte","arte"],
        "see_also": ["véase también"],
        "literature": ["bibliografía"],
        "external_links": ["enlaces externos"],
        "notes": ["notas"],
        "references": ["referencias"]
    },
    "zh": {
        "geography": ["地理","地貌","气候","地理环境"],
        "demography": ["人口","民族"],
        "history": ["历史"],
        "politics": ["政治","政府","行政"],
        "economy": ["经济"],
        "transport": ["交通","基础设施","基礎設施"],
        "culture": ["文化","教育","宗教","体育","藝術","媒体"],
        "see_also": ["参见"],
        "literature": ["书目","延伸阅读"],
        "external_links": ["外部链接"],
        "notes": ["注释"],
        "references": ["参考资料","参考文献"]
    },
    "hi": {
        "geography": ["भूगोल","स्थिति","जलवायु"],
        "demography": ["जनसांख्यिकी","जनसंख्या"],
        "history": ["इतिहास"],
        "politics": ["राजनीति","सरकार"],
        "economy": ["अर्थव्यवस्था"],
        "transport": ["परिवहन","बुनियादी ढाँचा"],
        "culture": ["संस्कृति","शिक्षा","धर्म","खेल","कला","मीडिया"],
        "see_also": ["यह भी देखें"],
        "literature": ["साहित्य","ग्रंथसूची"],
        "external_links": ["बाहरी कड़ियाँ"],
        "notes": ["टिप्पणियाँ"],
        "references": ["संदर्भ","उद्धरण"]
    }
}

def normalize_section_key(title: str, lang: str) -> str:
    t = (title or "").lower().strip()
    table = ALIASES.get(lang, ALIASES["en"])
    for key, names in table.items():
        for n in names:
            if t.startswith(n):
                return key
    return "other"

def split_sections_from_html(html: str, lang: str) -> Dict[str, str]:
    soup = BeautifulSoup(html, "html.parser")

    # Lead: nimm die <p> bis zum ersten H2
    def get_lead():
        lead_parts = []
        body = soup
        for el in body.find_all(recursive=False):
            name = (getattr(el, "name", "") or "").lower()
            if name == "h2":
                break
            if name == "p":
                lead_parts.append(str(el))
        return "\n".join(lead_parts).strip()

    sections = {}
    current = None
    buf: List[str] = []

    for node in soup.find_all(["h2","p","ul","ol","table","div","figure","h3","blockquote"]):
        name = (getattr(node, "name", "") or "").lower()
        if name == "h2":
            # flush
            if current:
                html_chunk = "\n".join(buf).strip()
                if html_chunk:
                    sections[current] = html_chunk
            buf = []
            title = node.get_text(" ").strip()
            current = normalize_section_key(title, lang)
            continue
        if current:
            buf.append(str(node))

    if current:
        html_chunk = "\n".join(buf).strip()
        if html_chunk:
            sections[current] = html_chunk

    lead = get_lead()
    if lead and "overview" not in sections:
        sections["overview"] = lead

    return sections

# ──────────────────────────────────────────────────────────────
# Wikidata Facts (rechte Spalte)
# ──────────────────────────────────────────────────────────────

def wikidata_facts(qid: str, lang: str = "en") -> Dict[str, str]:
    """Kleine, robuste Auswahl. Du kannst die Query jederzeit erweitern."""
    if not qid:
        return {}
    query = f"""
    SELECT ?pop ?area ?capitalLabel ?currencyLabel ?languageLabel WHERE {{
      wd:{qid} wdt:P1082 ?pop .
      wd:{qid} wdt:P2046 ?area .
      OPTIONAL {{ wd:{qid} wdt:P36 ?capital . }}
      OPTIONAL {{ wd:{qid} wdt:P38 ?currency . }}
      OPTIONAL {{ wd:{qid} wdt:P37 ?language . }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "{lang},en". }}
    }}
    LIMIT 1
    """
    try:
        r = SESSION.get(
            "https://query.wikidata.org/sparql",
            params={"query": query, "format": "json"},
            headers={
                "User-Agent": WIKI_UA,
                "Accept": "application/sparql-results+json"
            },
            timeout=REQUEST_TIMEOUT
        )
        if r.status_code != 200:
            return {}
        b = r.json().get("results", {}).get("bindings", [])
        if not b:
            return {}
        row = b[0]
        val = lambda k: row.get(k, {}).get("value")
        return {
            "population": val("pop"),
            "area_km2": val("area"),
            "capital": val("capitalLabel"),
            "currency": val("currencyLabel"),
            "official_language": val("languageLabel"),
        }
    except requests.RequestException:
        return {}

# ──────────────────────────────────────────────────────────────
# Hauptlogik je Land/Sprache
# ──────────────────────────────────────────────────────────────

def resolve_titles_and_qid(country_name_en: str, lang: str, qid_hint: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """
    Liefert (lokaler Titel in lang, qid).
    qid wird, wenn nötig, über enwiki + pageprops + Suche ermittelt.
    """
    qid = qid_hint

    # Falls keine QID: versuche erst direkte pageprops in enwiki
    if not qid:
        qid = get_qid_from_title(country_name_en, "en")
        if not qid:
            # Suche besten enwiki-Titel und versuche erneut
            en_best = search_title("en", country_name_en) or country_name_en
            qid = get_qid_from_title(en_best, "en")

    # Lokalen Titel via Wikidata sitelinks
    local_title = None
    if qid:
        local_title = get_localized_title_via_wikidata(qid, lang)

    # Fallback via langlinks von enwiki
    if not local_title:
        en_best = search_title("en", country_name_en) or country_name_en
        local_title = get_localized_title_via_langlinks(en_best, "en", lang)

    # Finale Fallback: Suche direkt in Zielwiki
    if not local_title:
        local_title = search_title(lang, country_name_en)

    return (local_title, qid)

def import_one_country_language(conn, country: Dict, lang: str, ct_ids: Dict[str, int]):
    cid = country["id"]
    name_en = country["name_en"]
    qid_hint = country.get("wikidata_id")

    # Caching: schon bekannter lokaler Titel?
    local_title = get_cached_local_title(conn, cid, lang)

    if not local_title:
        local_title, qid = resolve_titles_and_qid(name_en, lang, qid_hint)
        if qid and (not qid_hint or qid_hint != qid):
            upsert_wikidata_id(conn, cid, qid)
        if local_title:
            upsert_local_title(conn, cid, lang, local_title)
    else:
        qid = qid_hint  # evtl. bereits gesetzt

    if not local_title:
        log.warning(f"[{name_en}][{lang}] Kein lokaler Titel gefunden – überspringe.")
        return

    log.info(f"→ {name_en} [{lang}] Titel: {local_title}  QID: {qid or '-'}")

    # Volltext-HTML holen
    html = fetch_parsoid_html(local_title, lang)
    if not html:
        # Fallback auf Action parse
        html = fetch_action_parse_html(local_title, lang)

    if not html:
        log.warning(f"[{name_en}][{lang}] Kein HTML erhalten.")
        return

    # Abschnitte extrahieren & mappen
    sections = split_sections_from_html(html, lang)

    # Übersicht/Lead sicherstellen (falls leer)
    if "overview" not in sections:
        summary, page_url = fetch_summary_plain(local_title, lang)
        if summary:
            sections["overview"] = f"<p>{summary}</p>"
    # Page-URL für source
    if "overview" in sections:
        _, page_url = fetch_summary_plain(local_title, lang)
    else:
        page_url = None

    # Speichern je Abschnitt (nur bekannte Keys)
    order = ["overview","geography","demography","history","politics","economy","transport","culture",
             "see_also","literature","external_links","notes","references"]
    for key in order:
        if key in sections and sections[key]:
            ctid = ct_ids.get(key)
            if not ctid:
                continue
            upsert_localized_html(conn, cid, lang, ctid, sections[key], page_url)

    # Wikidata-Fakten (rechte Spalte)
    if qid:
        facts = wikidata_facts(qid, lang)
        for k, v in facts.items():
            upsert_fact(conn, cid, lang, k, v)

    time.sleep(REQUEST_DELAY)

# ──────────────────────────────────────────────────────────────
# main
# ──────────────────────────────────────────────────────────────

def main():
    log.info("Starte Volltext-Import (Wikipedia + Wikidata)")

    with db() as conn:
        ensure_aux_schema(conn)
        ct_ids = load_content_type_ids(conn)
        countries = get_countries(conn)

        log.info(f"{len(countries)} Länder, Sprachen: {LANGS}")

        for i, country in enumerate(countries, start=1):
            log.info(f"[{i}/{len(countries)}] {country['name_en']} ({country['iso_code']})")
            for lang in LANGS:
                try:
                    import_one_country_language(conn, country, lang, ct_ids)
                except Exception as e:
                    log.error(f"Fehler bei {country['name_en']} [{lang}]: {e}")

    log.info("Fertig.")

if __name__ == "__main__":
    main()
