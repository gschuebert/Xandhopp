'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { getContent, type Locale } from '../../lib/i18n';

interface HeroProps {
  locale: Locale;
}

export default function Hero({ locale }: HeroProps) {
  const content = getContent(locale);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <Image
                src="/logo.png"
                alt="Xandhopp"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {content.hero.title}
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {content.hero.subtitle}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {content.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href={`/${locale}/register`}
              className="group bg-gradient-to-r from-primary to-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-warm hover:shadow-elegant transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>{content.hero.ctaPrimary}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            
            <button className="group flex items-center space-x-3 text-gray-700 hover:text-primary transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-full shadow-soft flex items-center justify-center group-hover:shadow-warm transition-shadow duration-300">
                <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="font-medium">{content.hero.ctaSecondary}</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{content.hero.stats.countries}</div>
              <div className="text-gray-600">{content.hero.stats.countriesLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{content.hero.stats.relocations}</div>
              <div className="text-gray-600">{content.hero.stats.relocationsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{content.hero.stats.support}</div>
              <div className="text-gray-600">{content.hero.stats.supportLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary-100 rounded-full opacity-60 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-secondary-100 rounded-full opacity-60 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-5 w-12 h-12 bg-primary-200 rounded-full opacity-40 animate-pulse delay-500" />
    </section>
  );
}