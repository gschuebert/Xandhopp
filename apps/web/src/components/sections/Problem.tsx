'use client';

import type { ContentSchema } from '../../../content/schema';

interface ProblemProps {
  content: ContentSchema;
}

export function Problem({ content }: ProblemProps) {
  return (
    <section id="problem" className="section-padding bg-white/50">
      <div className="container-default">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-12">
            {content.problem.headline}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.problem.bullets.map((bullet, index) => (
              <div key={index} className="card p-8 text-left">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-amber-800 text-lg leading-relaxed">
                    {bullet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}