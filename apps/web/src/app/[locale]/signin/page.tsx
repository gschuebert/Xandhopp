import { PortalisLogo } from '../../../components/portalis-logo';
import SimpleLoginForm from '../../../components/auth/SimpleLoginForm';

interface SigninPageProps {
  params: {
    locale: string;
  };
}

export default function SigninPage({ params }: SigninPageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <PortalisLogo size="lg" />
        </div>
        <SimpleLoginForm locale={locale} />
      </div>
    </div>
  );
}
