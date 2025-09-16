'use client';

import { SiteFooter } from './footer/SiteFooter';
import { getContent, type Locale } from '../lib/i18n';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  const content = getContent(locale);
  
  return <SiteFooter content={content} locale={locale} />;
}