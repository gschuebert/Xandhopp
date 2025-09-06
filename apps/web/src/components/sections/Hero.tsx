'use client';

import Link from 'next/link';
import { PortalisLogo } from '../portalis-logo';
import type { ContentSchema } from '../../../content/schema';
import type { Locale } from '../../../lib/i18n';

interface HeroProps {
  content: ContentSchema;
  locale: Locale;
}

export function Hero({ content, locale }: HeroProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-portalis-bg via-amber-50 to-orange-50 pt-20">
      <div className="container-default text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <PortalisLogo size="xl" className="drop-shadow-lg" />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6 animate-slide-up">
            {content.hero.title}
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-2xl md:text-3xl font-semibold text-portalis-accent mb-8 animate-slide-up">
            {content.hero.subtitle}
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-amber-700 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            {content.hero.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link
              href={`/${locale}/login`}
              className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl"
            >
              {content.hero.ctaPrimary}
            </Link>
            <button
              onClick={() => scrollToSection('solution')}
              className="btn btn-secondary text-lg px-8 py-4"
            >
              {content.hero.ctaSecondary}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}