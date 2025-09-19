import { XandhoppLogo } from '../../../components/xandhopp-logo';
import SignupForm from '../../../components/auth/SignupForm';

interface SignupPageProps {
  params: {
    locale: string;
  };
}

export default function SignupPage({ params }: SignupPageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XandhoppLogo size="lg" />
        </div>
        
        <SignupForm locale={locale} />
      </div>
    </div>
  );
}
