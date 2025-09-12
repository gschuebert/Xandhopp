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

const features = [
  {
    icon: MapPin,
    title: "Country Intelligence",
    description: "Comprehensive data on visa requirements, cost of living, and quality of life metrics.",
    color: "text-primary-500"
  },
  {
    icon: FileCheck,
    title: "Document Management",
    description: "Digital document storage and automated checklist management for all your paperwork.",
    color: "text-secondary-500"
  },
  {
    icon: Calculator,
    title: "Cost Calculator",
    description: "Real-time cost estimates including taxes, fees, and living expenses for your target country.",
    color: "text-primary-500"
  },
  {
    icon: MessageCircle,
    title: "Expert Consultation",
    description: "Direct access to immigration lawyers and relocation specialists via chat and video calls.",
    color: "text-secondary-500"
  },
  {
    icon: Clock,
    title: "Timeline Planning",
    description: "Personalized timelines with milestone tracking and deadline reminders.",
    color: "text-primary-500"
  },
  {
    icon: Shield,
    title: "Compliance Monitoring",
    description: "Automated compliance checks and legal requirement monitoring throughout your journey.",
    color: "text-secondary-500"
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Platform available in 12 languages with local language support for documentation.",
    color: "text-primary-500"
  },
  {
    icon: Users,
    title: "Community Network",
    description: "Connect with other expats and access local networks in your destination country.",
    color: "text-secondary-500"
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "Instant notifications about policy changes, deadline updates, and process modifications.",
    color: "text-primary-500"
  },
  {
    icon: Heart,
    title: "Family Support",
    description: "Specialized services for families including school enrollment and healthcare guidance.",
    color: "text-secondary-500"
  },
  {
    icon: CheckCircle,
    title: "Success Tracking",
    description: "Progress monitoring with success metrics and milestone celebrations.",
    color: "text-primary-500"
  },
  {
    icon: Star,
    title: "Premium Support",
    description: "Priority support with dedicated account managers for complex relocation needs.",
    color: "text-secondary-500"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything you need for a
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              successful relocation
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools and services covers every aspect of your 
            international move, from initial research to post-relocation support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-warm transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-gray-200"
              >
                <div className="mb-4">
                  <div className={`w-10 h-10 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
