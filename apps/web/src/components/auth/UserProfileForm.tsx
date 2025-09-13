'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, MapPin, Briefcase, Globe, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { getContent, type Locale } from '../../lib/i18n';

interface UserProfileFormProps {
  locale: string;
  user?: any;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentCountry?: string;
  currentCity?: string;
  profession?: string;
  company?: string;
  website?: string;
  linkedin?: string;
  bio?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  preferredLanguage?: string;
  timezone?: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  profilePublic: boolean;
}

export default function UserProfileForm({ locale, user, onSuccess, onError }: UserProfileFormProps) {
  const router = useRouter();
  const content = getContent(locale as Locale);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    email: '',
    emailNotifications: true,
    marketingEmails: true,
    profilePublic: false,
    preferredLanguage: locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    if (user) {
      setProfile({
        ...profile,
        ...user,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      });
    } else {
      // Load user data from API if no user prop provided
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      // First, try to get user data from localStorage (from login)
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setProfile({
            ...profile,
            ...userData,
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          });
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }

      // Then try to load additional profile data from API
      const userData = storedUser ? JSON.parse(storedUser) : null;
      console.log('UserProfileForm: Loading profile for user:', userData);
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-data': JSON.stringify(userData),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setProfile(prevProfile => ({
            ...prevProfile,
            ...data.user,
            dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : '',
          }));
        }
      } else {
        // If API fails but we have stored user data, that's okay
        if (!storedUser) {
          setError('Failed to load profile data');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      if (!localStorage.getItem('user')) {
        setError('Failed to load profile data');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : {};
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-data': JSON.stringify(userData),
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.status === 200) {
        setSuccess(content.forms.profile.success.profileUpdated);
        setProfile(data.user);
        
        // Update localStorage with new user data
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('userUpdated'));
        }
        
        if (onSuccess) onSuccess(data.user);
      } else {
        setError(data.error || content.forms.profile.errors.updateFailed);
        if (onError) onError(data.error || content.forms.profile.errors.updateFailed);
      }
    } catch (err) {
      setError(content.forms.profile.errors.networkError);
      if (onError) onError(content.forms.profile.errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.profile.personal.firstName}
          </label>
          <input
            type="text"
            id="firstName"
            value={profile.firstName || ''}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.profile.personal.lastName}
          </label>
          <input
            type="text"
            id="lastName"
            value={profile.lastName || ''}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.personal.email}
        </label>
        <input
          type="email"
          id="email"
          value={profile.email}
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">{content.forms.profile.personal.emailCannotBeChanged}</p>
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.personal.dateOfBirth}
        </label>
        <input
          type="date"
          id="dateOfBirth"
          value={profile.dateOfBirth || ''}
          onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.personal.nationality}
        </label>
        <select
          id="nationality"
          value={profile.nationality || ''}
          onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{content.forms.profile.personal.selectNationality}</option>
          <option value="DE">{content.forms.countries.germany}</option>
          <option value="US">{content.forms.countries.unitedStates}</option>
          <option value="GB">{content.forms.countries.unitedKingdom}</option>
          <option value="FR">{content.forms.countries.france}</option>
          <option value="IT">{content.forms.countries.italy}</option>
          <option value="ES">{content.forms.countries.spain}</option>
          <option value="NL">{content.forms.countries.netherlands}</option>
          <option value="CH">{content.forms.countries.switzerland}</option>
          <option value="AT">{content.forms.countries.austria}</option>
          <option value="CA">{content.forms.countries.canada}</option>
          <option value="AU">{content.forms.countries.australia}</option>
          <option value="OTHER">{content.forms.countries.other}</option>
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.personal.bio}
        </label>
        <textarea
          id="bio"
          value={profile.bio || ''}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={content.forms.profile.personal.bioPlaceholder}
        />
      </div>
    </div>
  );

  const renderLocationTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="currentCountry" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.location.currentCountry}
        </label>
        <select
          id="currentCountry"
          value={profile.currentCountry || ''}
          onChange={(e) => setProfile({ ...profile, currentCountry: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{content.forms.profile.location.selectCurrentCountry}</option>
          <option value="DE">{content.forms.countries.germany}</option>
          <option value="US">{content.forms.countries.unitedStates}</option>
          <option value="GB">{content.forms.countries.unitedKingdom}</option>
          <option value="FR">{content.forms.countries.france}</option>
          <option value="IT">{content.forms.countries.italy}</option>
          <option value="ES">{content.forms.countries.spain}</option>
          <option value="NL">{content.forms.countries.netherlands}</option>
          <option value="CH">{content.forms.countries.switzerland}</option>
          <option value="AT">{content.forms.countries.austria}</option>
          <option value="CA">{content.forms.countries.canada}</option>
          <option value="AU">{content.forms.countries.australia}</option>
          <option value="OTHER">{content.forms.countries.other}</option>
        </select>
      </div>

      <div>
        <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.location.currentCity}
        </label>
        <input
          type="text"
          id="currentCity"
          value={profile.currentCity || ''}
          onChange={(e) => setProfile({ ...profile, currentCity: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Berlin"
        />
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{content.forms.profile.location.addressDetails}</h4>
        
        <div>
          <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.profile.location.addressLine1}
          </label>
          <input
            type="text"
            id="addressLine1"
            value={profile.addressLine1 || ''}
            onChange={(e) => setProfile({ ...profile, addressLine1: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123 Main Street"
          />
        </div>

        <div>
          <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
            {content.forms.profile.location.addressLine2}
          </label>
          <input
            type="text"
            id="addressLine2"
            value={profile.addressLine2 || ''}
            onChange={(e) => setProfile({ ...profile, addressLine2: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Apartment, suite, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              {content.forms.profile.location.city}
            </label>
            <input
              type="text"
              id="city"
              value={profile.city || ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Berlin"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              {content.forms.profile.location.state}
            </label>
            <input
              type="text"
              id="state"
              value={profile.state || ''}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Berlin"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              {content.forms.profile.location.postalCode}
            </label>
            <input
              type="text"
              id="postalCode"
              value={profile.postalCode || ''}
              onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10115"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              {content.forms.profile.location.country}
            </label>
            <select
              id="country"
              value={profile.country || ''}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{content.forms.profile.location.selectCountry}</option>
              <option value="DE">{content.forms.countries.germany}</option>
              <option value="US">{content.forms.countries.unitedStates}</option>
              <option value="GB">{content.forms.countries.unitedKingdom}</option>
              <option value="FR">{content.forms.countries.france}</option>
              <option value="IT">{content.forms.countries.italy}</option>
              <option value="ES">{content.forms.countries.spain}</option>
              <option value="NL">{content.forms.countries.netherlands}</option>
              <option value="CH">{content.forms.countries.switzerland}</option>
              <option value="AT">{content.forms.countries.austria}</option>
              <option value="CA">{content.forms.countries.canada}</option>
              <option value="AU">{content.forms.countries.australia}</option>
              <option value="OTHER">{content.forms.countries.other}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.professional.profession}
        </label>
        <input
          type="text"
          id="profession"
          value={profile.profession || ''}
          onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Software Engineer"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.professional.company}
        </label>
        <input
          type="text"
          id="company"
          value={profile.company || ''}
          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tech Corp"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.professional.website}
        </label>
        <input
          type="url"
          id="website"
          value={profile.website || ''}
          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.professional.linkedin}
        </label>
        <input
          type="url"
          id="linkedin"
          value={profile.linkedin || ''}
          onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.settings.preferredLanguage}
        </label>
        <select
          id="preferredLanguage"
          value={profile.preferredLanguage || locale}
          onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
          {content.forms.profile.settings.timezone}
        </label>
        <select
          id="timezone"
          value={profile.timezone || ''}
          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Europe/Berlin">Europe/Berlin</option>
          <option value="Europe/London">Europe/London</option>
          <option value="America/New_York">America/New_York</option>
          <option value="America/Los_Angeles">America/Los_Angeles</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
          <option value="Australia/Sydney">Australia/Sydney</option>
        </select>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">{content.forms.profile.settings.emailPreferences}</h4>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={profile.emailNotifications}
            onChange={(e) => setProfile({ ...profile, emailNotifications: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
            {content.forms.profile.settings.receiveNotifications}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="marketingEmails"
            checked={profile.marketingEmails}
            onChange={(e) => setProfile({ ...profile, marketingEmails: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="marketingEmails" className="ml-2 block text-sm text-gray-700">
            {content.forms.profile.settings.receiveMarketing}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="profilePublic"
            checked={profile.profilePublic}
            onChange={(e) => setProfile({ ...profile, profilePublic: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="profilePublic" className="ml-2 block text-sm text-gray-700">
            {content.forms.profile.settings.makeProfilePublic}
          </label>
        </div>
      </div>
    </div>
  );

  const getCountryName = (code: string) => {
    const countryMap: { [key: string]: string } = {
      'DE': content.forms.countries.germany,
      'US': content.forms.countries.unitedStates,
      'GB': content.forms.countries.unitedKingdom,
      'FR': content.forms.countries.france,
      'IT': content.forms.countries.italy,
      'ES': content.forms.countries.spain,
      'NL': content.forms.countries.netherlands,
      'CH': content.forms.countries.switzerland,
      'AT': content.forms.countries.austria,
      'CA': content.forms.countries.canada,
      'AU': content.forms.countries.australia,
      'OTHER': content.forms.countries.other,
    };
    return countryMap[code] || code;
  };

  const tabs = [
    { id: 'personal', label: content.forms.profile.tabs.personal, icon: User },
    { id: 'location', label: content.forms.profile.tabs.location, icon: MapPin },
    { id: 'professional', label: content.forms.profile.tabs.professional, icon: Briefcase },
    { id: 'settings', label: content.forms.profile.tabs.settings, icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.forms.profile.title}</h2>
        <p className="text-gray-600">{content.forms.profile.subtitle}</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'personal' && renderPersonalTab()}
        {activeTab === 'location' && renderLocationTab()}
        {activeTab === 'professional' && renderProfessionalTab()}
        {activeTab === 'settings' && renderSettingsTab()}

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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? content.forms.profile.saving : content.forms.profile.saveChanges}
          </button>
        </div>
      </form>
    </div>
  );
}
