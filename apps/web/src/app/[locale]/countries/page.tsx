"use client";

import { useQuery } from "@tanstack/react-query";
import { CountryCard } from "../../../components/country-card";
import { apiClient } from "../../../lib/api";
import { Country } from "@portalis/shared";

export default function CountriesPage() {
  const { data: countries, isLoading, error } = useQuery({
    queryKey: ["countries"],
    queryFn: () => apiClient.get<Country[]>("/api/countries"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading countries</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Countries</h1>
        <p className="text-muted-foreground">
          Explore residency and investment opportunities worldwide
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries?.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </div>
  );
}
