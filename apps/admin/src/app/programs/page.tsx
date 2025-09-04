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
import { ResidencyProgram } from "@portalis/shared";

function ProgramsManagement() {
  const [isCreating, setIsCreating] = useState(false);

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: () => apiClient.get<ResidencyProgram[]>("/api/residency_programs"),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Residency Programs</h1>
        <Button onClick={() => setIsCreating(true)}>Add Program</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>Manage residency and visa programs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading programs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs?.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>{program.country.name}</TableCell>
                    <TableCell className="capitalize">{program.type.replace('_', ' ')}</TableCell>
                    <TableCell>${program.fees.toLocaleString()}</TableCell>
                    <TableCell>{program.processingTimeDays} days</TableCell>
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
            <CardTitle>Add New Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Program Name</label>
                <input className="w-full p-2 border rounded-md" placeholder="Digital Nomad Visa" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="residency">Residency</option>
                  <option value="work">Work</option>
                  <option value="investor">Investor</option>
                  <option value="digital_nomad">Digital Nomad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fees (USD)</label>
                <input type="number" className="w-full p-2 border rounded-md" placeholder="1000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Processing Time (Days)</label>
                <input type="number" className="w-full p-2 border rounded-md" placeholder="30" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Requirements</label>
                <textarea className="w-full p-2 border rounded-md" rows={4} placeholder="List all requirements..."></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button>Create Program</Button>
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

export default function ProgramsPage() {
  return (
    <Providers>
      <AuthProvider>
        <ProgramsPageContent />
      </AuthProvider>
    </Providers>
  );
}

function ProgramsPageContent() {
  const { user } = useAuth();

  return (
    <>
      {!user ? (
        <LoginForm />
      ) : (
        <AdminLayout>
          <ProgramsManagement />
        </AdminLayout>
      )}
    </>
  );
}
