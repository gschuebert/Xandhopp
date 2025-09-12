'use client';

import { 
  Search, 
  FileText, 
  CheckCircle, 
  Plane 
} from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Research & Plan",
    description: "Explore countries, compare options, and create your personalized relocation plan with our intelligent matching system.",
    color: "text-primary-500",
    bgColor: "bg-primary-50"
  },
  {
    number: "02",
    icon: FileText,
    title: "Prepare Documents",
    description: "Get step-by-step guidance for all required paperwork, with automated checklists and document verification.",
    color: "text-secondary-500",
    bgColor: "bg-secondary-50"
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Submit & Track",
    description: "Submit applications with confidence, track progress in real-time, and get expert support throughout the process.",
    color: "text-primary-500",
    bgColor: "bg-primary-50"
  },
  {
    number: "04",
    icon: Plane,
    title: "Relocate & Settle",
    description: "Complete your move with ongoing support, local connections, and assistance settling into your new home.",
    color: "text-secondary-500",
    bgColor: "bg-secondary-50"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process makes international relocation simple, 
            transparent, and stress-free from start to finish.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-primary-200" />
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full border-2 border-primary-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">{step.number}</span>
                    </div>
                    
                    {/* Step Content */}
                    <div className="pt-8 text-center">
                      <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <IconComponent className={`w-8 h-8 ${step.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden">
          <div className="space-y-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-16 left-8 w-0.5 h-16 bg-gradient-to-b from-primary-200 to-secondary-200" />
                  )}
                  
                  <div className="flex items-start space-x-6">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-2xl border-2 border-primary-200 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600">{step.number}</span>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <div className={`w-12 h-12 ${step.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                        <IconComponent className={`w-6 h-6 ${step.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
