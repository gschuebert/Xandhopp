export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Xandhopp Web App</h1>
        <p className="text-lg text-gray-600 mb-8">Test page - the app is working!</p>
        <div className="space-x-4">
          <a 
            href="/en" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to English Version
          </a>
          <a 
            href="/de" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to German Version
          </a>
        </div>
      </div>
    </div>
  );
}
