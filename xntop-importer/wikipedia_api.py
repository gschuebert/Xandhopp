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

    def _rest_html_content(self, title: str, lang: str) -> Tuple[Optional[str], Optional[int]]:
        """Fetch full HTML content from Wikipedia Parsoid API"""
        from urllib.parse import quote
        encoded_title = quote(title.replace(' ', '_'), safe='')
        url = f"{self._lang_base(lang)}/page/html/{encoded_title}"
        
        try:
            response = self.session.get(url, timeout=self.timeout)
            if response.status_code == 200:
                return response.text, response.status_code
            elif response.status_code == 403:
                # Parsoid might be blocked, return None to use fallback
                logger.debug(f"Parsoid API blocked for {title} ({lang})")
                return None, response.status_code
            else:
                logger.warning(f"Failed to fetch HTML content for {title}: {response.status_code}")
                return None, response.status_code
        except Exception as e:
            logger.error(f"Error fetching HTML content for {title}: {e}")
            return None, 0

    def _extract_first_paragraph_from_html(self, html_content: str) -> Optional[str]:
        """Extract the first paragraph from HTML content"""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Find the first paragraph in the main content
            # Look for paragraphs in the main content area
            content_div = soup.find('div', {'class': 'mw-parser-output'}) or soup.find('div', {'class': 'mw-content-ltr'})
            if content_div:
                # Find the first paragraph that's not empty and not a redirect
                paragraphs = content_div.find_all('p')
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 50 and not text.startswith('Weiterleitung'):
                        return text
            
            # Fallback: find any paragraph
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                text = p.get_text(strip=True)
                if text and len(text) > 50:
                    return text
                    
            return None
        except Exception as e:
            logger.error(f"Error extracting first paragraph from HTML: {e}")
            return None

    def _rest_media_list(self, title: str, lang: str) -> Tuple[Optional[Dict], Optional[int]]:
        # URL-encode the title to handle special characters
        from urllib.parse import quote
        encoded_title = quote(title.replace(' ', '_'), safe='')
        url = f"{self._lang_base(lang)}/page/media-list/{encoded_title}"
        return self._request_json(url)

    def _pick_best_image_from_media(self, media_json: Dict) -> Optional[str]:
        if not media_json or not isinstance(media_json, dict) or "items" not in media_json:
            return None
        items = media_json.get("items", [])
        if not items or not isinstance(items, list):
            return None
        for item in items:
            if not item or not isinstance(item, dict):
                continue
            if item.get("type") == "image":
                srcset = item.get("srcset")
                if srcset and isinstance(srcset, list):
                    try:
                        def key_fn(s):
                            if not s or not isinstance(s, dict):
                                return 0
                            return s.get("width", s.get("scale", 0))
                        best = max(srcset, key=key_fn)
                        if best and isinstance(best, dict):
                            return best.get("src") or item.get("src")
                    except (ValueError, TypeError):
                        pass
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
        query_data = data.get("query", {})
        if not query_data:
            return None, None, None, status
        pages = query_data.get("pages", {})
        if not pages:
            return None, None, None, status
        try:
            page = next(iter(pages.values()))
        except StopIteration:
            return None, None, None, status
        if not page:
            return None, None, None, status
        extract = page.get("extract")
        
        # Safe thumbnail extraction
        thumb = None
        thumbnail_data = page.get("thumbnail")
        if thumbnail_data and isinstance(thumbnail_data, dict):
            thumb = thumbnail_data.get("source")
        
        page_url = page.get("fullurl")
        return extract, thumb, page_url, status

    # ---------- Public ----------
    def get_country_data(self, title: str, lang: str) -> Optional[Dict]:
        # 1) Try to get full HTML content first for better overview text
        html_content, html_status = self._rest_html_content(title, lang)
        if html_content and html_status == 200:
            full_extract = self._extract_first_paragraph_from_html(html_content)
            if full_extract and len(full_extract) > 200:  # Ensure we got substantial content
                logger.info(f"Using full HTML content for {title} ({lang})")
                # Still get summary for other metadata
                data, status = self._rest_summary(title, lang)
                if data and "title" in data:
                    extract = full_extract
                    
                    # Safe thumbnail extraction
                    thumb = None
                    thumbnail_data = data.get("thumbnail")
                    if thumbnail_data and isinstance(thumbnail_data, dict):
                        thumb = thumbnail_data.get("source")
                    
                    # Safe original image extraction
                    original = None
                    originalimage_data = data.get("originalimage")
                    if originalimage_data and isinstance(originalimage_data, dict):
                        original = originalimage_data.get("source")
                    
                    # Safe page URL extraction
                    page_url = None
                    content_urls = data.get("content_urls")
                    if content_urls and isinstance(content_urls, dict):
                        desktop = content_urls.get("desktop")
                        if desktop and isinstance(desktop, dict):
                            page_url = desktop.get("page")
                    
                    # Try to get media list
                    image_url = None
                    try:
                        media_data, media_status = self._rest_media_list(title, lang)
                        if media_data and "items" in media_data:
                            best_image = self._pick_best_image_from_media(media_data)
                            if best_image:
                                image_url = best_image
                            else:
                                image_url = original or thumb
                        else:
                            image_url = original or thumb
                    except Exception as e:
                        logger.debug(f"Error getting media list for {title} ({lang}): {e}")
                        image_url = original or thumb
                    
                    return {
                        "extract": extract,
                        "thumbnail": thumb,
                        "image_url": image_url,
                        "page_url": page_url
                    }

        # 2) REST summary fallback (mit _ und mit Leerzeichen)
        data, status = self._rest_summary(title, lang)
        if (not data or "title" not in data) and status != 403:
            # Fallback: Summary mit Spaces
            title2 = title.replace("_", " ")
            data, status = self._rest_summary(title2, lang)

        # 3) Falls REST nicht geht oder 403 → Action API Fallback
        if not data or "title" not in data or status == 403:
            # Erst mit originalem title, sonst mit Spaces
            extract, thumb, page_url, s1 = self._action_extracts(title, lang)
            if not extract:
                extract, thumb, page_url, s2 = self._action_extracts(title.replace("_", " "), lang)
                if not extract:
                    return None
            # Kein „originalimage" hier; belasse image_url=thumb
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