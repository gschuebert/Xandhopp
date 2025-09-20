"""
XNTOP Importer - Hauptskript (Volltext + Abschnitte + Tabellen)
- Holt pro Sprache den korrekten Wikipedia-Titel (Wikidata/Langlinks/Suche)
- Importiert Lead (section=0, HTML wie auf der Seite)
- Importiert gesamten Artikel (Parsoid HTML), splittet nach H2 in Abschnitte
- Behält Tabellen u. a. HTML-Elemente bei → Frontend (prose) rendert korrekt
- Importiert Bilder (Thumbnail/Best Image), Flaggen, Wappen, Fallback-Szenerien
"""

import os
import json
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Set, Optional, Tuple, List
from datetime import datetime
import time

import requests

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # Fallback: wir importieren dann nur Lead & Summary

from database import DatabaseManager
from wikipedia_api import WikipediaAPIClient
from countries_data import COUNTRIES_BY_CONTINENT, SUPPORTED_LANGUAGES, WIKIPEDIA_LANGUAGE_CODES

# ──────────────────────────────────────────────────────────────────────────────
# Environment Defaults
# ──────────────────────────────────────────────────────────────────────────────
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5433')
os.environ.setdefault('DB_NAME', 'xandhopp')
os.environ.setdefault('DB_USER', 'xandhopp')
os.environ.setdefault('DB_PASSWORD', 'xandhopp')

os.environ.setdefault('WIKIPEDIA_API_BASE', 'https://en.wikipedia.org/api/rest_v1')
os.environ.setdefault('WIKIPEDIA_TIMEOUT', '30')
os.environ.setdefault('WIKIPEDIA_MAX_RETRIES', '3')
os.environ.setdefault('WIKIPEDIA_BACKOFF_FACTOR', '2.0')
os.environ.setdefault('WIKIPEDIA_USER_AGENT', 'XNTOP/1.0 (https://xntop.app; contact@example.com)')

os.environ.setdefault('BATCH_SIZE', '10')
os.environ.setdefault('DELAY_BETWEEN_REQUESTS', '0.35')
os.environ.setdefault('MAX_WORKERS', '3')
os.environ.setdefault('LANGUAGES_PER_BATCH', '2')

# ──────────────────────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('xntop_importer.log'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Abschnitt-Aliase (Überschrift → Normal-Key)
# ──────────────────────────────────────────────────────────────────────────────
ALIASES = {
    "en": {
        "geography": ["geography", "location", "climate", "environment"],
        "demography": ["demography", "demographics", "population"],
        "history": ["history", "prehistory", "modern history"],
        "politics": ["politics", "government", "administration", "foreign relations"],
        "economy": ["economy", "economic", "industries", "finance"],
        "transport": ["transport", "transportation", "infrastructure"],
        "culture": ["culture", "arts", "media", "education", "religion", "sport"],
        "see_also": ["see also"],
        "literature": ["bibliography", "further reading"],
        "external_links": ["external links"],
        "notes": ["notes", "footnotes"],
        "references": ["references", "citations"],
    },
    "de": {
        "geography": ["geographie", "lage", "klima", "naturräumliche gliederung", "hydrologie", "flora und fauna"],
        "demography": ["bevölkerung", "demografie", "volksgruppen"],
        "history": ["geschichte", "vorgeschichte", "neuzeit"],
        "politics": ["politik", "staat", "verwaltung", "außenpolitik"],
        "economy": ["wirtschaft", "finanzen", "industrie"],
        "transport": ["verkehr", "infrastruktur"],
        "culture": ["kultur", "bildung", "religion", "medien", "sport"],
        "see_also": ["siehe auch"],
        "literature": ["literatur", "weiterführende literatur"],
        "external_links": ["weblinks"],
        "notes": ["anmerkungen"],
        "references": ["einzelnachweise", "referenzen", "belege"],
    },
    "es": {
        "geography": ["geografía", "ubicación", "clima", "medio ambiente"],
        "demography": ["demografía", "población"],
        "history": ["historia"],
        "politics": ["política", "gobierno"],
        "economy": ["economía"],
        "transport": ["transporte", "infraestructura"],
        "culture": ["cultura", "educación", "religión", "deporte", "arte"],
        "see_also": ["véase también"],
        "literature": ["bibliografía"],
        "external_links": ["enlaces externos"],
        "notes": ["notas"],
        "references": ["referencias"],
    },
    "zh": {
        "geography": ["地理", "地貌", "气候", "地理环境"],
        "demography": ["人口", "民族"],
        "history": ["历史"],
        "politics": ["政治", "政府", "行政"],
        "economy": ["经济"],
        "transport": ["交通", "基础设施", "基礎設施"],
        "culture": ["文化", "教育", "宗教", "体育", "藝術", "媒体"],
        "see_also": ["参见"],
        "literature": ["书目", "延伸阅读"],
        "external_links": ["外部链接"],
        "notes": ["注释"],
        "references": ["参考资料", "参考文献"],
    },
    "hi": {
        "geography": ["भूगोल", "स्थिति", "जलवायु"],
        "demography": ["जनसांख्यिकी", "जनसंख्या"],
        "history": ["इतिहास"],
        "politics": ["राजनीति", "सरकार"],
        "economy": ["अर्थव्यवस्था"],
        "transport": ["परिवहन", "बुनियादी ढाँचा"],
        "culture": ["संस्कृति", "शिक्षा", "धर्म", "खेल", "कला", "मीडिया"],
        "see_also": ["यह भी देखें"],
        "literature": ["साहित्य", "ग्रंथसूची"],
        "external_links": ["बाहरी कड़ियाँ"],
        "notes": ["टिप्पणियाँ"],
        "references": ["संदर्भ", "उद्धरण"],
    },
}

# ──────────────────────────────────────────────────────────────────────────────
# Progress Tracker
# ──────────────────────────────────────────────────────────────────────────────
class ProgressTracker:
    def __init__(self, progress_file: str = 'import_progress.json'):
        self.progress_file = progress_file
        self.completed_countries: Set[str] = set()
        self.completed_operations: Set[str] = set()  # "ISO:lang"
        self.start_time = None
        self.last_save = None
        self.load_progress()

    def load_progress(self):
        try:
            if os.path.exists(self.progress_file):
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.completed_countries = set(data.get('completed_countries', []))
                self.completed_operations = set(data.get('completed_operations', []))
                self.start_time = data.get('start_time')
                logger.info(f"Fortschritt geladen: {len(self.completed_countries)} Länder, {len(self.completed_operations)} Operationen")
        except Exception as e:
            logger.warning(f"Konnte Fortschritt nicht laden: {e}")

    def save_progress(self):
        try:
            data = {
                'completed_countries': list(self.completed_countries),
                'completed_operations': list(self.completed_operations),
                'start_time': self.start_time,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            self.last_save = datetime.now()
        except Exception as e:
            logger.error(f"Konnte Fortschritt nicht speichern: {e}")

    def is_country_completed(self, iso_code: str) -> bool:
        return iso_code in self.completed_countries

    def is_operation_completed(self, iso_code: str, lang_code: str) -> bool:
        return f"{iso_code}:{lang_code}" in self.completed_operations

    def mark_operation_completed(self, iso_code: str, lang_code: str):
        self.completed_operations.add(f"{iso_code}:{lang_code}")
        if len(self.completed_operations) % 10 == 0:
            self.save_progress()

    def mark_country_completed(self, iso_code: str):
        self.completed_countries.add(iso_code)
        self.save_progress()

    def start_import(self):
        if not self.start_time:
            self.start_time = datetime.now().isoformat()
            self.save_progress()

    def get_progress_summary(self, total_countries: int, total_operations: int) -> str:
        countries_pct = (len(self.completed_countries) / total_countries) * 100 if total_countries else 0
        operations_pct = (len(self.completed_operations) / total_operations) * 100 if total_operations else 0
        return (f"Fortschritt: {len(self.completed_countries)}/{total_countries} Länder ({countries_pct:.1f}%), "
                f"{len(self.completed_operations)}/{total_operations} Operationen ({operations_pct:.1f}%)")

# ──────────────────────────────────────────────────────────────────────────────
# XNTOP Importer
# ──────────────────────────────────────────────────────────────────────────────
class XNTOPImporter:
    def __init__(self):
        # DB
        self.db = DatabaseManager(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 5433)),
            database=os.getenv('DB_NAME', 'xandhopp'),
            user=os.getenv('DB_USER', 'xandhopp'),
            password=os.getenv('DB_PASSWORD', 'xandhopp')
        )

        # Wikipedia API Client (für Medien & Summary-Fallback)
        self.wikipedia = WikipediaAPIClient(
            base_url=os.getenv('WIKIPEDIA_API_BASE', 'https://en.wikipedia.org/api/rest_v1'),
            timeout=int(os.getenv('WIKIPEDIA_TIMEOUT', 30)),
            max_retries=int(os.getenv('WIKIPEDIA_MAX_RETRIES', 3)),
            backoff_factor=float(os.getenv('WIKIPEDIA_BACKOFF_FACTOR', 2.0))
        )

        # HTTP
        self.UA = os.getenv('WIKIPEDIA_USER_AGENT', 'XNTOP/1.0 (https://xntop.app; contact@example.com)')
        self.timeout = int(os.getenv('WIKIPEDIA_TIMEOUT', 30))

        # Konfiguration
        self.batch_size = int(os.getenv('BATCH_SIZE', 10))
        self.delay_between_requests = float(os.getenv('DELAY_BETWEEN_REQUESTS', 0.35))
        self.max_workers = int(os.getenv('MAX_WORKERS', 3))
        self.languages_per_batch = int(os.getenv('LANGUAGES_PER_BATCH', 2))

        # Stats
        self.stats = {
            'countries_processed': 0,
            'languages_processed': 0,
            'contents_imported': 0,
            'media_imported': 0,
            'errors': 0
        }

        # Progress
        self.progress = ProgressTracker()

        # Performance
        self._last_request_time = 0

        # Content-Type-IDs (gefüllt bei setup_database)
        self.content_type_ids: Dict[str, int] = {}

    # ──────────────────────────────────────────────────────────────────────
    # Setup
    # ──────────────────────────────────────────────────────────────────────
    def setup_database(self) -> int:
        """Initialisiert Sprachen + Content-Types"""
        logger.info("Initialisiere Datenbank.")

        for code, name in SUPPORTED_LANGUAGES.items():
            self.db.upsert_language(code, name)

        # Alle benötigten Content-Typen
        needed_types = [
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
        for key, name_en in needed_types:
            self.db.upsert_content_type(key, name_en)

        # Map IDs laden
        self.content_type_ids = self._load_content_type_ids()
        return self.content_type_ids["overview"]

    def _load_content_type_ids(self) -> Dict[str, int]:
        # einfache Hilfsabfrage über DatabaseManager wäre besser; hier minimalistisch:
        # Wir nehmen an, DatabaseManager hat bereits eine Methode upsert + evtl. get_id.
        # Wenn nicht vorhanden, hinterlegen wir ein statisches Mapping in DB-Seite.
        # Für jetzigen Kontext: wir holen sie pragmatisch über private Connection:
        with self.db.connection.cursor() as cur:
            cur.execute("SELECT id, key FROM content_types")
            rows = cur.fetchall()
        return {k: i for i, k in rows}

    # ──────────────────────────────────────────────────────────────────────
    # Rate Limiting
    # ──────────────────────────────────────────────────────────────────────
    def _rate_limited_request(self):
        now = time.time()
        elapsed = now - self._last_request_time
        if elapsed < self.delay_between_requests:
            time.sleep(self.delay_between_requests - elapsed)
        self._last_request_time = time.time()

    # ──────────────────────────────────────────────────────────────────────
    # Wikipedia Helpers (Titel, HTML, Lead)
    # ──────────────────────────────────────────────────────────────────────
    # --- REPLACE in main.py ---

    def _req_json(self, url: str, params=None) -> Tuple[Optional[Dict], int]:
        """HTTP GET → JSON oder None + Status. Loggt Status != 200."""
        self._rate_limited_request()
        try:
            r = requests.get(
                url, params=params,
                headers={"User-Agent": self.UA, "Accept": "application/json"},
                timeout=self.timeout
            )
            if r.status_code != 200:
                logger.warning(f"Wikipedia JSON {r.status_code} for {r.url}")
                return None, r.status_code
            try:
                return r.json(), r.status_code
            except ValueError:
                logger.warning(f"Wikipedia JSON parse error for {r.url}")
                return None, r.status_code
        except requests.RequestException as e:
            logger.warning(f"HTTP error: {e} for {url}")
            return None, 0

    def _req_text(self, url: str, params=None, accept: str = "text/html") -> Tuple[Optional[str], int]:
        """HTTP GET → Text oder None + Status. Loggt Status != 200."""
        self._rate_limited_request()
        try:
            r = requests.get(
                url, params=params,
                headers={"User-Agent": self.UA, "Accept": accept},
                timeout=self.timeout
            )
            if r.status_code != 200:
                logger.warning(f"Wikipedia TEXT {r.status_code} for {r.url}")
                return None, r.status_code
            return r.text, r.status_code
        except requests.RequestException as e:
            logger.warning(f"HTTP error: {e} for {url}")
            return None, 0

    def _get_qid_from_title(self, title: str, lang: str) -> Optional[str]:
        if not title:
            return None
        url = f"https://{lang}.wikipedia.org/w/api.php"
        params = {"action": "query", "format": "json", "prop": "pageprops", "redirects": 1, "titles": title}
        data, _ = self._req_json(url, params)
        if not data or "query" not in data:
            return None
        pages = data["query"].get("pages") or {}
        if not pages:
            return None
        page = next(iter(pages.values()), {}) or {}
        pp = page.get("pageprops") or {}
        return pp.get("wikibase_item")

    def _resolve_title_and_qid(self, country_en: str, lang: str, qid_hint: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        """Sicher & defensiv: QID und lokaler Titel, ohne auf None zu indexieren."""
        qid = qid_hint
        if not qid:
            # versuche direkten Treffer in enwiki
            direct_qid = self._get_qid_from_title(country_en, "en")
            if not direct_qid:
                # Suche nach bestem enwiki-Titel und nochmal probieren
                en_best = self._search_title("en", country_en) or country_en
                direct_qid = self._get_qid_from_title(en_best, "en")
            qid = direct_qid

        local_title = None
        if qid:
            local_title = self._get_local_title_via_wikidata(qid, lang)

        if not local_title:
            en_best = self._search_title("en", country_en) or country_en
            local_title = self._get_local_title_via_langlinks(en_best, "en", lang)

        if not local_title:
            local_title = self._search_title(lang, country_en)

        if not local_title:
            logger.warning(f"[TitleResolve] Kein lokaler Titel: base='{country_en}' lang='{lang}' qid={qid}")
        else:
            logger.debug(f"[TitleResolve] {country_en} → '{local_title}' ({lang}), QID={qid or '-'}")

        return local_title, qid

    def _fetch_lead_section_html(self, title: str, lang: str) -> Optional[str]:
        """Lead exakt wie auf der Seite (section=0, HTML) – defensiv gegen leere JSONs."""
        if not title:
            return None
        url = f"https://{lang}.wikipedia.org/w/api.php"
        params = {
            "action": "parse", "format": "json", "prop": "text",
            "section": "0", "page": title, "redirects": 1
        }
        data, status = self._req_json(url, params)
        if not data or "parse" not in data:
            logger.warning(f"[Lead] no data/parse for {lang}:{title} (status {status})")
            return None
        text_block = data["parse"].get("text") or {}
        lead_html = text_block.get("*")
        if not lead_html:
            logger.warning(f"[Lead] empty text for {lang}:{title}")
        return lead_html

    def _fetch_parsoid_html(self, title: str, lang: str) -> Optional[str]:
        """Ganzer Artikel (Parsoid HTML) – 403/404 werden geloggt, aber kein Crash."""
        if not title:
            return None
        url = f"https://{lang}.wikipedia.org/api/rest_v1/page/html/{title}"
        html, status = self._req_text(url, accept="text/html")
        if status == 403:
            logger.warning(f"[Parsoid] 403 for {lang}:{title}")
            return None
        if not html:
            logger.warning(f"[Parsoid] empty for {lang}:{title} (status {status})")
        return html


    # ──────────────────────────────────────────────────────────────────────
    # HTML → Abschnitte
    # ──────────────────────────────────────────────────────────────────────
    def _normalize_section_key(self, heading: str, lang: str) -> str:
        t = (heading or "").lower().strip()
        table = ALIASES.get(lang, ALIASES["en"])
        for key, names in table.items():
            for n in names:
                if t.startswith(n):
                    return key
        return "other"

    def _split_sections_from_html(self, html: str, lang: str) -> Dict[str, str]:
        """Zerlegt komplettes Parsoid-HTML in Abschnitte; behält Tabellen & Co."""
        if not BeautifulSoup:
            # Fallback: ohne BS4 nur Overview leer lassen; Rest nicht verfügbar
            return {}
        soup = BeautifulSoup(html, "html.parser")

        # Lead aus Parsoid: alle „Top-Level“-Elemente bis zum ersten H2
        def _lead_from_parsoid() -> str:
            out: List[str] = []
            for el in soup.find_all(recursive=False):
                name = (getattr(el, "name", "") or "").lower()
                if name == "h2":
                    break
                if name in {"p", "ul", "ol", "table", "div", "figure", "blockquote"}:
                    out.append(str(el))
            return "\n".join(out).strip()

        sections: Dict[str, str] = {}
        current: Optional[str] = None
        buf: List[str] = []

        for node in soup.find_all(["h2", "p", "ul", "ol", "table", "div", "figure", "h3", "blockquote"]):
            name = (getattr(node, "name", "") or "").lower()
            if name == "h2":
                # vorherigen Abschnitt ablegen
                if current:
                    chunk = "\n".join(buf).strip()
                    if chunk:
                        sections[current] = chunk
                buf = []
                title = node.get_text(" ").strip()
                current = self._normalize_section_key(title, lang)
                continue
            if current:
                buf.append(str(node))

        if current:
            chunk = "\n".join(buf).strip()
            if chunk:
                sections[current] = chunk

        # Lead nur setzen, wenn wir ihn nicht separat aus parse holen
        lead = _lead_from_parsoid()
        if lead and "overview" not in sections:
            sections["overview"] = lead

        return sections

    # ──────────────────────────────────────────────────────────────────────
    # Kern: Import pro Sprache
    # ──────────────────────────────────────────────────────────────────────
    def _process_language_for_country(
        self, country_id: int, country_name: str, iso_code: str, wikipedia_slug: str,
        lang_code: str, lang_name: str, overview_type_id: int, qid_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            if self.progress.is_operation_completed(iso_code, lang_code):
                return {'status': 'skipped', 'lang_code': lang_code, 'reason': 'already_completed'}

            wiki_lang = WIKIPEDIA_LANGUAGE_CODES.get(lang_code, lang_code)

            # 1) Korrekte Seitentitel + QID
            local_title, qid = self._resolve_title_and_qid(country_name, wiki_lang, qid_hint)
            if not local_title:
                self.db.log_sync(country_id, lang_code, 'wikipedia', 'no_title')
                return {'status': 'no_data', 'lang_code': lang_code}

            # 2) Lead 1:1 (section=0, HTML)
            lead_html = self._fetch_lead_section_html(local_title, wiki_lang)

            # 3) Gesamter Artikel (Parsoid HTML) → Abschnitte
            sections: Dict[str, str] = {}
            parsoid_html = self._fetch_parsoid_html(local_title, wiki_lang)
            if parsoid_html:
                sections = self._split_sections_from_html(parsoid_html, wiki_lang)

            # Lead sicherstellen/überschreiben (Lead aus parse ist „gold standard“)
            if lead_html:
                sections["overview"] = lead_html

            if not sections and not lead_html:
                # Fallback: alter Summary-Client
                wiki_data = self.wikipedia.get_country_data(local_title, wiki_lang)
                if wiki_data and wiki_data.get('extract'):
                    sections["overview"] = f"<p>{wiki_data['extract']}</p>"

            if not sections:
                self.db.log_sync(country_id, lang_code, 'wikipedia', 'no_content')
                return {'status': 'no_data', 'lang_code': lang_code}

            # 4) Speichern (Overview + bekannte Keys)
            page_url = None
            try:
                w = self.wikipedia.get_country_data(local_title, wiki_lang)
                if w and isinstance(w, dict):
                    page_url = (w.get("content_urls", {}) or {}).get("desktop", {}).get("page") or w.get("page_url")
            except Exception:
                pass

            order = [
                "overview", "geography", "demography", "history", "politics",
                "economy", "transport", "culture", "see_also", "literature", "external_links", "notes", "references"
            ]
            for key in order:
                html = sections.get(key)
                if not html:
                    continue
                ctid = self.content_type_ids.get(key)
                if not ctid:
                    continue
                self.db.upsert_localized_content(
                    country_id=country_id,
                    language_code=lang_code,
                    content_type_id=ctid,
                    content=html,               # HTML inkl. Tabellen, Listen, Bilder-Wrapper etc.
                    source_url=page_url or f"https://{wiki_lang}.wikipedia.org/wiki/{local_title.replace(' ', '_')}"
                )
                self.stats['contents_imported'] += 1

            # 5) Medien (Thumbnail / best image) – wie bisher
            wiki_data_for_media = self.wikipedia.get_country_data(local_title, wiki_lang)
            media_imported = 0
            if wiki_data_for_media:
                if wiki_data_for_media.get('thumbnail'):
                    media_id = self.db.upsert_media_asset(
                        country_id=country_id,
                        language_code=lang_code,
                        title=f"Thumbnail für {country_name}",
                        asset_type='thumbnail',
                        url=wiki_data_for_media['thumbnail'],
                        attribution='Wikipedia',
                        source_url=wiki_data_for_media.get('page_url', '')
                    )
                    if media_id:
                        media_imported += 1
                if wiki_data_for_media.get('image_url'):
                    media_id = self.db.upsert_media_asset(
                        country_id=country_id,
                        language_code=lang_code,
                        title=f"Bild für {country_name}",
                        asset_type='image',
                        url=wiki_data_for_media['image_url'],
                        attribution='Wikipedia',
                        source_url=wiki_data_for_media.get('page_url', '')
                    )
                    if media_id:
                        media_imported += 1

            # 6) Zusatzbilder (Flagge/Wappen/Fallback)
            try:
                self.import_additional_images(country_id, country_name, lang_code)
            except Exception as e:
                logger.debug(f"Zusatzbilder-Fehler {country_name} ({lang_code}): {e}")

            self.db.log_sync(country_id, lang_code, 'wikipedia', 'success')
            return {'status': 'success', 'lang_code': lang_code, 'media_imported': media_imported}

        except Exception as e:
            logger.error(f"Fehler beim Import von {country_name} ({lang_code}): {e}")
            self.db.log_sync(country_id, lang_code, 'wikipedia', 'error')
            return {'status': 'error', 'lang_code': lang_code, 'error': str(e)}

    # ──────────────────────────────────────────────────────────────────────
    # Country Import (alle Sprachen)
    # ──────────────────────────────────────────────────────────────────────
    def import_country_data(self, country_data: Dict[str, Any], continent: str, overview_type_id: int):
        country_name = country_data['name']
        iso_code = country_data['iso']
        wikipedia_slug = country_data.get('wikipedia_slug') or country_name.replace(' ', '_')

        if self.progress.is_country_completed(iso_code):
            logger.info(f"Überspringe {country_name} ({iso_code}) - bereits abgeschlossen")
            return

        logger.info(f"Importiere {country_name} ({iso_code}) aus {continent}")

        # Land upserten
        country_id = self.db.upsert_country(
            iso_code=iso_code,
            name_en=country_name,
            continent=continent,
            has_subregions=False,
            slug_en=wikipedia_slug.lower().replace(' ', '-'),
            slug_de=wikipedia_slug.lower().replace(' ', '-')
        )
        self.stats['countries_processed'] += 1

        # Sprachen
        language_items = list(SUPPORTED_LANGUAGES.items())

        # Bereits erledigte entfernen
        remaining_languages = [(code, name) for code, name in language_items if not self.progress.is_operation_completed(iso_code, code)]
        if not remaining_languages:
            self.progress.mark_country_completed(iso_code)
            return

        # Nebenläufig
        with ThreadPoolExecutor(max_workers=min(self.languages_per_batch, len(remaining_languages))) as executor:
            futures = []
            for lang_code, lang_name in remaining_languages:
                futures.append(executor.submit(
                    self._process_language_for_country,
                    country_id, country_name, iso_code, wikipedia_slug,
                    lang_code, lang_name, overview_type_id
                ))

            for idx, fut in enumerate(futures, start=1):
                try:
                    result = fut.result()
                    self.stats['languages_processed'] += 1
                    st = result.get('status')
                    lc = result.get('lang_code')
                    if st == 'success':
                        self.progress.mark_operation_completed(iso_code, lc)
                        logger.info(f"  ✓ {lang_code} importiert")
                    elif st in ('no_data', 'skipped'):
                        self.progress.mark_operation_completed(iso_code, lc)
                        logger.warning(f"  ⚠ {lang_code}: {st}")
                    else:
                        self.stats['errors'] += 1
                        logger.error(f"  ✗ {lang_code}: {result.get('error', 'error')}")
                except Exception as e:
                    self.stats['errors'] += 1
                    logger.error(f"  ✗ Unerwarteter Fehler: {e}")

        # Land abschließen, wenn alle Sprachen erledigt
        done = all(self.progress.is_operation_completed(iso_code, code) for code in SUPPORTED_LANGUAGES.keys())
        if done:
            self.progress.mark_country_completed(iso_code)
            logger.info(f"Land {country_name} ({iso_code}) vollständig abgeschlossen")

    # ──────────────────────────────────────────────────────────────────────
    # Medien (wie zuvor)
    # ──────────────────────────────────────────────────────────────────────
    def import_additional_images(self, country_id: int, country_name: str, lang_code: str):
        try:
            iso_code = self.get_iso_code_for_country(country_name)
            if iso_code:
                flag_url = f"https://flagcdn.com/w320/{iso_code.lower()}.png"
                media_id = self.db.upsert_media_asset(
                    country_id=country_id, language_code=lang_code,
                    title=f"Flagge von {country_name}", asset_type='flag',
                    url=flag_url, attribution='FlagCDN', source_url=f"https://flagcdn.com/{iso_code.lower()}"
                )
                if media_id:
                    self.stats['media_imported'] += 1

            coat_url = self.get_coat_of_arms_url(country_name, lang_code)
            if coat_url:
                media_id = self.db.upsert_media_asset(
                    country_id=country_id, language_code=lang_code,
                    title=f"Wappen von {country_name}", asset_type='coat_of_arms',
                    url=coat_url, attribution='Wikipedia Commons', source_url="https://commons.wikimedia.org"
                )
                if media_id:
                    self.stats['media_imported'] += 1

            if not self.has_scenic_images(country_id, lang_code):
                fallback_url = self.get_fallback_scenic_image(country_name)
                if fallback_url:
                    media_id = self.db.upsert_media_asset(
                        country_id=country_id, language_code=lang_code,
                        title=f"Landschaftsbild von {country_name}", asset_type='scenic',
                        url=fallback_url, attribution='Unsplash', source_url="https://unsplash.com"
                    )
                    if media_id:
                        self.stats['media_imported'] += 1

        except Exception as e:
            logger.debug(f"Fehler bei Zusatzbildern {country_name}: {e}")

    # (Mapping & Fallback-Bilder wie in deiner Version unverändert)
    def get_iso_code_for_country(self, country_name: str) -> str:
        iso_mapping = {
            'Germany': 'DE', 'Austria': 'AT', 'Switzerland': 'CH', 'France': 'FR', 'Italy': 'IT', 'Spain': 'ES',
            'United Kingdom': 'GB', 'Netherlands': 'NL', 'Belgium': 'BE', 'Poland': 'PL', 'Czech Republic': 'CZ',
            'Hungary': 'HU', 'Portugal': 'PT', 'Greece': 'GR', 'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK',
            'Finland': 'FI', 'Ireland': 'IE', 'Croatia': 'HR', 'Slovenia': 'SI', 'Slovakia': 'SK', 'Estonia': 'EE',
            'Montenegro': 'ME',
            'Latvia': 'LV', 'Lithuania': 'LT', 'Luxembourg': 'LU', 'Malta': 'MT', 'Cyprus': 'CY', 'Bulgaria': 'BG',
            'Romania': 'RO', 'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX', 'Brazil': 'BR', 'Argentina': 'AR',
            'Chile': 'CL', 'Australia': 'AU', 'New Zealand': 'NZ', 'Japan': 'JP', 'China': 'CN', 'India': 'IN',
            'Russia': 'RU', 'South Africa': 'ZA', 'Egypt': 'EG', 'Nigeria': 'NG', 'Algeria': 'DZ', 'Angola': 'AO',
            'Benin': 'BJ', 'Botswana': 'BW', 'Burkina Faso': 'BF', 'Burundi': 'BI', 'Cameroon': 'CM',
            'Cape Verde': 'CV', 'Chad': 'TD', 'Comoros': 'KM', 'Democratic Republic of the Congo': 'CD',
            'Republic of the Congo': 'CG', 'Djibouti': 'DJ', 'Equatorial Guinea': 'GQ', 'Eritrea': 'ER',
            'Eswatini': 'SZ', 'Ethiopia': 'ET', 'Gabon': 'GA', 'Gambia': 'GM', 'Ghana': 'GH', 'Guinea': 'GN',
            'Guinea-Bissau': 'GW', 'Ivory Coast': 'CI', 'Kenya': 'KE', 'Lesotho': 'LS', 'Liberia': 'LR', 'Libya': 'LY',
            'Madagascar': 'MG', 'Malawi': 'MW', 'Mali': 'ML', 'Mauritania': 'MR', 'Mauritius': 'MU', 'Morocco': 'MA',
            'Mozambique': 'MZ', 'Namibia': 'NA', 'Niger': 'NE', 'Rwanda': 'RW', 'São Tomé and Príncipe': 'ST',
            'Senegal': 'SN', 'Seychelles': 'SC', 'Sierra Leone': 'SL', 'Somalia': 'SO', 'South Sudan': 'SS',
            'Sudan': 'SD', 'Tanzania': 'TZ', 'Togo': 'TG', 'Tunisia': 'TN', 'Uganda': 'UG', 'Zambia': 'ZM', 'Zimbabwe': 'ZW'
        }
        return iso_mapping.get(country_name, '')

    def get_coat_of_arms_url(self, country_name: str, lang_code: str) -> str:
        coat_mapping = {
            'Germany': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Coat_of_arms_of_Germany.svg/200px-Coat_of_arms_of_Germany.svg.png',
            'Austria': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Coat_of_arms_of_Austria.svg/200px-Coat_of_arms_of_Austria.svg.png',
            'France': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Coat_of_arms_of_France.svg/200px-Coat_of_arms_of_France.svg.png',
            'Italy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Coat_of_arms_of_Italy.svg/200px-Coat_of_arms_of_Italy.svg.png',
            'Spain': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Coat_of_Arms_of_Spain.svg/200px-Coat_of_Arms_of_Spain.svg.png',
            'United Kingdom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Royal_Coat_of_Arms_of_the_United_Kingdom.svg/200px-Royal_Coat_of_Arms_of_the_United_Kingdom.svg.png',
            'Montenegro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Coat_of_arms_of_Montenegro.svg/200px-Coat_of_arms_of_Montenegro.svg.png'
        }
        return coat_mapping.get(country_name, '')

    def has_scenic_images(self, country_id: int, lang_code: str) -> bool:
        return False

    def get_fallback_scenic_image(self, country_name: str) -> str:
        return 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80'

    # ──────────────────────────────────────────────────────────────────────
    # All Countries
    # ──────────────────────────────────────────────────────────────────────
    def import_all_countries(self):
        logger.info("Starte Import aller Länder.")
        self.progress.start_import()
        overview_type_id = self.setup_database()

        continents = {k: v for k, v in COUNTRIES_BY_CONTINENT.items() if k.lower() != 'antarctica'}
        total_countries = sum(len(v) for v in continents.values())
        total_operations = total_countries * len(SUPPORTED_LANGUAGES)

        logger.info(f"Importiere {total_countries} Länder in {len(SUPPORTED_LANGUAGES)} Sprachen (gesamt {total_operations} Operationen)")
        logger.info(self.progress.get_progress_summary(total_countries, total_operations))

        processed = 0
        for continent, countries in continents.items():
            logger.info(f"\n=== Importiere {continent} ({len(countries)} Länder) ===")
            for country_data in countries:
                iso_code = country_data['iso']
                if self.progress.is_country_completed(iso_code):
                    processed += 1
                    continue
                try:
                    with self.db.connection:
                        self.import_country_data(country_data, continent, overview_type_id)
                    processed += 1
                    if processed % 5 == 0:
                        logger.info(self.progress.get_progress_summary(total_countries, total_operations))
                except Exception as e:
                    logger.error(f"Fehler beim Import von {country_data.get('name', '?')}: {e}")
                    self.stats['errors'] += 1

        self.progress.save_progress()
        logger.info("\n=== Import abgeschlossen ===")
        logger.info(self.progress.get_progress_summary(total_countries, total_operations))
        self.print_statistics()

    # ──────────────────────────────────────────────────────────────────────
    # Stats
    # ──────────────────────────────────────────────────────────────────────
    def print_statistics(self):
        logger.info("=== IMPORT-STATISTIKEN ===")
        logger.info(f"Länder verarbeitet: {self.stats['countries_processed']}")
        logger.info(f"Sprachen verarbeitet: {self.stats['languages_processed']}")
        logger.info(f"Inhalte importiert: {self.stats['contents_imported']}")
        logger.info(f"Medien importiert: {self.stats['media_imported']}")
        logger.info(f"Fehler: {self.stats['errors']}")

    # ──────────────────────────────────────────────────────────────────────
    # Run
    # ──────────────────────────────────────────────────────────────────────
    def run(self):
        try:
            self.db.connect()
            self.import_all_countries()
        except Exception as e:
            logger.error(f"Kritischer Fehler: {e}")
            raise
        finally:
            self.db.disconnect()


def main():
    logger.info("XNTOP Importer gestartet")
    importer = XNTOPImporter()
    importer.run()
    logger.info("XNTOP Importer beendet")


if __name__ == "__main__":
    main()
