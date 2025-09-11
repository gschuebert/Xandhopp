'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function WelcomePage() {
  const searchParams = useSearchParams();
  const status = searchParams?.get('status') || '';

  const getStatusMessage = () => {
    switch (status) {
      case 'confirmed':
        return {
          title: 'Welcome to Xandhopp!',
          message: 'Your email has been confirmed and you\'re now on our waitlist.',
          icon: 'success'
        };
      case 'already_confirmed':
        return {
          title: 'Already confirmed',
          message: 'Your email was already confirmed. You\'re all set!',
          icon: 'info'
        };
      default:
        return {
          title: 'Welcome!',
          message: 'Thank you for joining Xandhopp.',
          icon: 'success'
        };
    }
  };

  const { title, message, icon } = getStatusMessage();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            icon === 'success' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {icon === 'success' ? (
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-xandhopp-blue">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What's next?
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-xandhopp-orange mt-0.5">
                  ✓
                </span>
                <span className="ml-3">
                  You'll receive updates about our launch progress
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-xandhopp-orange mt-0.5">
                  ✓
                </span>
                <span className="ml-3">
                  Early access to new features and countries
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-xandhopp-orange mt-0.5">
                  ✓
                </span>
                <span className="ml-3">
                  Exclusive tips and insights for global relocation
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-xandhopp-blue hover:bg-xandhopp-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xandhopp-orange"
          >
            Explore Xandhopp
          </Link>
          
          <div className="text-sm text-gray-600">
            <p>
              Have questions?{' '}
              <a
                href="mailto:contact@xandhopp.com"
                className="font-medium text-xandhopp-orange hover:text-xandhopp-orange-light"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
