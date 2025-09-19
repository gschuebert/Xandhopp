import { XandhoppLogo } from '../../../components/xandhopp-logo';
import SimpleRegistrationForm from '../../../components/auth/SimpleRegistrationForm';

interface RegisterPageProps {
  params: {
    locale: string;
  };
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <XandhoppLogo size="lg" />
        </div>
        <SimpleRegistrationForm locale={locale} />
      </div>
    </div>
  );
}
