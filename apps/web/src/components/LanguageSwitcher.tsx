'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type Locale, availableLocales } from '../lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

// Define all possible languages with their display names, flags, and regions
const allLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', region: 'US' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', region: 'DE' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', region: 'FR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', region: 'ES' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', region: 'IT' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', region: 'NL' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', region: 'PT' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱', region: 'PL' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', region: 'RU' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', region: 'JP' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', region: 'KR' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳', region: 'CN' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', region: 'SA' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', region: 'IN' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', region: 'TR' },
] as const;

// Filter to only show available languages
const languages = allLanguages.filter(lang => availableLocales.includes(lang.code as Locale));
const recommendedLanguages = languages.slice(0, 4);
const allOtherLanguages = languages.slice(4);

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  const handleLanguageChange = (newLocale: Locale) => {
    if (pathname) {
      const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
      router.push(newPath);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer shadow-sm hover:shadow-md"
        title="Sprache auswählen"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[75vh] overflow-hidden mt-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Sprache auswählen</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Recommended Languages */}
              {recommendedLanguages.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Für Sie empfohlen</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendedLanguages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code as Locale)}
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                          language.code === currentLocale
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-2xl">{language.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm text-gray-500">({language.region})</div>
                        </div>
                        {language.code === currentLocale && (
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Languages */}
              {allOtherLanguages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alle Sprachen</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {allOtherLanguages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code as Locale)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                          language.code === currentLocale
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-xl">{language.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{language.name}</div>
                          <div className="text-xs text-gray-500">({language.region})</div>
                        </div>
                        {language.code === currentLocale && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}