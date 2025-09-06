'use client';

import type { ContentSchema } from '../../../content/schema';
import type { Locale } from '../../../lib/i18n';

interface CountriesTeaserProps {
  content: ContentSchema;
  locale: Locale;
}

export function CountriesTeaser({ content, locale }: CountriesTeaserProps) {
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
    <section id="countries" className="section-padding bg-white">
      <div className="container-default">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-portalis-accent to-portalis-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6">
              {content.teasers.countries.headline}
            </h2>
            
            <p className="text-lg text-amber-700 mb-8 leading-relaxed">
              {content.teasers.countries.description}
            </p>
            
            <button
              onClick={() => scrollToSection('compare')}
              className="btn btn-primary text-lg px-8 py-4"
            >
              {content.teasers.countries.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
