'use client';

import Link from 'next/link';
import { PortalisLogo } from '../xandhopp-logo';
import { getAlternateLocale, type Locale } from '../../lib/i18n';
import type { ContentSchema } from '../../../content/schema';

interface SiteFooterProps {
  content: ContentSchema;
  locale: Locale;
}

export function SiteFooter({ content, locale }: SiteFooterProps) {
  const alternateLocale = getAlternateLocale(locale);

  return (
    <footer id="footer" className="bg-xandhopp-blue text-white py-16">
      <div className="container-default">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <PortalisLogo size="sm" />
              <span className="text-2xl font-bold text-white">Xandhopp</span>
            </div>
            <p className="text-white/80 max-w-md leading-relaxed">
              {content.footer.description}
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-white/80">
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
                <a href="mailto:contact@xandhopp.com" className="hover:text-white transition-colors">
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
                className="block text-white/80 hover:text-white transition-colors"
              >
                {content.nav.languageToggle[alternateLocale]}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/70">
          <p>{content.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}