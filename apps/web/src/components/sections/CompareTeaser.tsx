'use client';

import type { ContentSchema } from '../../../content/schema';

interface CompareTeaserProps {
  content: ContentSchema;
}

export function CompareTeaser({ content }: CompareTeaserProps) {
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
    <section id="compare" className="section-padding bg-amber-50">
      <div className="container-default">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-portalis-accent to-portalis-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6">
              {content.teasers.compare.headline}
            </h2>
            
            <p className="text-lg text-amber-700 mb-8 leading-relaxed">
              {content.teasers.compare.description}
            </p>
            
            <button
              onClick={() => scrollToSection('wizard')}
              className="btn btn-primary text-lg px-8 py-4"
            >
              {content.teasers.compare.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
