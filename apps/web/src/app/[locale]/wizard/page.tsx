import Link from 'next/link';
import { PortalisLogo } from '../../../components/xandhopp-logo';
import { getContent, type Locale } from '../../../lib/i18n';

interface WizardPageProps {
  params: {
    locale: Locale;
  };
}

export default function WizardPage({ params }: WizardPageProps) {
  const content = getContent(params.locale);

  return (
    <div className="min-h-screen bg-xandhopp-bg">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container-default">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${params.locale}`} className="flex items-center space-x-3">
              <PortalisLogo size="sm" />
              <span className="text-xl font-bold text-amber-900">PORTALIS</span>
            </Link>
            <Link
              href={`/${params.locale}`}
              className="btn btn-secondary"
            >
              {content.placeholders.backToHome}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-default py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-xandhopp-accent to-xandhopp-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">
              {content.teasers.wizard.headline}
            </h1>
            
            <p className="text-xl text-amber-700 mb-8 leading-relaxed">
              {content.teasers.wizard.description}
            </p>
            
            <div className="bg-amber-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">
                {content.placeholders.comingSoon}
              </h2>
              <p className="text-amber-700">
                Our intelligent wizard will ask you about your priorities, budget, and circumstances to provide personalized country recommendations.
              </p>
            </div>
            
            <Link
              href={`/${params.locale}#wizard`}
              className="btn btn-primary text-lg px-8 py-4"
            >
              {content.placeholders.backToHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}