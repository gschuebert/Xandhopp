"use client";

import { useState, useEffect } from "react";

interface Props {
  countryCode: string;
}

export function CountryCharts({ countryCode }: Props) {
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealthStatus)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Health</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              healthStatus?.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {healthStatus?.status === 'healthy' ? '✓ Healthy' : '⚠ Starting'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">ClickHouse</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              healthStatus?.services?.clickhouse ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {healthStatus?.services?.clickhouse ? '✓ Connected' : '✗ Connecting'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Data Sources</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm">World Bank API</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
            <span className="text-sm">US State Department</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm">FCDO (UK)</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-sm">OpenAQ</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            📊 View All Indicators
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            🛡️ Safety Details
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            🌬️ Air Quality Trends
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            📈 Economic Charts
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-2">Start Data Collection</h4>
        <p className="text-sm text-blue-800 mb-3">
          To see live data for {countryCode}, start the ingestion worker:
        </p>
        <code className="block p-2 bg-gray-800 text-green-400 rounded text-xs">
          pnpm run ingestion:dev
        </code>
      </div>
    </div>
  );
}
