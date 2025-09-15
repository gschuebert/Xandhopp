'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PortalisLogo } from '../xandhopp-logo';
import { MobileNav } from './MobileNav';
import { SearchForm } from './SearchForm';
import { useScrollSpy } from '../../lib/useScrollSpy';
import { getAlternateLocale, type Locale } from '../../lib/i18n';
import type { ContentSchema } from '../../../content/schema';

interface SiteHeaderProps {
  content: ContentSchema;
  locale: Locale;
}

const navSections = ['home', 'problem', 'solution', 'features', 'how-it-works', 'countries', 'compare', 'wizard', 'trust', 'cta'];

export function SiteHeader({ content, locale }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const activeSection = useScrollSpy(navSections);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const alternateLocale = getAlternateLocale(locale);
  const alternatePath = pathname?.replace(`/${locale}`, `/${alternateLocale}`) || `/${alternateLocale}`;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-default">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <PortalisLogo size="sm" />
            <span className="text-xl font-bold text-xandhopp-blue">Xandhopp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('countries')}
              className={`text-sm font-medium transition-colors hover:text-xandhopp-orange ${
                activeSection === 'countries' ? 'text-xandhopp-orange' : 'text-xandhopp-blue'
              }`}
            >
              {content.nav.countries}
            </button>
            <button
              onClick={() => scrollToSection('compare')}
              className={`text-sm font-medium transition-colors hover:text-xandhopp-orange ${
                activeSection === 'compare' ? 'text-xandhopp-orange' : 'text-xandhopp-blue'
              }`}
            >
              {content.nav.compare}
            </button>
            <button
              onClick={() => scrollToSection('wizard')}
              className={`text-sm font-medium transition-colors hover:text-xandhopp-orange ${
                activeSection === 'wizard' ? 'text-xandhopp-orange' : 'text-xandhopp-blue'
              }`}
            >
              {content.nav.wizard}
            </button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search Form */}
            <SearchForm locale={locale} />

            {/* Language Toggle */}
            <Link
              href={alternatePath}
              className="text-sm font-medium text-xandhopp-blue hover:text-xandhopp-orange transition-colors"
            >
              {content.nav.languageToggle[alternateLocale]}
            </Link>

            {/* Login Button */}
            <Link
              href={`/${locale}/login`}
              className="btn btn-secondary text-sm px-4 py-2"
            >
              {content.nav.login}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-xandhopp-blue hover:text-xandhopp-orange transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        content={content}
        locale={locale}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />
    </header>
  );
}