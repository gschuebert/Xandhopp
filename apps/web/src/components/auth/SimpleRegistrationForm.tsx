'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getContent, type Locale } from '../../lib/i18n';

interface SimpleRegistrationFormProps {
  locale: string;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

interface RegistrationResponse {
  message: string;
  user_id: number;
  email_verification_required: boolean;
}

export default function SimpleRegistrationForm({ locale, onSuccess, onError }: SimpleRegistrationFormProps) {
  const router = useRouter();
  const content = getContent(locale as Locale);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false
  });
  
  const [honeypot, setHoneypot] = useState(''); // Honeypot field for bots
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Honeypot check - if filled, it's likely a bot
    if (honeypot) {
      console.log('Bot detected via honeypot');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    // Final validation
    if (formData.password !== formData.confirmPassword) {
      setError(content.forms.register.errors.passwordsDoNotMatch);
      setLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setError(content.forms.register.errors.passwordRequirements);
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError(content.forms.register.errors.acceptTerms);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, honeypot }),
      });

      const data: RegistrationResponse = await response.json();

      if (response.status === 201) {
        setSuccess(content.forms.register.success.accountCreated);
        setEmailSent(true);
        
        // Store user data if available
        if (data.user_id) {
          localStorage.setItem('user', JSON.stringify({ id: data.user_id, email: formData.email }));
        }
        
        if (onSuccess) {
          onSuccess({ id: data.user_id, email: formData.email });
        }
      } else {
        setError(data.message || content.forms.register.errors.registrationFailed);
        if (onError) onError(data.message || content.forms.register.errors.registrationFailed);
      }
    } catch (err) {
      setError(content.forms.register.errors.networkError);
      if (onError) onError(content.forms.register.errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 text-green-600 text-2xl">✓</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.forms.register.checkEmail}</h2>
          <p className="text-gray-600 mb-6">
            {content.forms.register.emailSent} <strong>{formData.email}</strong>. 
            {content.forms.register.sent}
          </p>
          
          <div className="space-y-4">
            
            <a
              href={`/${locale || 'en'}/signin`}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center block"
            >
              {content.forms.register.goToSignIn}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.forms.register.title}</h2>
        <p className="text-gray-600">{content.forms.register.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" method="post">
        {/* Honeypot field - hidden from users but visible to bots */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            opacity: 0, 
            pointerEvents: 'none' 
          }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              {content.forms.register.firstName} *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              {content.forms.register.lastName} *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.register.email} *
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
            {content.forms.register.password} *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a strong password"
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
          
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className={`text-xs flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.minLength ? 'bg-green-600' : 'bg-red-600'}`} />
                {content.forms.register.passwordRequirements.minLength}
              </div>
              <div className={`text-xs flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasUpperCase ? 'bg-green-600' : 'bg-red-600'}`} />
                {content.forms.register.passwordRequirements.uppercase}
              </div>
              <div className={`text-xs flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasLowerCase ? 'bg-green-600' : 'bg-red-600'}`} />
                {content.forms.register.passwordRequirements.lowercase}
              </div>
              <div className={`text-xs flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasNumbers ? 'bg-green-600' : 'bg-red-600'}`} />
                {content.forms.register.passwordRequirements.number}
              </div>
              <div className={`text-xs flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasSpecialChar ? 'bg-green-600' : 'bg-red-600'}`} />
                {content.forms.register.passwordRequirements.specialChar}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.register.confirmPassword} *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
          
          {formData.confirmPassword && (
            <div className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {formData.password === formData.confirmPassword ? content.forms.register.passwordsMatch : content.forms.register.passwordsDoNotMatch}
            </div>
          )}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
            {content.forms.register.acceptTerms}{' '}
            <a href={`/${locale || 'en'}/terms`} className="text-blue-600 hover:text-blue-500">
              {content.forms.register.termsOfService}
            </a>{' '}
            {content.forms.register.and}{' '}
            <a href={`/${locale || 'en'}/privacy`} className="text-blue-600 hover:text-blue-500">
              {content.forms.register.privacyPolicy}
            </a>
          </label>
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
          type="button"
          onClick={handleSubmit}
          disabled={loading || !passwordValidation.isValid || formData.password !== formData.confirmPassword || !formData.acceptTerms}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? content.forms.register.creatingAccount : content.forms.register.createAccount}
        </button>
      </form>

      <div className="text-center mt-6">
        <span className="text-gray-600 text-sm">{content.forms.register.alreadyHaveAccount} </span>
        <a href={`/${locale || 'en'}/signin`} className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          {content.forms.register.signIn}
        </a>
      </div>
    </div>
  );
}
