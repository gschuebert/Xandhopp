import { ContentSchema } from '../../content/schema';
import { en } from '../../content/en';
import { de } from '../../content/de';

const content = {
  en,
  de,
} as const;

export type Locale = keyof typeof content;

export function getContent(locale: Locale): ContentSchema {
  return content[locale] || content.en;
}

export function isValidLocale(locale: string): locale is Locale {
  return locale in content;
}

export function getAlternateLocale(currentLocale: Locale): Locale {
  return currentLocale === 'en' ? 'de' : 'en';
}