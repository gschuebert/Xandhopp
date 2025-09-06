'use client';

import type { ContentSchema } from '../../../content/schema';

export function Trust({ content }: { content: ContentSchema }) {
  return (
    <section id="trust" className="section-padding bg-amber-50">
      <div className="container-default">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">
            {content.trust.headline}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.trust.testimonials.map((testimonial, index) => (
            <div key={index} className="card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-portalis-accent to-portalis-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <blockquote className="text-amber-800 text-lg leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              
              <div>
                <div className="font-semibold text-amber-900">
                  {testimonial.author}
                </div>
                <div className="text-amber-600 text-sm">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
