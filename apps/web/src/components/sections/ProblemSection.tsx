'use client';

import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  FileText, 
  Globe, 
  Users 
} from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: "Time-Consuming Research",
    description: "Hours spent researching visa requirements, documentation, and legal processes across different countries.",
    color: "text-destructive-500"
  },
  {
    icon: DollarSign,
    title: "Hidden Costs",
    description: "Unexpected fees, currency fluctuations, and hidden expenses that blow your budget.",
    color: "text-destructive-500"
  },
  {
    icon: FileText,
    title: "Complex Paperwork",
    description: "Overwhelming documentation requirements, forms, and bureaucratic red tape.",
    color: "text-destructive-500"
  },
  {
    icon: Globe,
    title: "Cultural Barriers",
    description: "Language barriers, cultural differences, and lack of local knowledge.",
    color: "text-destructive-500"
  },
  {
    icon: Users,
    title: "Unreliable Services",
    description: "Inconsistent service quality, lack of transparency, and poor communication.",
    color: "text-destructive-500"
  },
  {
    icon: AlertTriangle,
    title: "Legal Risks",
    description: "Compliance issues, visa rejections, and legal complications that can derail your plans.",
    color: "text-destructive-500"
  }
];

export default function ProblemSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Relocation shouldn't be this
            <span className="block text-destructive">complicated</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Moving to a new country is one of life's biggest decisions, but the process 
            is often filled with obstacles that make it unnecessarily difficult.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon;
            return (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-warm transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-destructive-200"
              >
                <div className="mb-6">
                  <div className={`w-12 h-12 ${problem.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
            <span>Sound familiar? You're not alone.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
