import { SiteFooter } from '../../components/footer/SiteFooter';
import { Hero } from '../../components/sections/Hero';
import { Problem } from '../../components/sections/Problem';
import { Solution } from '../../components/sections/Solution';
import { Features } from '../../components/sections/Features';
import { HowItWorks } from '../../components/sections/HowItWorks';
import { CountriesTeaser } from '../../components/sections/CountriesTeaser';
import { CompareTeaser } from '../../components/sections/CompareTeaser';
import { WizardTeaser } from '../../components/sections/WizardTeaser';
import { Trust } from '../../components/sections/Trust';
import { Cta } from '../../components/sections/Cta';
import { getContent, isValidLocale, type Locale } from '../../lib/i18n';
import { notFound } from 'next/navigation';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params }: HomePageProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Hero content={content} locale={locale} />
        <Problem content={content} />
        <Solution content={content} />
        <Features content={content} />
        <HowItWorks content={content} />
        <CountriesTeaser content={content} locale={locale} />
        <CompareTeaser content={content} />
        <WizardTeaser content={content} />
        <Trust content={content} />
        <Cta content={content} />
      </main>
      
      <SiteFooter content={content} locale={locale} />
    </div>
  );
}