'use client';

import { useMemo } from 'react';
import { htmlToCleanTextWithTables } from '../../lib/textCleaner';

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
}

/**
 * Safe HTML renderer that preserves tables while sanitizing content
 */
export function SafeHTMLRenderer({ html, className = '' }: SafeHTMLRendererProps) {
  const processedContent = useMemo(() => {
    if (!html) return '';
    
    // Use the new function that preserves tables and HTML structure
    return htmlToCleanTextWithTables(html);
  }, [html]);

  // Check if content contains HTML tables
  const hasTables = useMemo(() => {
    return processedContent.includes('<table') || processedContent.includes('<div class="overflow-x-auto');
  }, [processedContent]);

  if (hasTables || processedContent.includes('<')) {
    // Render HTML content with tables and other HTML elements
    return (
      <div 
        className={`${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  } else {
    // Render as plain text (fallback)
    return (
      <div className={`text-sm leading-relaxed ${className}`}>
        {processedContent.split('\n\n').map((paragraph, index) => {
          const trimmedParagraph = paragraph.trim();
          if (trimmedParagraph.length === 0) return null;
          
          return (
            <p key={index} className="mb-4 text-justify">
              {trimmedParagraph}
            </p>
          );
        })}
      </div>
    );
  }
}
