'use client';

import Link from 'next/link';
import Image from 'next/image';
import { XandhoppLogo } from '../xandhopp-logo';
import { getAlternateLocale, type Locale } from '../../lib/i18n';
import type { ContentSchema } from '../../../content/schema';

interface SiteFooterProps {
  content: ContentSchema;
  locale: Locale;
}

export function SiteFooter({ content, locale }: SiteFooterProps) {
  const alternateLocale = getAlternateLocale(locale);

  return (
    <footer id="footer" className="bg-gray-900 text-white py-8">
      <div className="container-default">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative" style={{ width: '610px', height: '160px' }}>
                <Image
                  src="/logo.png"
                  alt="Xandhopp"
                  title="Xandhopp"
                  fill
                  sizes="610px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-white/80 max-w-md leading-relaxed mb-4">
              {content.footer.description}
            </p>
            <p className="text-white/60 text-sm">
              Your perfect move worldwide
            </p>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {locale === 'de' ? 'Datenschutz' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {locale === 'de' ? 'AGB' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/imprint`} className="hover:text-white transition-colors">
                  {locale === 'de' ? 'Impressum' : 'Imprint'}
                </Link>
              </li>
              <li>
                <a href="mailto:contact@xandhopp.com" className="hover:text-white transition-colors">
                  {locale === 'de' ? 'Kontakt' : 'Contact'}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{locale === 'de' ? 'Unternehmen' : 'Company'}</h4>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
                  {locale === 'de' ? 'Über uns' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/countries`} className="hover:text-white transition-colors">
                  {locale === 'de' ? 'Länder' : 'Countries'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/compare`} className="hover:text-white transition-colors">
                  {locale === 'de' ? 'Vergleichen' : 'Compare'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${alternateLocale}`}
                  className="hover:text-white transition-colors"
                >
                  {content.nav.languageToggle[alternateLocale]}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/70">
          <p>{content.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}