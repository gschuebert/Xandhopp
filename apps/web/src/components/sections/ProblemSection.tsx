'use client';

import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  FileText, 
  Globe, 
  Users 
} from 'lucide-react';
import { getContent, type Locale } from '../../lib/i18n';

interface ProblemSectionProps {
  locale: Locale;
}

export default function ProblemSection({ locale }: ProblemSectionProps) {
  const content = getContent(locale);
  
  const iconMap = {
    clock: Clock,
    'dollar-sign': DollarSign,
    'file-text': FileText,
    globe: Globe,
    users: Users,
    shield: AlertTriangle
  };
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.problem.headline}
            <span className="block text-destructive">{content.problem.subtitle}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.problem.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.problem.problems.map((problem, index) => {
            const IconComponent = iconMap[problem.icon as keyof typeof iconMap] || AlertTriangle;
            return (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-warm transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-destructive-200"
              >
                <div className="mb-6">
                  <div className="w-12 h-12 text-destructive-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {problem.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-destructive-600 font-medium">
            <AlertTriangle className="w-5 h-5" />
            <span>{content.problem.cta}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
