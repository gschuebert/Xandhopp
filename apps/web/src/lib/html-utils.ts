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
  return text
    // Remove citation markers like [1], [2], etc.
    .replace(/\[\d+\]/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim()
    // Clean up common Wikipedia artifacts
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s*=\s*/g, ' = ')
    // Remove template artifacts
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[[^\]]*\|([^\]]*)\]\]/g, '$1') // [[Link|Text]] -> Text
    .replace(/\[\[([^\]]*)\]\]/g, '$1') // [[Link]] -> Link
    // Structure into paragraphs based on sentence patterns
    .replace(/([.!?])\s+([A-ZÄÖÜ])/g, '$1\n\n$2') // New paragraph after sentence end + capital letter
    .replace(/([.!?])\s+(Der|Die|Das|Ein|Eine|Es|Sie|Er|Heute|Seit|Nach|Vor|In|Im|Am|Auf|Mit|Durch|Während|Trotz|Wegen|Aufgrund|Infolge)\s/g, '$1\n\n$2 ') // German sentence starters
    // Handle numbered lists and dates
    .replace(/(\d{4})\s+([A-ZÄÖÜ])/g, '$1\n\n$2') // Year followed by capital letter
    .replace(/(\w)\.\s+(\d+\.)/g, '$1.\n\n$2') // Numbered list items
    // Clean up excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove empty lines and normalize line breaks
    .replace(/^\s*\n/gm, '')
    // Final cleanup
    .trim();
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
    return structureWikipediaText(extractPlainText(content));
  }
  
  return structureWikipediaText(content);
}

/**
 * Advanced text structuring for Wikipedia content
 */
export function structureWikipediaText(text: string): string {
  if (!text) return '';

  let structured = text;

  // First, clean up the basic text
  structured = cleanupWikipediaText(structured);

  // Advanced paragraph structuring for German content
  structured = structured
    // Break at common German transition words
    .replace(/(Außerdem|Darüber hinaus|Ferner|Weiterhin|Zudem|Zusätzlich|Allerdings|Jedoch|Dennoch|Trotzdem|Andererseits|Hingegen|Dagegen)\s+/g, '\n\n$1 ')
    // Break at temporal markers
    .replace(/(Seit \d{4}|Im Jahr \d{4}|Ab \d{4}|Bis \d{4}|Zwischen \d{4} und \d{4}|In den \d{4}er Jahren)\s+/g, '\n\n$1 ')
    // Break at geographical references
    .replace(/(In [A-ZÄÖÜ][a-zäöüß]+|Im [A-ZÄÖÜ][a-zäöüß]+|Auf [A-ZÄÖÜ][a-zäöüß]+)\s+/g, '\n\n$1 ')
    // Break before statistical information
    .replace(/(\d+[%,]\s+|Etwa \d+|Rund \d+|Über \d+|Unter \d+|Mehr als \d+|Weniger als \d+)\s+/g, '\n\n$1 ')
    // Break at enumerations
    .replace(/(Erstens|Zweitens|Drittens|Viertens|Zum einen|Zum anderen|Einerseits|Andererseits)\s+/g, '\n\n$1 ')
    // Break at topic changes (common Wikipedia patterns)
    .replace(/(Die [A-ZÄÖÜ][a-zäöüß]+ [a-zäöüß]+ |Das [A-ZÄÖÜ][a-zäöüß]+ [a-zäöüß]+ |Der [A-ZÄÖÜ][a-zäöüß]+ [a-zäöüß]+ )/g, '\n\n$1')
    // Clean up multiple line breaks again
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*\n/gm, '')
    .trim();

  // Split into logical paragraphs and rejoin with proper spacing
  const paragraphs = structured.split('\n\n').filter(p => p.trim().length > 0);
  
  return paragraphs
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 10) // Remove very short fragments
    .join('\n\n');
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

    // Convert paragraphs
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.textContent?.trim() || '';
      if (text) {
        p.outerHTML = `${text}\n\n`;
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
