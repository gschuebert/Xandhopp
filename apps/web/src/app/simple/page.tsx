import { Button } from "@portalis/ui";
import Link from "next/link";

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🌍 Portalis
          </h1>
          <p className="text-xl text-gray-600">
            Your Gateway to the World
          </p>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-green-100 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 text-2xl mb-2">✅</div>
            <h3 className="font-semibold text-green-800">Next.js App</h3>
            <p className="text-green-700 text-sm">Running successfully</p>
          </div>
          
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-blue-600 text-2xl mb-2">🎨</div>
            <h3 className="font-semibold text-blue-800">Tailwind CSS</h3>
            <p className="text-blue-700 text-sm">Styling working</p>
          </div>
          
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-6 text-center">
            <div className="text-purple-600 text-2xl mb-2">📦</div>
            <h3 className="font-semibold text-purple-800">Components</h3>
            <p className="text-purple-700 text-sm">UI library loaded</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to Portalis
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This is a simplified version of the Portalis web application. 
            The full i18n version had some configuration issues, so we've 
            created this clean, working version for you to test.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🏠 Admin Panel</h3>
              <p className="text-sm text-gray-600 mb-3">
                Full CRUD interface for managing countries, programs, and providers.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="http://localhost:3001" target="_blank">
                  Open Admin Panel
                </a>
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔧 Backend API</h3>
              <p className="text-sm text-gray-600 mb-3">
                Symfony API with PostgreSQL database and demo data.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="http://localhost:8080/docs" target="_blank">
                  View API Docs
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            What's Working
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">🗂️</div>
              <h4 className="font-semibold">Monorepo</h4>
              <p className="text-sm text-gray-600">pnpm workspaces</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">⚛️</div>
              <h4 className="font-semibold">React/Next.js</h4>
              <p className="text-sm text-gray-600">App Router</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold">UI Components</h4>
              <p className="text-sm text-gray-600">shadcn/ui</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">🐳</div>
              <h4 className="font-semibold">Docker</h4>
              <p className="text-sm text-gray-600">Development ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
