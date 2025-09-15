// Main exports for @xandhopp/connectors package

// HTTP utilities
export * from "./http.js";

// World Bank connector
export * from "./worldbank.js";

// Travel advisory connectors
export * from "./stateDept.js";
export * from "./fcdo.js";

// Air quality connector
export * from "./openaq.js";

// Type definitions for normalized data
export interface BaseIndicator {
  country_iso2: string;
  source: string;
  ingested_at?: string;
}

export interface IndicatorData extends BaseIndicator {
  indicator_code: string;
  period: string;
  value: number | null;
  meta: Record<string, any>;
}

export interface AdvisoryData extends BaseIndicator {
  level: number;
  headline: string;
  url: string;
  published_at: string;
  payload: Record<string, any>;
}

export interface AirQualityData extends BaseIndicator {
  city: string;
  parameter: string;
  ts: string;
  value: number | null;
  unit: string;
}

export interface CostOfLivingData extends BaseIndicator {
  city: string;
  category: string;
  item: string;
  value: number | null;
  currency: string;
  period: string;
}

// Common country codes for EU residency programs
export const EU_COUNTRY_CODES = [
  "AT", // Austria
  "BE", // Belgium
  "BG", // Bulgaria
  "HR", // Croatia
  "CY", // Cyprus
  "CZ", // Czech Republic
  "DK", // Denmark
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IE", // Ireland
  "IT", // Italy
  "LV", // Latvia
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "NL", // Netherlands
  "PL", // Poland
  "PT", // Portugal
  "RO", // Romania
  "SK", // Slovakia
  "SI", // Slovenia
  "ES", // Spain
  "SE", // Sweden
] as const;

// Popular residency program countries
export const RESIDENCY_PROGRAM_COUNTRIES = [
  ...EU_COUNTRY_CODES,
  "US", // United States
  "CA", // Canada
  "AU", // Australia
  "NZ", // New Zealand
  "CH", // Switzerland
  "NO", // Norway
  "IS", // Iceland
  "LI", // Liechtenstein
  "MC", // Monaco
  "AD", // Andorra
  "SM", // San Marino
  "VA", // Vatican City
  "GB", // United Kingdom
  "JE", // Jersey
  "GG", // Guernsey
  "IM", // Isle of Man
  "SG", // Singapore
  "HK", // Hong Kong
  "JP", // Japan
  "KR", // South Korea
  "TW", // Taiwan
  "MY", // Malaysia
  "TH", // Thailand
  "PH", // Philippines
  "ID", // Indonesia
  "VN", // Vietnam
  "IN", // India
  "AE", // UAE
  "QA", // Qatar
  "BH", // Bahrain
  "OM", // Oman
  "KW", // Kuwait
  "SA", // Saudi Arabia
  "IL", // Israel
  "TR", // Turkey
  "GE", // Georgia
  "AM", // Armenia
  "AZ", // Azerbaijan
  "KZ", // Kazakhstan
  "UZ", // Uzbekistan
  "KG", // Kyrgyzstan
  "TJ", // Tajikistan
  "TM", // Turkmenistan
  "MN", // Mongolia
  "RU", // Russia
  "UA", // Ukraine
  "BY", // Belarus
  "MD", // Moldova
  "ZA", // South Africa
  "EG", // Egypt
  "MA", // Morocco
  "TN", // Tunisia
  "MX", // Mexico
  "BR", // Brazil
  "AR", // Argentina
  "CL", // Chile
  "CO", // Colombia
  "PE", // Peru
  "UY", // Uruguay
  "PY", // Paraguay
  "EC", // Ecuador
  "BO", // Bolivia
  "VE", // Venezuela
] as const;

export type CountryCode = typeof RESIDENCY_PROGRAM_COUNTRIES[number];
export type EUCountryCode = typeof EU_COUNTRY_CODES[number];
