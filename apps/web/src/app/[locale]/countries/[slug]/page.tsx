import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@portalis/ui";
import { apiClient } from "../../../../lib/api";
import { Country } from "@portalis/shared";

interface CountryPageProps {
  params: { slug: string; locale: string };
}

async function getCountry(slug: string): Promise<Country | null> {
  try {
    return await apiClient.get<Country>(`/api/countries/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const country = await getCountry(params.slug);

  if (!country) {
    return {
      title: "Country Not Found",
    };
  }

  return {
    title: `${country.name} - Residency & Investment Guide | Portalis`,
    description: country.summary || `Discover residency programs, tax rates, and living costs in ${country.name}. Complete guide for expats and investors.`,
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const country = await getCountry(params.slug);

  if (!country) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold">{country.name}</h1>
          <span className="text-lg text-muted-foreground">({country.iso2})</span>
        </div>
        <p className="text-xl text-muted-foreground">{country.continent}</p>
        {country.summary && (
          <p className="mt-4 text-lg">{country.summary}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Cost of Living</CardTitle>
            <CardDescription>Relative to New York City (100)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {country.costOfLivingIndex}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Rate</CardTitle>
            <CardDescription>Corporate/Personal Tax</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {country.taxRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Continent</CardTitle>
            <CardDescription>Geographic Region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {country.continent}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Residency Programs</CardTitle>
            <CardDescription>Available immigration pathways</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Loading residency programs...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Providers</CardTitle>
            <CardDescription>Verified immigration experts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Loading service providers...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
