export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-white">
          Portfolio
        </h1>
        <p className="text-2xl text-gray-300">
          Showcasing expertise across multiple domains
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold text-white mb-2">Web Development</h3>
            <p className="text-gray-300 text-sm">Modern full-stack applications</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold text-white mb-2">Data Pipelines</h3>
            <p className="text-gray-300 text-sm">ETL and data processing</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold text-white mb-2">Data Analytics</h3>
            <p className="text-gray-300 text-sm">Interactive dashboards</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold text-white mb-2">Machine Learning</h3>
            <p className="text-gray-300 text-sm">NLP and sentiment analysis</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold text-white mb-2">Computer Vision</h3>
            <p className="text-gray-300 text-sm">Real-time object detection</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold text-white mb-2">Cloud Infrastructure</h3>
            <p className="text-gray-300 text-sm">AWS deployment & DevOps</p>
          </div>
        </div>
        <p className="text-gray-400 mt-8 text-sm">
          Built with Next.js, TypeScript, and Tailwind CSS
        </p>
      </div>
    </div>
  );
}
