'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function InvalidPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (reason) {
      case 'missing_token':
        return {
          title: 'Invalid Link',
          message: 'The confirmation link is missing required information.',
          suggestion: 'Please check your email and click the link again.'
        };
      case 'invalid_token':
        return {
          title: 'Link Expired',
          message: 'This confirmation link has expired or is invalid.',
          suggestion: 'Please request a new confirmation email.'
        };
      default:
        return {
          title: 'Something went wrong',
          message: 'We encountered an error processing your request.',
          suggestion: 'Please try again or contact support if the problem persists.'
        };
    }
  };

  const { title, message, suggestion } = getErrorMessage();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-xandhopp-blue">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            {suggestion}
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Need help?
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    If you're having trouble, please{' '}
                    <a
                      href="mailto:contact@xandhopp.com"
                      className="font-medium underline hover:text-yellow-600"
                    >
                      contact our support team
                    </a>
                    {' '}and we'll help you get sorted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-xandhopp-blue hover:bg-xandhopp-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-xandhopp-orange"
          >
            Back to Home
          </Link>
          
          <div className="text-sm text-gray-600">
            <p>
              Want to try again?{' '}
              <Link
                href="/signup"
                className="font-medium text-xandhopp-orange hover:text-xandhopp-orange-light"
              >
                Sign up for early access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
