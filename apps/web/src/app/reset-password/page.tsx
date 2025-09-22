import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm locale="en" />
    </div>
  );
}
