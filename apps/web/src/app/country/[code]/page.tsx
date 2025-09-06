import { Suspense } from "react";
import { CountryHeader } from "../../../components/country-header";
import { CountryData } from "../../../components/country-data";
import { CountryCharts } from "../../../components/country-charts";

interface Props {
  params: {
    code: string;
  };
}

export default function CountryPage({ params }: Props) {
  const countryCode = params.code.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="p-8">Loading country information...</div>}>
        <CountryHeader countryCode={countryCode} />
      </Suspense>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Data Panel */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="bg-white rounded-lg shadow p-6">Loading data...</div>}>
              <CountryData countryCode={countryCode} />
            </Suspense>
          </div>

          {/* Charts Panel */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="bg-white rounded-lg shadow p-6">Loading charts...</div>}>
              <CountryCharts countryCode={countryCode} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
