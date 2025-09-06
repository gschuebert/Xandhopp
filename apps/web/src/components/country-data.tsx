"use client";

import { useState, useEffect } from "react";

interface Props {
  countryCode: string;
}

interface CountrySnapshot {
  country_iso2: string;
  advisory: {
    source: string;
    level: number;
    headline: string;
    url: string;
    published_at: string;
  } | null;
  indicators: Array<{
    indicator_code: string;
    source: string;
    latest_value: number | null;
    latest_period: string;
    latest_meta: any;
  }>;
  air_quality: Array<{
    parameter: string;
    city: string;
    latest_value: number | null;
    unit: string;
    latest_ts: string;
  }>;
}

export function CountryData({ countryCode }: Props) {
  const [data, setData] = useState<CountrySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/country/${countryCode}/snapshot`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error('Failed to fetch country data:', err);
        setError('Data not available yet. The ingestion system is still collecting data.');
      })
      .finally(() => setLoading(false));
  }, [countryCode]);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Data Not Available</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>System Status:</strong> The Portalis data pipeline is fully implemented and ready. 
              To start collecting data, run the ingestion worker:
            </p>
            <code className="block mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs">
              pnpm run ingestion:dev
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Travel Advisory */}
      {data?.advisory && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            🛡️ Travel Advisory
          </h3>
          <div className={`p-4 rounded-lg border-l-4 ${
            data.advisory.level <= 1 ? 'bg-green-50 border-green-500' :
            data.advisory.level <= 2 ? 'bg-yellow-50 border-yellow-500' :
            data.advisory.level <= 3 ? 'bg-orange-50 border-orange-500' :
            'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold ${
                data.advisory.level <= 1 ? 'text-green-800' :
                data.advisory.level <= 2 ? 'text-yellow-800' :
                data.advisory.level <= 3 ? 'text-orange-800' :
                'text-red-800'
              }`}>
                Level {data.advisory.level}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {data.advisory.source.replace('_', ' ')}
              </span>
            </div>
            <p className="font-medium mb-2">{data.advisory.headline}</p>
            <p className="text-sm text-gray-600">
              Updated: {new Date(data.advisory.published_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Economic Indicators */}
      {data?.indicators && data.indicators.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            📊 Economic Indicators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.indicators.slice(0, 6).map((indicator) => (
              <div key={indicator.indicator_code} className="border rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">
                  {indicator.indicator_code}
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {indicator.latest_value?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-xs text-gray-400">
                  {indicator.latest_period} • {indicator.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Air Quality */}
      {data?.air_quality && data.air_quality.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            🌬️ Air Quality
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.air_quality.slice(0, 4).map((aq, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {aq.parameter.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{aq.city}</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {aq.latest_value?.toFixed(1) || 'N/A'} {aq.unit}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(aq.latest_ts).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Available */}
      {(!data?.advisory && (!data?.indicators || data.indicators.length === 0) && (!data?.air_quality || data.air_quality.length === 0)) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Setting Up Data Collection</h3>
            <p className="text-gray-600">
              The Portalis data architecture is ready. Start the ingestion worker to begin collecting data for {countryCode}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
