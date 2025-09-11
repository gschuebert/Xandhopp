'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface LoginFormProps {
  locale: string;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

interface LoginResponse {
  user: {
    id: number;
    email: string;
    role: string;
    email_verified: boolean;
    two_factor_enabled: boolean;
  };
  requires_2fa: boolean;
  is_suspicious: boolean;
  device_fingerprint: string;
  token?: string;
  message?: string;
}

export default function LoginForm({ locale, onSuccess, onError }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);

  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const fp = generateDeviceFingerprint();
      setDeviceFingerprint(fp);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          device_fingerprint: fp
        }),
      });

      const data: LoginResponse = await response.json();

      if (response.status === 200) {
        // Successful login
        setSuccess('Login successful!');
        localStorage.setItem('auth_token', data.token || '');
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onSuccess) {
          onSuccess(data.user);
        } else {
          router.push(`/${locale}/dashboard`);
        }
      } else if (response.status === 202) {
        // Requires 2FA or suspicious activity
        if (data.requires_2fa) {
          setRequires2FA(true);
          setSuccess('Please enter your 2FA code');
        } else if (data.is_suspicious) {
          setIsSuspicious(true);
          setSuccess('Suspicious activity detected. Please verify your identity.');
        }
      } else {
        setError(data.message || 'Login failed');
        if (onError) onError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      if (onError) onError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          code: twoFACode,
          device_fingerprint: deviceFingerprint,
          trust_device: trustDevice
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setSuccess('2FA verified successfully!');
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onSuccess) {
          onSuccess(data.user);
        } else {
          router.push(`/${locale}/dashboard`);
        }
      } else {
        setError(data.error || 'Invalid 2FA code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA || isSuspicious) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {requires2FA ? 'Two-Factor Authentication' : 'Security Verification'}
          </h2>
          <p className="text-gray-600">
            {requires2FA 
              ? 'Enter the 6-digit code from your authenticator app'
              : 'We detected unusual activity. Please verify your identity.'
            }
          </p>
        </div>

        <form onSubmit={handle2FA} className="space-y-6">
          <div>
            <label htmlFor="twofa-code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="twofa-code"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          {requires2FA && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="trust-device"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="trust-device" className="ml-2 block text-sm text-gray-700">
                Trust this device for 30 days
              </label>
            </div>
          )}

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || twoFACode.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setIsSuspicious(false);
              setTwoFACode('');
            }}
            className="w-full text-gray-600 py-2 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
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
            Password
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
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <a href={`/${locale}/forgot-password`} className="text-sm text-blue-600 hover:text-blue-500">
            Forgot password?
          </a>
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center">
          <span className="text-gray-600 text-sm">Don't have an account? </span>
          <a href={`/${locale}/register`} className="text-blue-600 hover:text-blue-500 text-sm font-medium">
            Create Account
          </a>
        </div>
      </form>
    </div>
  );
}
