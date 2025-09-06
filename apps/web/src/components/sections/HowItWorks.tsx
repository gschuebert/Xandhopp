'use client';

import type { ContentSchema } from '../../../content/schema';

export function HowItWorks({ content }: { content: ContentSchema }) {
  return (
    <section id="how-it-works" className="section-padding bg-amber-50">
      <div className="container-default">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">
            {content.howItWorks.headline}
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.howItWorks.steps.map((step, index) => (
              <div key={index} className="text-center">
                {/* Step Number */}
                <div className="w-16 h-16 bg-portalis-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {index + 1}
                </div>
                
                {/* Step Content */}
                <div className="card p-8">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-amber-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow (except for last step) */}
                {index < content.howItWorks.steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-8 transform -translate-x-4">
                    <svg className="w-8 h-8 text-portalis-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
