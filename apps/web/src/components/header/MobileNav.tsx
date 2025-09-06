'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { getAlternateLocale, type Locale } from '../../../lib/i18n';
import type { ContentSchema } from '../../../content/schema';

interface MobileNavProps {
  content: ContentSchema;
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const navSections = [
  { id: 'home', label: 'Home' },
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'countries', label: 'Countries' },
  { id: 'compare', label: 'Compare' },
  { id: 'wizard', label: 'Wizard' },
  { id: 'trust', label: 'Trust' },
  { id: 'cta', label: 'Get Access' },
];

export function MobileNav({ 
  content, 
  locale, 
  isOpen, 
  onClose, 
  activeSection, 
  onNavigate 
}: MobileNavProps) {
  const alternateLocale = getAlternateLocale(locale);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl z-50 animate-slide-up">
        <div className="container-default py-6">
          {/* Navigation Links */}
          <nav className="space-y-4 mb-8">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-portalis-accent text-white'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>

          {/* Language Toggle */}
          <div className="border-t border-amber-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-700">Language</span>
              <Link
                href={`/${alternateLocale}`}
                className="text-sm font-medium text-portalis-accent hover:text-portalis-accent-dark transition-colors"
                onClick={onClose}
              >
                {content.nav.languageToggle[alternateLocale]}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}