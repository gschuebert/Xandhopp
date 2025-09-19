/**
 * Text cleaning utilities for Wikipedia content
 * Fixes unwanted line breaks and formatting issues
 */

export interface TextCleaningOptions {
  fixLineBreaks?: boolean;
  fixDates?: boolean;
  fixOrganizations?: boolean;
  fixNumbers?: boolean;
  removeExtraSpaces?: boolean;
  preserveParagraphs?: boolean;
}

/**
 * Clean Wikipedia content text
 */
export function cleanWikipediaText(
  text: string, 
  options: TextCleaningOptions = {}
): string {
  if (!text) return '';

  const {
    fixLineBreaks = true,
    fixDates = true,
    fixOrganizations = true,
    fixNumbers = true,
    removeExtraSpaces = true,
    preserveParagraphs = true
  } = options;

  let cleaned = text;

  if (fixLineBreaks) {
    // Fix line breaks in dates (like "15.\nJanuar 1997")
    cleaned = cleaned.replace(/(\d+)\.\s*\n\s*([A-ZÄÖÜ][a-zäöü]+)\s+(\d{4})/g, '$1. $2 $3');
    
    // Fix line breaks in organization names
    cleaned = cleaned.replace(/([A-ZÄÖÜ][a-zäöü\s]+)\s*\n\s*\(([A-Z]+)\)/g, '$1 ($2)');
    
    // Fix line breaks before parentheses with abbreviations
    cleaned = cleaned.replace(/\s*\n\s*\(([A-Z]{2,})\)/g, ' ($1)');
    
    // Fix line breaks in "seit" constructions
    cleaned = cleaned.replace(/,\s+seit\s*\n\s*(\d+)/g, ', seit $1');
    
    // Fix general unwanted line breaks in the middle of sentences
    cleaned = cleaned.replace(/([a-zäöü])\s*\n\s*([a-zäöü])/g, '$1 $2');
    
    // Fix line breaks after commas in lists
    cleaned = cleaned.replace(/,\s*\n\s*([a-zäöü])/g, ', $1');
  }

  if (fixDates) {
    // Normalize date formats
    cleaned = cleaned.replace(/(\d{1,2})\.\s*([A-ZÄÖÜ][a-zäöü]+)\s*(\d{4})/g, '$1. $2 $3');
    
    // Fix "seit" + date constructions
    cleaned = cleaned.replace(/seit\s+(\d{1,2})\.\s*([A-ZÄÖÜ][a-zäöü]+)\s*(\d{4})/g, 'seit $1. $2 $3');
  }

  if (fixOrganizations) {
    // Fix organization names with abbreviations
    cleaned = cleaned.replace(
      /(Weltgesundheitsorganisation|Welttourismusorganisation|Internationale Fernmeldeunion|Vereinte Nationen|Europäische Union)\s*\n?\s*\(([A-Z]+)\)/g,
      '$1 ($2)'
    );
    
    // Fix "seit" with organizations
    cleaned = cleaned.replace(
      /([A-ZÄÖÜ][a-zäöü\s]+)\s*\(([A-Z]+)\),?\s*\n?\s*seit\s*\n?\s*(\d+\.\s*[A-ZÄÖÜ][a-zäöü]+\s*\d{4})/g,
      '$1 ($2), seit $3'
    );
  }

  if (fixNumbers) {
    // Fix numbers with units that got split
    cleaned = cleaned.replace(/(\d+)\s*\n\s*(km²|km|m²|m|%|°C|°F)/g, '$1 $2');
    
    // Fix currency amounts
    cleaned = cleaned.replace(/(\d+(?:[.,]\d+)?)\s*\n\s*(€|$|USD|EUR)/g, '$1 $2');
  }

  if (removeExtraSpaces) {
    // Remove multiple spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    
    // Remove spaces before punctuation
    cleaned = cleaned.replace(/\s+([,.;:!?])/g, '$1');
    
    // Remove extra spaces after punctuation
    cleaned = cleaned.replace(/([,.;:!?])\s{2,}/g, '$1 ');
  }

  if (preserveParagraphs) {
    // Keep intentional paragraph breaks (double line breaks)
    cleaned = cleaned.replace(/\n\n+/g, '\n\n');
    
    // Remove single line breaks that aren't paragraph separators
    cleaned = cleaned.replace(/([^\n])\n([^\n])/g, '$1 $2');
  } else {
    // Remove all line breaks
    cleaned = cleaned.replace(/\n+/g, ' ');
  }

  // Final cleanup
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned;
}

/**
 * Clean HTML content while preserving structure
 */
export function cleanWikipediaHTML(html: string): string {
  if (!html) return '';

  let cleaned = html;

  // Remove Wikipedia-specific HTML elements first
  cleaned = cleaned
    // Remove infoboxes, references, etc.
    .replace(/<div[^>]*class="[^"]*(?:infobox|navbox|mw-ref|thumb|mw-file-element|hatnote)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, '')
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<a[^>]*class="[^"]*mw-ref[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Fix line breaks in text nodes while preserving HTML structure
  cleaned = cleaned.replace(/>([^<]*)</g, (match, textContent) => {
    const cleanedText = cleanWikipediaText(textContent, {
      preserveParagraphs: false // Don't preserve line breaks in HTML
    });
    return `>${cleanedText}<`;
  });

  return cleaned;
}

/**
 * Convert HTML to clean text with proper formatting
 */
export function htmlToCleanText(html: string): string {
  if (!html) return '';

  // First clean the HTML
  let cleaned = cleanWikipediaHTML(html);

  // Convert to plain text
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleaned;
    
    // Convert paragraphs to double line breaks
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.textContent?.trim() || '';
      if (text) {
        p.outerHTML = `${text}\n\n`;
      }
    });

    // Convert headers
    const headers = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
      const text = header.textContent?.trim() || '';
      if (text) {
        header.outerHTML = `${text}\n\n`;
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

    cleaned = tempDiv.textContent || tempDiv.innerText || '';
  } else {
    // Server-side fallback: remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  }

  // Apply final text cleaning with better paragraph handling
  const finalCleaned = cleanWikipediaText(cleaned, {
    fixLineBreaks: true,
    fixDates: true,
    fixOrganizations: true,
    fixNumbers: true,
    removeExtraSpaces: true,
    preserveParagraphs: false // Let us handle paragraphs manually
  });

  // Create intelligent paragraphs based on content structure
  return createIntelligentParagraphs(finalCleaned);
}

/**
 * Extract and clean plain text from HTML
 */
export function extractCleanText(html: string): string {
  if (!html) return '';

  // Remove HTML tags
  const plainText = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  const decoded = plainText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return cleanWikipediaText(decoded);
}

/**
 * Create intelligent paragraphs from cleaned text
 */
function createIntelligentParagraphs(text: string): string {
  if (!text) return '';

  let paragraphed = text;

  // Split into sentences first
  const sentences = paragraphed.split(/([.!?])\s+/).filter(s => s.trim().length > 0);
  
  let result = '';
  let currentParagraph = '';
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    
    if (!sentence) continue;
    
    const fullSentence = sentence.trim() + punctuation;
    
    // Start new paragraph if:
    // 1. Current paragraph is getting long (>300 chars)
    // 2. Sentence starts with certain keywords
    // 3. Sentence contains year patterns
    const shouldStartNewParagraph = 
      currentParagraph.length > 300 ||
      /^(Der|Die|Das|Seit|Nach|Heute|Im Jahr|Ab|Bis|Während|Trotz|Außerdem|Darüber hinaus|Ferner|Weiterhin|Zudem|Allerdings|Jedoch|Dennoch)\s/.test(sentence) ||
      /^\d{4}\s/.test(sentence);
    
    if (shouldStartNewParagraph && currentParagraph.trim()) {
      result += currentParagraph.trim() + '\n\n';
      currentParagraph = fullSentence + ' ';
    } else {
      currentParagraph += fullSentence + ' ';
    }
  }
  
  // Add remaining paragraph
  if (currentParagraph.trim()) {
    result += currentParagraph.trim();
  }
  
  // Clean up excessive line breaks
  return result.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Smart text truncation that respects word boundaries and sentences
 */
export function smartTruncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  // Try to cut at sentence boundary
  const sentences = text.split(/[.!?]+/);
  let result = '';
  
  for (const sentence of sentences) {
    const potential = result + sentence + '.';
    if (potential.length <= maxLength) {
      result = potential;
    } else {
      break;
    }
  }

  // If no complete sentence fits, cut at word boundary
  if (!result) {
    const words = text.split(' ');
    result = '';
    
    for (const word of words) {
      const potential = result + (result ? ' ' : '') + word;
      if (potential.length <= maxLength) {
        result = potential;
      } else {
        break;
      }
    }
    
    result += '...';
  }

  return result.trim();
}
