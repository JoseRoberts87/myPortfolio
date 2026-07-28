import AiChat from '@/components/AiChat';

export const metadata = {
  title: 'AI Agents & LLMs | Jose Roberts',
  description:
    "Ask my portfolio anything — a retrieval-augmented (RAG) assistant over Jose Roberts' experience, built with FastAPI + OpenAI.",
};

export default function AiAgentsPage() {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Ask My Portfolio</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A retrieval-augmented (RAG) assistant that answers questions about Jose&apos;s
            experience, skills, and projects — grounded in his resume and case studies, with cited
            sources.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-purple-300">
            <span className="bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
              FastAPI + OpenAI
            </span>
            <span className="bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
              Embeddings + cosine retrieval
            </span>
            <span className="bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
              Grounded, cited answers
            </span>
          </div>
        </div>

        <AiChat />

        <p className="text-center text-xs text-gray-500 mt-6">
          This is a live RAG demo. Answers are generated from a curated knowledge base of Jose&apos;s
          portfolio and may occasionally be imperfect.
        </p>
      </section>
    </div>
  );
}
