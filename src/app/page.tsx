export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          AI Audit Tool
        </h1>
        <p className="text-gray-300 text-lg">
          Deployment Test - Application is working!
        </p>
        <div className="mt-8">
          <a
            href="/api/health"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Test API Health
          </a>
        </div>
      </div>
    </div>
  );
}
