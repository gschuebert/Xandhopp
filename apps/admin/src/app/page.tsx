"use client";

import { useAuth, AuthProvider } from "../lib/auth";
import { LoginForm } from "../components/login-form";
import { Sidebar } from "../components/sidebar";
import { Providers } from "./providers";

function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Countries</h3>
          <p className="text-3xl font-bold text-primary">3</p>
          <p className="text-sm text-muted-foreground">Total countries</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Programs</h3>
          <p className="text-3xl font-bold text-primary">5</p>
          <p className="text-sm text-muted-foreground">Residency programs</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Providers</h3>
          <p className="text-3xl font-bold text-primary">8</p>
          <p className="text-sm text-muted-foreground">Service providers</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <p className="text-3xl font-bold text-primary">124</p>
          <p className="text-sm text-muted-foreground">Registered users</p>
        </div>
      </div>
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

export default function AdminPage() {
  return (
    <Providers>
      <AuthProvider>
        <AdminPageContent />
      </AuthProvider>
    </Providers>
  );
}

function AdminPageContent() {
  const { user } = useAuth();

  return (
    <>
      {!user ? (
        <LoginForm />
      ) : (
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      )}
    </>
  );
}
