import Hero from '../../components/sections/Hero';
import ProblemSection from '../../components/sections/ProblemSection';
import SolutionSection from '../../components/sections/SolutionSection';
import FeaturesSection from '../../components/sections/FeaturesSection';
import HowItWorksSection from '../../components/sections/HowItWorksSection';
import TestimonialsSection from '../../components/sections/TestimonialsSection';
import CTASection from '../../components/sections/CTASection';
import Footer from '../../components/Footer';
import { isValidLocale, type Locale } from '../../lib/i18n';
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

  return (
    <div className="min-h-screen">
      <Hero locale={locale} />
      <ProblemSection locale={locale} />
      <SolutionSection locale={locale} />
      <FeaturesSection locale={locale} />
      <HowItWorksSection locale={locale} />
      <TestimonialsSection locale={locale} />
      <CTASection locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}