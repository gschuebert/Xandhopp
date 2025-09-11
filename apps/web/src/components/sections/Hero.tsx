'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ContentSchema } from '../../../content/schema';
import type { Locale } from '../../lib/i18n';

interface HeroProps {
  content: ContentSchema;
  locale: Locale;
}

export function Hero({ content, locale }: HeroProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="home" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-32 pb-20">
      <div className="container-default text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Portalis Logo"
                width={300}
                height={100}
                className="h-24 w-auto"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="hidden text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                  {content.hero.title}
                </h1>
                <h2 className="text-2xl md:text-3xl text-blue-600 font-medium">
                  {content.hero.subtitle}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            {content.hero.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
            <Link
              href={`/${locale}/register`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-10 rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Started
            </Link>
            <button
              onClick={() => scrollToSection('solution')}
              className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-4 px-10 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}