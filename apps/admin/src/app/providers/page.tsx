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
import { Provider } from "@portalis/shared";

function ProvidersManagement() {
  const [isCreating, setIsCreating] = useState(false);

  const { data: providers, isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: () => apiClient.get<Provider[]>("/api/providers"),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Providers</h1>
        <Button onClick={() => setIsCreating(true)}>Add Provider</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Providers</CardTitle>
          <CardDescription>Manage immigration service providers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading providers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers?.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.country.name}</TableCell>
                    <TableCell>{provider.city}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-1">⭐</span>
                        {provider.rating.toFixed(1)}
                      </div>
                    </TableCell>
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
            <CardTitle>Add New Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provider Name</label>
                <input className="w-full p-2 border rounded-md" placeholder="Immigration Law Firm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full p-2 border rounded-md" placeholder="contact@firm.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input className="w-full p-2 border rounded-md" placeholder="Tbilisi" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full p-2 border rounded-md" placeholder="+995 xxx xxx xxx" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <input type="number" min="0" max="5" step="0.1" className="w-full p-2 border rounded-md" placeholder="4.5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Georgia</option>
                  <option>Paraguay</option>
                  <option>Hungary</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Services</label>
                <textarea className="w-full p-2 border rounded-md" rows={3} placeholder="List of services offered..."></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button>Create Provider</Button>
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

export default function ProvidersPage() {
  return (
    <Providers>
      <AuthProvider>
        <ProvidersPageContent />
      </AuthProvider>
    </Providers>
  );
}

function ProvidersPageContent() {
  const { user } = useAuth();

  return (
    <>
      {!user ? (
        <LoginForm />
      ) : (
        <AdminLayout>
          <ProvidersManagement />
        </AdminLayout>
      )}
    </>
  );
}
