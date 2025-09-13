'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getContent, type Locale } from '../../lib/i18n';

interface SimpleLoginFormProps {
  locale: string;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function SimpleLoginForm({ locale, onSuccess, onError }: SimpleLoginFormProps) {
  const router = useRouter();
  const content = getContent(locale as Locale);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 200) {
        setSuccess(content.forms.login.success.loginSuccessful);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onSuccess) {
          onSuccess(data.user);
        }
        
        // Redirect to profile or dashboard
        router.push(`/${locale}/profile`);
      } else {
        setError(data.error || content.forms.login.errors.loginFailed);
        if (onError) onError(data.error || content.forms.login.errors.loginFailed);
      }
    } catch (err) {
      setError(content.forms.login.errors.networkError);
      if (onError) onError(content.forms.login.errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.forms.login.title}</h2>
        <p className="text-gray-600">{content.forms.login.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.login.email}
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.login.password}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-5 h-5 text-green-500 mr-2">✓</div>
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? content.forms.login.signingIn : content.forms.login.signIn}
        </button>

        <div className="text-center">
          <span className="text-gray-600 text-sm">{content.forms.login.dontHaveAccount} </span>
          <a href={`/${locale}/register`} className="text-blue-600 hover:text-blue-500 text-sm font-medium">
            {content.forms.login.createAccount}
          </a>
        </div>
      </form>
    </div>
  );
}
