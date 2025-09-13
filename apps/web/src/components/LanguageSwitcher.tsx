'use client';

import { useRouter, usePathname } from 'next/navigation';
import { type Locale, availableLocales } from '../lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

// Define all possible languages with their display names and flags
const allLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
] as const;

// Filter to only show available languages
const languages = allLanguages.filter(lang => availableLocales.includes(lang.code as Locale));

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value as Locale;
    // Replace the current locale in the path with the new locale
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="relative">
      <select
        value={currentLocale}
        onChange={handleLanguageChange}
        className="appearance-none bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2 pr-8 text-sm font-medium transition-colors border border-blue-200 cursor-pointer"
        title="Select language"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
