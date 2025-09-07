import Link from 'next/link';
import { XandhoppLogo } from '../../../components/xandhopp-logo';
import { getContent, type Locale } from '../../../lib/i18n';

interface CountriesPageProps {
  params: {
    locale: Locale;
  };
}

export default function CountriesPage({ params }: CountriesPageProps) {
  const content = getContent(params.locale);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container-default">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${params.locale}`} className="flex items-center space-x-3">
              <XandhoppLogo size="sm" />
              <span className="text-xl font-bold text-xandhopp-blue">Xandhopp</span>
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
            <div className="w-24 h-24 bg-gradient-to-br from-portalis-accent to-portalis-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-xandhopp-blue mb-6">
              {content.teasers.countries.headline}
            </h1>
            
            <p className="text-xl text-xandhopp-blue/80 mb-8 leading-relaxed">
              {content.teasers.countries.description}
            </p>
            
            <div className="bg-amber-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-xandhopp-blue mb-4">
                {content.placeholders.comingSoon}
              </h2>
              <p className="text-xandhopp-blue/80">
                We're building a comprehensive database of countries with detailed information about visa requirements, costs, and living conditions.
              </p>
            </div>
            
            <Link
              href={`/${params.locale}#countries`}
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