'use client';

import { 
  CheckCircle, 
  Globe, 
  Shield, 
  Users, 
  Zap, 
  Heart 
} from 'lucide-react';

const solutions = [
  {
    icon: Globe,
    title: "Global Expertise",
    description: "Access to local experts in 50+ countries with deep knowledge of immigration laws and processes.",
    color: "text-secondary-500"
  },
  {
    icon: Shield,
    title: "Risk Mitigation",
    description: "Comprehensive compliance checks and legal guidance to minimize risks and ensure smooth transitions.",
    color: "text-secondary-500"
  },
  {
    icon: Users,
    title: "Personalized Support",
    description: "Dedicated relocation specialists who understand your unique needs and provide tailored solutions.",
    color: "text-secondary-500"
  },
  {
    icon: Zap,
    title: "Streamlined Process",
    description: "Automated workflows and digital tools that simplify complex procedures and save you time.",
    color: "text-secondary-500"
  },
  {
    icon: CheckCircle,
    title: "Transparent Pricing",
    description: "Clear, upfront costs with no hidden fees. Know exactly what you're paying for from day one.",
    color: "text-secondary-500"
  },
  {
    icon: Heart,
    title: "Ongoing Support",
    description: "Continuous assistance even after your move, helping you settle in and thrive in your new home.",
    color: "text-secondary-500"
  }
];

export default function SolutionSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary-50 to-secondary-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            We make relocation
            <span className="block text-secondary">effortless</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines technology, expertise, and personalized 
            service to transform your relocation experience from stressful to seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            return (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft hover:shadow-warm transition-all duration-300 transform hover:scale-105 border border-secondary-200 hover:border-secondary-300"
              >
                <div className="mb-6">
                  <div className={`w-12 h-12 ${solution.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
            <span>Ready to experience the difference?</span>
          </div>
        </div>
      </div>
    </section>
  );
}
