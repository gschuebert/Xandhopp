import Link from 'next/link';
import { PortalisLogo } from '../../../components/portalis-logo';
import { getContent, type Locale } from '../../../lib/i18n';

interface LoginPageProps {
  params: {
    locale: Locale;
  };
}

export default function LoginPage({ params }: LoginPageProps) {
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
        <div className="max-w-md mx-auto">
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-portalis-accent to-portalis-accent-light rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-amber-900 mb-6">
              {content.nav.login}
            </h1>
            
            <div className="bg-amber-50 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-amber-900 mb-4">
                {content.placeholders.comingSoon}
              </h2>
              <p className="text-amber-700">
                User authentication will be available when we launch. Join our early access list to be notified when login becomes available.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                href={`/${params.locale}#cta`}
                className="btn btn-primary w-full"
              >
                Join Early Access
              </Link>
              <Link
                href={`/${params.locale}`}
                className="btn btn-secondary w-full"
              >
                {content.placeholders.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}