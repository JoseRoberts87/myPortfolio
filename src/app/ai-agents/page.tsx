import AiChat from '@/components/AiChat';
import { PageHero, Section } from '@/components/ui';

export const metadata = {
  title: 'AI Agents & LLMs | Jose Roberts',
  description:
    "Ask my portfolio anything — a retrieval-augmented (RAG) assistant over Jose Roberts' experience, running on Ollama locally and OpenAI in production.",
};

export default function AiAgentsPage() {
  return (
    <div className="min-h-screen pt-16">
      <PageHero
        eyebrow="AI Agents & LLMs"
        title="Ask My Portfolio"
        tagline="A retrieval-augmented (RAG) assistant that answers questions about Jose's experience, skills, and projects — grounded in his resume and case studies, with cited sources."
        badges={['RAG', 'Ollama / OpenAI', 'Embeddings + cosine retrieval', 'Cited answers']}
      />

      <Section padding="lg">
        <div className="max-w-4xl mx-auto">
          <AiChat />
          <p className="text-center text-xs text-muted mt-6">
            A live RAG demo — answers are generated from a curated knowledge base of Jose&apos;s
            portfolio and may occasionally be imperfect. It runs on a local Ollama model in
            development and OpenAI in production.
          </p>
        </div>
      </Section>
    </div>
  );
}
