import Link from 'next/link';
import { PortalisLogo } from '../../../components/xandhopp-logo';
import { getContent, type Locale } from '../../../lib/i18n';

interface PrivacyPageProps {
  params: {
    locale: Locale;
  };
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
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
        <div className="max-w-4xl mx-auto">
          <div className="card p-12">
            <h1 className="text-4xl font-bold text-amber-900 mb-8">
              Privacy Policy
            </h1>
            
            <div className="bg-amber-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">
                {content.placeholders.comingSoon}
              </h2>
              <p className="text-amber-700">
                Our privacy policy will be available when we launch. We are committed to protecting your personal information and being transparent about how we collect, use, and share your data.
              </p>
            </div>
            
            <Link
              href={`/${params.locale}`}
              className="btn btn-primary"
            >
              {content.placeholders.backToHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
