import AiChat from '@/components/AiChat';
import AgentDemo from '@/components/AgentDemo';
import { PageHero, Section } from '@/components/ui';

export const metadata = {
  title: 'AI Agents & LLMs | Jose Roberts',
  description:
    "Two live AI demos over Jose Roberts' portfolio — a retrieval-augmented (RAG) assistant and a tool-using agent — running on Ollama locally and OpenAI in production.",
};

export default function AiAgentsPage() {
  return (
    <div className="min-h-screen pt-16">
      <PageHero
        eyebrow="AI Agents & LLMs"
        title="Ask My Portfolio"
        tagline="Two live demos of the agentic AI and LLM work Jose does: a retrieval-augmented assistant that answers with cited sources, and a tool-using agent that shows its work."
        badges={['RAG', 'Tool-using agent', 'Ollama / OpenAI', 'Grounded + cited']}
      />

      {/* Demo 1 — RAG chat */}
      <Section padding="lg">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-accent text-sm font-semibold uppercase tracking-wide mb-1">
              Demo 1 · Retrieval-Augmented Chat
            </p>
            <h2 className="text-2xl font-bold text-foreground">Grounded answers with cited sources</h2>
            <p className="text-muted mt-2">
              Embeddings + cosine retrieval find the most relevant facts from a curated knowledge
              base, then the model answers from that context and cites what it used.
            </p>
          </div>
          <AiChat />
        </div>
      </Section>

      {/* Demo 2 — Tool-using agent */}
      <Section padding="lg" background="subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-accent text-sm font-semibold uppercase tracking-wide mb-1">
              Demo 2 · Tool-Using Agent
            </p>
            <h2 className="text-2xl font-bold text-foreground">An agent that decides and shows its work</h2>
            <p className="text-muted mt-2">
              Given a question, the agent chooses which tools to call — portfolio search, a
              calculator, today&apos;s date — chains them, and synthesizes a grounded answer. Every
              tool call is shown so you can see how it reasoned.
            </p>
          </div>
          <AgentDemo />
          <p className="text-center text-xs text-muted mt-6">
            Live demos — both run on a local Ollama model in development and OpenAI in production,
            and may occasionally be imperfect. The agent&apos;s calculator is a safe,
            arithmetic-only evaluator.
          </p>
        </div>
      </Section>
    </div>
  );
}
