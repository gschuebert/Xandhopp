'use client';

import type { ContentSchema } from '../../../content/schema';

interface WizardTeaserProps {
  content: ContentSchema;
}

export function WizardTeaser({ content }: WizardTeaserProps) {
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
    <section id="wizard" className="section-padding bg-white">
      <div className="container-default">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-portalis-accent to-portalis-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6">
              {content.teasers.wizard.headline}
            </h2>
            
            <p className="text-lg text-amber-700 mb-8 leading-relaxed">
              {content.teasers.wizard.description}
            </p>
            
            <button
              onClick={() => scrollToSection('trust')}
              className="btn btn-primary text-lg px-8 py-4"
            >
              {content.teasers.wizard.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
