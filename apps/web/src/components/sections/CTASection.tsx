'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';
import { getContent, type Locale } from '../../lib/i18n';

interface CTASectionProps {
  locale: Locale;
}

export default function CTASection({ locale }: CTASectionProps) {
  const content = getContent(locale);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Honeypot field for bots

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    // Honeypot check - if filled, it's likely a bot
    if (honeypot) {
      console.log('Bot detected via honeypot');
      return;
    }
    
    setIsLoading(true);
    setIsAlreadyRegistered(false);
    setIsSubmitted(false);
    setError('');
    
    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, honeypot }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
        setTimeout(() => setIsSubmitted(false), 5000);
      } else if (response.status === 409) {
        // Email already registered
        setIsAlreadyRegistered(true);
        setTimeout(() => setIsAlreadyRegistered(false), 5000);
      } else {
        console.error('Registration error:', data);
        setError(data.error || 'Failed to register. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please check your connection and try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = content.cta.benefits;

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {content.cta.headline}
            <span className="block">{content.cta.subtitle}</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            {content.cta.description}
          </p>

          {/* Email Signup Form */}
          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              {/* Honeypot field - hidden from users but visible to bots */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ 
                  position: 'absolute', 
                  left: '-9999px', 
                  opacity: 0, 
                  pointerEvents: 'none' 
                }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={content.cta.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="group bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-warm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>{content.cta.button}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
            
            {isSubmitted && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-white/90">
                <CheckCircle className="w-5 h-5" />
                <span>Thank you! We'll be in touch soon.</span>
              </div>
            )}
            
            {isAlreadyRegistered && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-white/90">
                <CheckCircle className="w-5 h-5" />
                <span>You're already registered! We'll notify you when we launch.</span>
              </div>
            )}
            
            {error && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-red-200">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm mb-4">
              {content.cta.trustedBy}
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {content.cta.companies.map((company, index) => (
                <div key={index} className="text-white/50 font-semibold">{company}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
