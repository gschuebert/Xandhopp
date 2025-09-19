'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, LogOut } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { type Locale, isValidLocale, getContent } from '../lib/i18n';

interface NavigationProps {
  locale: string;
}

export default function Navigation({ locale }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Ensure locale is valid
  const currentLocale: Locale = isValidLocale(locale) ? locale : 'en';
  const content = getContent(currentLocale);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Listen for user updates
    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      setUser(null);
      window.location.href = `/${locale}/signin`;
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <div className="relative" style={{ width: '305px', height: '80px' }}>
              <Image
                src="/logo.png"
                alt="Xandhopp"
                title="Xandhopp"
                fill
                sizes="305px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/${locale}`} 
              className="text-gray-700 hover:text-primary transition-colors duration-200"
            >
              {content.nav.home}
            </Link>
            <Link 
              href={`/${locale}/countrys`} 
              className="text-gray-700 hover:text-primary transition-colors duration-200"
            >
              {content.nav.countries}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href={`/${locale}/profile`}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>{content.nav.profile}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-destructive transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{content.nav.signOut}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href={`/${locale}/signin`}
                  className="text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  {content.nav.signin}
                </Link>
                <Link 
                  href={`/${locale}/register`}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                >
                  {content.nav.register}
                </Link>
              </div>
            )}
            
            {/* Language Switcher - moved to far right */}
            <LanguageSwitcher currentLocale={currentLocale} />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href={`/${locale}`} 
                className="text-gray-700 hover:text-primary transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {content.nav.home}
              </Link>
              <Link 
                href={`/${locale}/countrys`} 
                className="text-gray-700 hover:text-primary transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {content.nav.countries}
              </Link>
              
              {/* Language Switcher for Mobile */}
              <div className="pt-2 border-t border-gray-200">
                <LanguageSwitcher currentLocale={currentLocale} />
              </div>
              
              {user ? (
                <>
                  <Link 
                    href={`/${locale}/profile`}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{content.nav.profile}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-destructive transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{content.nav.signOut}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href={`/${locale}/signin`}
                    className="text-gray-700 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {content.nav.signin}
                  </Link>
                  <Link 
                    href={`/${locale}/register`}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {content.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
