'use client';

import { 
  MapPin, 
  FileCheck, 
  Calculator, 
  MessageCircle, 
  Clock, 
  Shield,
  Globe,
  Users,
  Zap,
  Heart,
  CheckCircle,
  Star
} from 'lucide-react';
import { getContent, type Locale } from '../../lib/i18n';

interface FeaturesSectionProps {
  locale: Locale;
}

export default function FeaturesSection({ locale }: FeaturesSectionProps) {
  const content = getContent(locale);
  
  const iconMap = {
    'map-pin': MapPin,
    'file-check': FileCheck,
    calculator: Calculator,
    'message-circle': MessageCircle,
    clock: Clock,
    shield: Shield,
    globe: Globe,
    users: Users,
    zap: Zap,
    heart: Heart,
    check: CheckCircle,
    star: Star
  };
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.features.headline}
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {content.features.subtitle}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.features.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {content.features.items.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || MapPin;
            return (
              <div
                key={index}
                className="group bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-warm transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-gray-200"
              >
                <div className="mb-4">
                  <div className="w-10 h-10 text-primary-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
