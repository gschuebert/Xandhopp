'use client';

import Link from 'next/link';
import { PortalisLogo } from '../portalis-logo';
import { getAlternateLocale, type Locale } from '../../../lib/i18n';
import type { ContentSchema } from '../../../content/schema';

interface SiteFooterProps {
  content: ContentSchema;
  locale: Locale;
}

export function SiteFooter({ content, locale }: SiteFooterProps) {
  const alternateLocale = getAlternateLocale(locale);

  return (
    <footer id="footer" className="bg-amber-900 text-amber-100 py-16">
      <div className="container-default">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <PortalisLogo size="sm" />
              <span className="text-2xl font-bold text-white">PORTALIS</span>
            </div>
            <p className="text-amber-200 max-w-md leading-relaxed">
              {content.footer.description}
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-amber-200">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {content.footer.links.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {content.footer.links.terms}
                </Link>
              </li>
              <li>
                <a href="mailto:contact@portalis.com" className="hover:text-white transition-colors">
                  {content.footer.links.contact}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Language */}
          <div>
            <h4 className="font-semibold text-white mb-4">Language</h4>
            <div className="space-y-2">
              <Link
                href={`/${alternateLocale}`}
                className="block text-amber-200 hover:text-white transition-colors"
              >
                {content.nav.languageToggle[alternateLocale]}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-amber-800 mt-12 pt-8 text-center text-amber-300">
          <p>{content.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}