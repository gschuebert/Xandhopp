'use client';

import type { ContentSchema } from '../../../content/schema';

export function Solution({ content }: { content: ContentSchema }) {
  return (
    <section id="solution" className="section-padding bg-gradient-to-r from-portalis-accent to-portalis-accent-light">
      <div className="container-default">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            {content.solution.headline}
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            {content.solution.description}
          </p>
          
          {/* Visual element */}
          <div className="mt-12 flex justify-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}