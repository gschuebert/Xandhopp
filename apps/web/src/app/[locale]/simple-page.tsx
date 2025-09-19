// Simple test page without i18n dependencies
export default function SimplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Xandhopp Web App</h1>
        <p className="text-lg text-gray-600 mb-8">Simple test page - the app is working!</p>
        <div className="space-y-4">
          <div className="bg-green-100 p-4 rounded">
            <p className="text-green-800">✅ Next.js App Router is working</p>
          </div>
          <div className="bg-blue-100 p-4 rounded">
            <p className="text-blue-800">✅ Tailwind CSS is working</p>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <p className="text-purple-800">✅ Locale routing is working</p>
          </div>
        </div>
      </div>
    </div>
  );
}
