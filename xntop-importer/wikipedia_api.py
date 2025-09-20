# wikipedia_api.py
import os
import time
import logging
import random
from typing import Optional, Dict, Tuple
import requests

logger = logging.getLogger("wikipedia_api")

RETRYABLE_STATUS = {429, 500, 502, 503, 504}

def _ua():
    # Muss aussagekräftig sein (Projekt + Kontakt). Sonst drohen 403.
    return os.getenv("WIKIPEDIA_USER_AGENT", "XNTOP/1.0 (https://example.com; contact@example.com)")

class WikipediaAPIClient:
    """
    Holt:
      - extract (Text)
      - thumbnail (kleines Bild)
      - image_url (bestmögliches Bild)
      - page_url (kanonische URL)
    Strategie:
      1) REST /page/summary + /page/media-list
      2) Fallback: Action API (extracts|pageimages)
    """
    def __init__(self, base_url: str, timeout: int = 30, max_retries: int = 3, backoff_factor: float = 2.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": _ua(),
            "Accept": "application/json"
        })
        # Circuit breaker state
        self.consecutive_failures = 0
        self.max_consecutive_failures = 5
        self.circuit_breaker_timeout = 60  # seconds

    def delay_request(self, seconds: float):
        if seconds and seconds > 0:
            time.sleep(seconds)

    def _calculate_backoff(self, attempt: int, base_delay: float = None) -> float:
        """Calculate exponential backoff with jitter"""
        if base_delay is None:
            base_delay = self.backoff_factor ** attempt
        # Add jitter (random factor between 0.5 and 1.5)
        jitter = random.uniform(0.5, 1.5)
        return min(base_delay * jitter, 30.0)  # Max 30 seconds

    def _should_circuit_break(self) -> bool:
        """Check if circuit breaker should activate"""
        return self.consecutive_failures >= self.max_consecutive_failures

    def _reset_circuit_breaker(self):
        """Reset circuit breaker on successful request"""
        self.consecutive_failures = 0

    def _lang_base(self, lang: str) -> str:
        return f"https://{lang}.wikipedia.org/api/rest_v1"

    def _request_json(self, url: str, params=None, extra_headers=None) -> Tuple[Optional[Dict], Optional[int]]:
        # Circuit breaker check
        if self._should_circuit_break():
            logger.warning(f"Circuit breaker active, skipping request to {url}")
            return None, None
            
        headers = {}
        if extra_headers:
            headers.update(extra_headers)
            
        for attempt in range(1, self.max_retries + 1):
            try:
                r = self.session.get(url, params=params, headers=headers, timeout=self.timeout)
                status = r.status_code
                
                if status == 200:
                    self._reset_circuit_breaker()  # Success resets circuit breaker
                    return r.json(), status
                    
                if status not in RETRYABLE_STATUS:
                    self.consecutive_failures += 1
                    # Only log 404 as warning for non-media endpoints
                    if status == 404 and '/page/media-list/' in r.url:
                        logger.debug(f"Media-list not found (404): {r.url}")
                    else:
                        logger.warning(f"Request failed: {status} {r.reason} for url: {r.url}")
                    return None, status
                    
                # Retryable error - use improved backoff
                sleep = self._calculate_backoff(attempt)
                logger.warning(f"Request failed: {status} {r.reason} for url: {r.url} – retry in {sleep:.1f}s (attempt {attempt}/{self.max_retries})")
                time.sleep(sleep)
                
            except requests.RequestException as e:
                self.consecutive_failures += 1
                if attempt >= self.max_retries:
                    logger.error(f"HTTP error after {attempt} attempts: {e}")
                    return None, None
                sleep = self._calculate_backoff(attempt)
                logger.warning(f"Request exception: {e} – retry in {sleep:.1f}s (attempt {attempt}/{self.max_retries})")
                time.sleep(sleep)
                
        self.consecutive_failures += 1
        return None, None

    # ---------- REST ----------
    def _rest_summary(self, title: str, lang: str) -> Tuple[Optional[Dict], Optional[int]]:
        # URL-encode the title to handle special characters
        from urllib.parse import quote
        encoded_title = quote(title.replace(' ', '_'), safe='')
        url = f"{self._lang_base(lang)}/page/summary/{encoded_title}"
        return self._request_json(url)

    def _rest_media_list(self, title: str, lang: str) -> Tuple[Optional[Dict], Optional[int]]:
        # URL-encode the title to handle special characters
        from urllib.parse import quote
        encoded_title = quote(title.replace(' ', '_'), safe='')
        url = f"{self._lang_base(lang)}/page/media-list/{encoded_title}"
        return self._request_json(url)

    def _pick_best_image_from_media(self, media_json: Dict) -> Optional[str]:
        if not media_json or "items" not in media_json:
            return None
        for item in media_json["items"]:
            if item.get("type") == "image":
                srcset = item.get("srcset") or []
                if srcset:
                    def key_fn(s):
                        return s.get("width", s.get("scale", 0))
                    best = max(srcset, key=key_fn)
                    return best.get("src") or item.get("src")
                return item.get("src")
        return None

    # ---------- Action API (Fallback) ----------
    def _action_extracts(self, title: str, lang: str) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[int]]:
        """
        Liefert (extract, thumb_url, page_url, status)
        """
        url = f"https://{lang}.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "prop": "extracts|pageimages|info",
            "exintro": 1,
            "explaintext": 1,
            "redirects": 1,
            "pithumbsize": 1200,
            "inprop": "url",
            "titles": title
        }
        data, status = self._request_json(url, params=params)
        if not data:
            return None, None, None, status
        pages = data.get("query", {}).get("pages", {})
        if not pages:
            return None, None, None, status
        page = next(iter(pages.values()))
        extract = page.get("extract")
        thumb = (page.get("thumbnail") or {}).get("source")
        page_url = page.get("fullurl")
        return extract, thumb, page_url, status

    # ---------- Public ----------
    def get_country_data(self, title: str, lang: str) -> Optional[Dict]:
        # 1) REST summary (mit _ und mit Leerzeichen)
        data, status = self._rest_summary(title, lang)
        if (not data or "title" not in data) and status != 403:
            # Fallback: Summary mit Spaces
            title2 = title.replace("_", " ")
            data, status = self._rest_summary(title2, lang)

        # 2) Falls REST nicht geht oder 403 → Action API Fallback
        if not data or "title" not in data or status == 403:
            # Erst mit originalem title, sonst mit Spaces
            extract, thumb, page_url, s1 = self._action_extracts(title, lang)
            if not extract:
                extract, thumb, page_url, s2 = self._action_extracts(title.replace("_", " "), lang)
                if not extract:
                    return None
            # Kein „originalimage“ hier; belasse image_url=thumb
            return {
                "extract": extract,
                "thumbnail": thumb,
                "image_url": thumb,
                "page_url": page_url
            }

        # 3) REST hat geklappt → optional Medienliste
        extract = data.get("extract")
        thumb = (data.get("thumbnail") or {}).get("source")
        original = (data.get("originalimage") or {}).get("source")
        page_url = (data.get("content_urls", {}).get("desktop") or {}).get("page")
        
        # Media-list versuchen (nicht kritisch, 404 ist normal)
        ml, status = self._rest_media_list(data.get("title", title), lang)
        best = None
        if ml:
            best = self._pick_best_image_from_media(ml)
        elif status == 404:
            # 404 für media-list ist normal, nicht als Fehler loggen
            logger.debug(f"Media-list not found for {title} in {lang} (404 - normal)")
        
        image_url = best or original or thumb

        return {
            "extract": extract,
            "thumbnail": thumb,
            "image_url": image_url,
            "page_url": page_url
        }