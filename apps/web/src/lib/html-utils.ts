/**
 * HTML Utility Functions for Wikipedia Content Processing
 */

/**
 * Sanitizes HTML content from Wikipedia and converts it to clean text
 * while preserving important formatting
 */
export function sanitizeWikipediaHTML(htmlContent: string): string {
  if (!htmlContent) return '';

  // Create a temporary DOM element to parse HTML
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove unwanted elements
    const unwantedSelectors = [
      '.mw-ref',
      '.reference',
      '.navbox',
      '.infobox',
      '.thumb',
      '.mw-file-element',
      'figure',
      'figcaption',
      '.mw-default-size',
      '.mw-file-description',
      'sup.reference',
      '.cite_note',
      'style',
      'script'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = tempDiv.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Clean up specific Wikipedia artifacts
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    return cleanupWikipediaText(text);
  }

  // Server-side fallback: basic HTML tag removal
  return cleanupWikipediaText(stripHTMLTags(htmlContent));
}

/**
 * Strips HTML tags using regex (fallback for server-side)
 */
function stripHTMLTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Cleans up Wikipedia-specific text artifacts and structures paragraphs
 */
function cleanupWikipediaText(text: string): string {
  let cleaned = text
    // Remove citation markers like [1], [2], etc.
    .replace(/\[\d+\]/g, '')
    // Remove template artifacts
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[[^\]]*\|([^\]]*)\]\]/g, '$1') // [[Link|Text]] -> Text
    .replace(/\[\[([^\]]*)\]\]/g, '$1') // [[Link]] -> Link
    // Clean up common Wikipedia artifacts
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s*=\s*/g, ' = ');

  // FIRST: Fix unwanted line breaks in specific patterns BEFORE general paragraph structuring
  cleaned = cleaned
    // Fix organization names with abbreviations that got split
    .replace(/(Weltgesundheitsorganisation|Welttourismusorganisation|Internationale Fernmeldeunion|Vereinte Nationen|Europäische Union|World Health Organization|United Nations|European Union)\s*\n\s*\(([A-Z]+)\)/g, '$1 ($2)')
    
    // Fix dates that got split (like "15.\nJanuar 1997")
    .replace(/(\d{1,2})\.\s*\n\s*([A-ZÄÖÜ][a-zäöü]+)\s+(\d{4})/g, '$1. $2 $3')
    
    // Fix "seit" constructions that got split
    .replace(/,?\s*seit\s*\n\s*(\d{1,2})\.\s*([A-ZÄÖÜ][a-zäöü]+)\s*(\d{4})/g, ', seit $1. $2 $3')
    
    // Fix general organization + date patterns
    .replace(/([A-ZÄÖÜ][a-zäöü\s]+)\s*\(([A-Z]+)\),?\s*\n\s*seit\s*\n?\s*(\d{1,2})\.\s*([A-ZÄÖÜ][a-zäöü]+)\s*(\d{4})/g, '$1 ($2), seit $3. $4 $5')
    
    // Fix line breaks in the middle of sentences (not at sentence boundaries)
    .replace(/([a-zäöü])\s*\n\s*([a-zäöü])/g, '$1 $2')
    
    // Fix line breaks after commas in lists
    .replace(/,\s*\n\s*([a-zäöü])/g, ', $1')
    
    // Fix numbers with units that got split
    .replace(/(\d+(?:[.,]\d+)?)\s*\n\s*(km²|km|m²|m|%|°C|°F|Euro|Dollar|USD|EUR)/g, '$1 $2')
    
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();

  // THEN: Structure into proper paragraphs
  cleaned = cleaned
    // New paragraph after sentence end + capital letter (but not for organization names we just fixed)
    .replace(/([.!?])\s+([A-ZÄÖÜ][a-z])/g, '$1\n\n$2')
    // German sentence starters that should start new paragraphs
    .replace(/([.!?])\s+(Der|Die|Das|Ein|Eine|Es|Sie|Er|Heute|Seit|Nach|Vor|In|Im|Am|Auf|Mit|Durch|Während|Trotz|Wegen|Aufgrund|Infolge)\s/g, '$1\n\n$2 ')
    // Year followed by capital letter (for historical sections)
    .replace(/(\d{4})\s+([A-ZÄÖÜ][a-z])/g, '$1\n\n$2')
    // Clean up excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove empty lines
    .replace(/^\s*\n/gm, '')
    // Final cleanup
    .trim();

  return cleaned;
}

/**
 * Converts HTML content to markdown-like formatting
 * for better readability while preserving structure
 */
export function htmlToMarkdown(htmlContent: string): string {
  if (!htmlContent) return '';

  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Convert headers
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag, index) => {
      const headers = tempDiv.querySelectorAll(tag);
      headers.forEach(header => {
        const level = '#'.repeat(index + 1);
        header.outerHTML = `\n${level} ${header.textContent}\n`;
      });
    });

    // Convert paragraphs
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      p.outerHTML = `${p.textContent}\n\n`;
    });

    // Convert lists
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const items = list.querySelectorAll('li');
      let listText = '\n';
      items.forEach((item, index) => {
        const marker = list.tagName === 'UL' ? '•' : `${index + 1}.`;
        listText += `${marker} ${item.textContent}\n`;
      });
      list.outerHTML = listText + '\n';
    });

    // Convert bold and italic
    const bold = tempDiv.querySelectorAll('b, strong');
    bold.forEach(b => {
      b.outerHTML = `**${b.textContent}**`;
    });

    const italic = tempDiv.querySelectorAll('i, em');
    italic.forEach(i => {
      i.outerHTML = `*${i.textContent}*`;
    });

    return cleanupWikipediaText(tempDiv.textContent || tempDiv.innerText || '');
  }

  // Server-side fallback
  return sanitizeWikipediaHTML(htmlContent);
}

/**
 * Extracts plain text from Wikipedia HTML content
 * with better paragraph separation
 */
export function extractPlainText(htmlContent: string): string {
  if (!htmlContent) return '';

  const cleaned = sanitizeWikipediaHTML(htmlContent);
  
  // Add proper paragraph breaks
  return cleaned
    .replace(/\.\s+/g, '. ')
    .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Checks if content appears to be HTML
 */
export function isHTMLContent(content: string): boolean {
  if (!content) return false;
  
  // Simple check for HTML tags
  const htmlTagRegex = /<[^>]+>/;
  return htmlTagRegex.test(content);
}

/**
 * Smart content processor that automatically detects and cleans HTML
 */
export function processWikipediaContent(content: string): string {
  if (!content) return '';
  
  if (isHTMLContent(content)) {
    return intelligentParagraphBreaker(extractPlainText(content));
  }
  
  return intelligentParagraphBreaker(content);
}

/**
 * Intelligent paragraph breaker specifically for long Wikipedia texts
 */
export function intelligentParagraphBreaker(text: string): string {
  if (!text) return '';

  // Clean the text first
  let processed = cleanupWikipediaText(text);

  // Ultra-aggressive sentence-by-sentence breaking
  processed = processed
    // Break at EVERY sentence ending followed by a capital letter
    .replace(/([.!?])\s+([A-ZÄÖÜ])/g, '$1\n\n$2')
    // Break at semicolons followed by capital letters (often used in German)
    .replace(/([;:])\s+([A-ZÄÖÜ][a-zäöüß]{2,})/g, '$1\n\n$2')
    // Break at year references
    .replace(/(\d{4})\s+([A-ZÄÖÜ][a-zäöüß]{3,})/g, '$1\n\n$2')
    // Clean up excessive breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split and ensure each paragraph is meaningful
  const paragraphs = processed.split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 5) // Very permissive
    .filter(p => p.match(/[a-zäöüßA-ZÄÖÜ]/)); // Must contain letters

  return paragraphs.join('\n\n');
}

/**
 * Advanced text structuring for Wikipedia content
 */
export function structureWikipediaText(text: string): string {
  if (!text) return '';

  let structured = text;

  // First, clean up the basic text
  structured = cleanupWikipediaText(structured);

  // Very aggressive paragraph structuring - break at every sentence ending
  structured = structured
    // Primary rule: Break at every sentence ending with capital letter following
    .replace(/([.!?])\s+([A-ZÄÖÜ])/g, '$1\n\n$2')
    // Secondary rule: Break at specific patterns even within sentences
    .replace(/([a-zäöüß])\.\s+(Sein|Seine|Ihr|Ihre|Es|Sie|Er|Das|Die|Der|Ein|Eine)\s+([A-ZÄÖÜ])/g, '$1.\n\n$2 $3')
    // Break at coordinating conjunctions that start new thoughts
    .replace(/([.!?])\s+(Außerdem|Darüber hinaus|Ferner|Weiterhin|Zudem|Zusätzlich|Allerdings|Jedoch|Dennoch|Trotzdem|Andererseits|Hingegen|Dagegen|Deshalb|Daher|Folglich|Somit|Infolgedessen|Bedeutend|Wichtig)\s+/g, '$1\n\n$2 ')
    // Break at temporal markers
    .replace(/([.!?])\s+(Seit \d{4}|Im Jahr \d{4}|Ab \d{4}|Bis \d{4}|Zwischen \d{4} und \d{4}|In den \d{4}er Jahren|Heute|Heutzutage|Mittlerweile|Inzwischen|Während|Nach|Vor|Bis|Ab)\s+/g, '$1\n\n$2 ')
    // Break at geographical references
    .replace(/([.!?])\s+(In [A-ZÄÖÜ][a-zäöüß]+|Im [A-ZÄÖÜ][a-zäöüß]+|Auf [A-ZÄÖÜ][a-zäöüß]+|Bei [A-ZÄÖÜ][a-zäöüß]+|Durch [A-ZÄÖÜ][a-zäöüß]+|Aus [A-ZÄÖÜ][a-zäöüß]+|Metropolitan-[A-ZÄÖÜ])\s+/g, '$1\n\n$2 ')
    // Break at institutional/organizational references
    .replace(/([.!?])\s+(Die [A-ZÄÖÜ][a-zäöüß]+e [A-ZÄÖÜ][a-zäöüß]+|Das [A-ZÄÖÜ][a-zäöüß]+e [A-ZÄÖÜ][a-zäöüß]+|Der [A-ZÄÖÜ][a-zäöüß]+e [A-ZÄÖÜ][a-zäöüß]+)\s+/g, '$1\n\n$2 ')
    // Clean up multiple line breaks
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*\n/gm, '')
    .trim();

  // Split into paragraphs - be more lenient with length
  const paragraphs = structured.split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 10) // Allow shorter paragraphs
    .filter(p => !p.match(/^[.!?]\s*$/)); // Remove standalone punctuation

  // Don't merge paragraphs - keep them separate for better readability
  return paragraphs.join('\n\n');
}

/**
 * Advanced Wikipedia HTML processor for complex content structures
 */
export function processWikipediaHTML(htmlContent: string): string {
  if (!htmlContent) return '';

  // Server-side processing using regex patterns
  let processed = htmlContent;

  // Remove Wikipedia-specific elements and their content
  processed = processed
    // Remove infoboxes, navigation boxes, and other templates
    .replace(/<div[^>]*class="[^"]*(?:infobox|navbox|mw-ref|thumb|mw-file-element)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove figures and captions
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, '')
    // Remove reference links and citations
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<a[^>]*class="[^"]*mw-ref[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    // Remove style and script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Clean up div tags with specific classes
    .replace(/<div[^>]*class="[^"]*(?:mw-default-size|mw-file-description|hatnote)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove empty paragraphs and divs
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
    .replace(/<div[^>]*>\s*<\/div>/gi, '');

  // Convert remaining HTML to text while preserving structure
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processed;

    // Convert headers to markdown-style
    const headers = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
      const level = parseInt(header.tagName[1]);
      const text = header.textContent?.trim() || '';
      if (text) {
        header.outerHTML = `\n${'#'.repeat(level)} ${text}\n\n`;
      }
    });

    // Convert paragraphs - ensure each p tag becomes a separate paragraph
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.textContent?.trim() || '';
      if (text) {
        p.outerHTML = `${text}\n\n`;
      }
    });

    // Also handle div elements that might contain paragraph content
    const divs = tempDiv.querySelectorAll('div');
    divs.forEach(div => {
      const text = div.textContent?.trim() || '';
      if (text && !div.querySelector('p, div, ul, ol, h1, h2, h3, h4, h5, h6')) {
        div.outerHTML = `${text}\n\n`;
      }
    });

    // Convert lists
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const items = list.querySelectorAll('li');
      let listText = '\n';
      items.forEach((item, index) => {
        const text = item.textContent?.trim() || '';
        if (text) {
          const marker = list.tagName === 'UL' ? '•' : `${index + 1}.`;
          listText += `${marker} ${text}\n`;
        }
      });
      list.outerHTML = listText + '\n';
    });

    // Get final text content
    processed = tempDiv.textContent || tempDiv.innerText || '';
  } else {
    // Server-side fallback
    processed = stripHTMLTags(processed);
  }

  return cleanupWikipediaText(processed);
}
