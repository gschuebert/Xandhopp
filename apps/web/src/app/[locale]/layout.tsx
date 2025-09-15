import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getContent, isValidLocale, type Locale } from '../../lib/i18n';
import { notFound } from 'next/navigation';
import Navigation from '../../components/Navigation';
import { Providers } from './providers';

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
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
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
    <Providers>
      <div lang={params.locale}>
        <Navigation locale={params.locale} />
        <main>
          {children}
        </main>
      </div>
    </Providers>
  );
}