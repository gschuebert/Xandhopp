import { PortalisLogo } from '../../../components/xandhopp-logo';
import UserProfileForm from '../../../components/auth/UserProfileForm';

interface ProfilePageProps {
  params: {
    locale: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <PortalisLogo size="md" />
        </div>
        <UserProfileForm locale={locale} />
      </div>
    </div>
  );
}
