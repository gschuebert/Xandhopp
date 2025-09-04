"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@portalis/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@portalis/ui";
import { useAuth, AuthProvider } from "../../lib/auth";
import { LoginForm } from "../../components/login-form";
import { Sidebar } from "../../components/sidebar";
import { Providers } from "../providers";
import { apiClient } from "../../lib/api";
import { Country } from "@portalis/shared";

function CountriesManagement() {
  const [isCreating, setIsCreating] = useState(false);

  const { data: countries, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: () => apiClient.get<Country[]>("/api/countries"),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Countries</h1>
        <Button onClick={() => setIsCreating(true)}>Add Country</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Countries</CardTitle>
          <CardDescription>Manage country information and settings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading countries...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ISO2</TableHead>
                  <TableHead>Continent</TableHead>
                  <TableHead>Cost of Living</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries?.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>{country.iso2}</TableCell>
                    <TableCell>{country.continent}</TableCell>
                    <TableCell>{country.costOfLivingIndex}</TableCell>
                    <TableCell>{country.taxRate}%</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isCreating && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add New Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="w-full p-2 border rounded-md" placeholder="Country name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ISO2 Code</label>
                <input className="w-full p-2 border rounded-md" placeholder="GE" maxLength={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Continent</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Europe</option>
                  <option>Asia</option>
                  <option>North America</option>
                  <option>South America</option>
                  <option>Africa</option>
                  <option>Oceania</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost of Living Index</label>
                <input type="number" className="w-full p-2 border rounded-md" placeholder="45.5" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea className="w-full p-2 border rounded-md" rows={3} placeholder="Brief description..."></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button>Create Country</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export default function CountriesPage() {
  return (
    <Providers>
      <AuthProvider>
        <CountriesPageContent />
      </AuthProvider>
    </Providers>
  );
}

function CountriesPageContent() {
  const { user } = useAuth();

  return (
    <>
      {!user ? (
        <LoginForm />
      ) : (
        <AdminLayout>
          <CountriesManagement />
        </AdminLayout>
      )}
    </>
  );
}
