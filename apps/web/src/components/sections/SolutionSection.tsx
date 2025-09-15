'use client';

import { 
  CheckCircle, 
  Globe, 
  Shield, 
  Users, 
  Zap, 
  Heart 
} from 'lucide-react';
import { getContent, type Locale } from '../../lib/i18n';

interface SolutionSectionProps {
  locale: Locale;
}

export default function SolutionSection({ locale }: SolutionSectionProps) {
  const content = getContent(locale);
  
  const iconMap = {
    globe: Globe,
    shield: Shield,
    users: Users,
    zap: Zap,
    check: CheckCircle,
    heart: Heart
  };
  return (
    <section className="py-20 bg-gradient-to-br from-secondary-50 to-secondary-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.solution.headline}
            <span className="block text-secondary">{content.solution.subtitle}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.solution.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.solution.solutions.map((solution, index) => {
            const IconComponent = iconMap[solution.icon as keyof typeof iconMap] || Globe;
            return (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft hover:shadow-warm transition-all duration-300 transform hover:scale-105 border border-secondary-200 hover:border-secondary-300"
              >
                <div className="mb-6">
                  <div className="w-12 h-12 text-secondary-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-secondary-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            <span>{content.solution.cta}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
