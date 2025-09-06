"use client";

import Link from "next/link";

interface Props {
  countryCode: string;
}

const COUNTRY_INFO: Record<string, { name: string; flag: string; region: string }> = {
  DE: { name: "Germany", flag: "🇩🇪", region: "Europe" },
  ES: { name: "Spain", flag: "🇪🇸", region: "Europe" },
  PT: { name: "Portugal", flag: "🇵🇹", region: "Europe" },
  FR: { name: "France", flag: "🇫🇷", region: "Europe" },
  IT: { name: "Italy", flag: "🇮🇹", region: "Europe" },
  NL: { name: "Netherlands", flag: "🇳🇱", region: "Europe" },
  US: { name: "United States", flag: "🇺🇸", region: "North America" },
  GB: { name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  CA: { name: "Canada", flag: "🇨🇦", region: "North America" },
  AU: { name: "Australia", flag: "🇦🇺", region: "Oceania" },
  SG: { name: "Singapore", flag: "🇸🇬", region: "Asia" },
  JP: { name: "Japan", flag: "🇯🇵", region: "Asia" },
  CH: { name: "Switzerland", flag: "🇨🇭", region: "Europe" },
  AT: { name: "Austria", flag: "🇦🇹", region: "Europe" },
  BE: { name: "Belgium", flag: "🇧🇪", region: "Europe" },
  DK: { name: "Denmark", flag: "🇩🇰", region: "Europe" },
  SE: { name: "Sweden", flag: "🇸🇪", region: "Europe" },
  NO: { name: "Norway", flag: "🇳🇴", region: "Europe" },
  FI: { name: "Finland", flag: "🇫🇮", region: "Europe" },
  PL: { name: "Poland", flag: "🇵🇱", region: "Europe" },
};

export function CountryHeader({ countryCode }: Props) {
  const country = COUNTRY_INFO[countryCode] || {
    name: countryCode,
    flag: "🏳️",
    region: "Unknown"
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            href="/en" 
            className="text-blue-200 hover:text-white transition-colors"
          >
            ← Back to Countries
          </Link>
        </nav>

        {/* Country Header */}
        <div className="flex items-center">
          <span className="text-6xl mr-6">{country.flag}</span>
          <div>
            <h1 className="text-4xl font-bold mb-2">{country.name}</h1>
            <div className="flex items-center space-x-4 text-blue-200">
              <span className="text-lg">{country.region}</span>
              <span>•</span>
              <span className="text-lg font-mono">{countryCode}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">📊</div>
            <div className="text-sm text-blue-200">Economic Data</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">🛡️</div>
            <div className="text-sm text-blue-200">Travel Safety</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">🌬️</div>
            <div className="text-sm text-blue-200">Air Quality</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">⏱️</div>
            <div className="text-sm text-blue-200">Real-time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
