'use client';

import { useState } from 'react';
import type { ContentSchema } from '../../../content/schema';

interface CtaProps {
  content: ContentSchema;
}

export function Cta({ content }: CtaProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(content.cta.successMessage);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || content.cta.errorMessage);
      }
    } catch (error) {
      setStatus('error');
      setMessage(content.cta.errorMessage);
    }
  };

  return (
    <section id="cta" className="section-padding bg-gradient-to-r from-xandhopp-orange to-xandhopp-orange-light">
      <div className="container-default">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {content.cta.headline}
          </h2>
          
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            {content.cta.subtitle}
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={content.cta.emailPlaceholder}
                required
                className="flex-1 px-6 py-4 rounded-2xl border-0 text-xandhopp-blue placeholder-xandhopp-blue/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn bg-white text-xandhopp-blue hover:bg-xandhopp-neutral-50 px-8 py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? '...' : content.cta.button}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 text-sm ${
                status === 'success' ? 'text-white' : 'text-red-200'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}