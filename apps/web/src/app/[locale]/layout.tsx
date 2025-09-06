import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getContent, isValidLocale, type Locale } from '../../lib/i18n';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isValidLocale(params.locale)) {
    return {
      title: 'Page Not Found',
    };
  }

  const locale = params.locale as Locale;
  const content = getContent(locale);

  return {
    title: content.meta.title,
    description: content.meta.description,
    keywords: content.meta.keywords,
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      type: 'website',
      locale: locale,
      alternateLocale: locale === 'en' ? 'de' : 'en',
    },
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return (
    <html lang={params.locale}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}