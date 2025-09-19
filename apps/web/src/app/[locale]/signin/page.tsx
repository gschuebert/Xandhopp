import { XandhoppLogo } from '../../../components/xandhopp-logo';
import SimpleLoginForm from '../../../components/auth/SimpleLoginForm';

interface SigninPageProps {
  params: {
    locale: string;
  };
}

export default function SigninPage({ params }: SigninPageProps) {
  const { locale } = params;

  return (
    <div className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XandhoppLogo size="lg" />
        </div>
        <SimpleLoginForm locale={locale} />
      </div>
    </div>
  );
}
