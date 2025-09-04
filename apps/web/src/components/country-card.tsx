import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@portalis/ui";
import { Country } from "@portalis/shared";

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  return (
    <Link href={`/countries/${country.slug}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{country.name}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {country.iso2}
            </span>
          </CardTitle>
          <CardDescription>{country.continent}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cost of Living:</span>
              <span className="font-medium">{country.costOfLivingIndex}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax Rate:</span>
              <span className="font-medium">{country.taxRate}%</span>
            </div>
            {country.summary && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {country.summary}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
