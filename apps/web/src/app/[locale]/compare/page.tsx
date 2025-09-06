import Link from 'next/link';
import { PortalisLogo } from '../../../components/portalis-logo';
import { getContent, type Locale } from '../../../lib/i18n';

interface ComparePageProps {
  params: {
    locale: Locale;
  };
}

export default function ComparePage({ params }: ComparePageProps) {
  const content = getContent(params.locale);

  return (
    <div className="min-h-screen bg-portalis-bg">
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
            <div className="w-24 h-24 bg-gradient-to-br from-portalis-accent to-portalis-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">
              {content.teasers.compare.headline}
            </h1>
            
            <p className="text-xl text-amber-700 mb-8 leading-relaxed">
              {content.teasers.compare.description}
            </p>
            
            <div className="bg-amber-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">
                {content.placeholders.comingSoon}
              </h2>
              <p className="text-amber-700">
                Our comparison tool will help you evaluate multiple destinations side-by-side across all the factors that matter for your perfect move.
              </p>
            </div>
            
            <Link
              href={`/${params.locale}#compare`}
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