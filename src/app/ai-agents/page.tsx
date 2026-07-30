import AiChat from '@/components/AiChat';
import AgentDemo from '@/components/AgentDemo';
import ContentGenerator from '@/components/ContentGenerator';
import { PageHero, Section } from '@/components/ui';

export const metadata = {
  title: 'AI Agents & LLMs | Jose Roberts',
  description:
    "Three live AI demos over Jose Roberts' portfolio — a retrieval-augmented (RAG) assistant, a tool-using agent, and a résumé-grounded content generator — running on Ollama locally and OpenAI in production.",
};

export default function AiAgentsPage() {
  return (
    <div className="min-h-screen pt-16">
      <PageHero
        eyebrow="AI Agents & LLMs"
        title="Ask My Portfolio"
        tagline="Three live demos of the agentic AI and LLM work Jose does: a retrieval-augmented assistant, a tool-using agent that shows its work, and a résumé-grounded content generator."
        badges={['RAG', 'Tool-using agent', 'Content generation', 'Ollama / OpenAI']}
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
        </div>
      </Section>

      {/* Demo 3 — Content generator */}
      <Section padding="lg">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-accent text-sm font-semibold uppercase tracking-wide mb-1">
              Demo 3 · Content Generator
            </p>
            <h2 className="text-2xl font-bold text-foreground">Tailored outreach, grounded in the résumé</h2>
            <p className="text-muted mt-2">
              Paste a role and pick a format and tone — the generator retrieves the most relevant
              résumé facts and writes a tailored pitch from them. It uses only what&apos;s in the
              résumé, so it never invents experience or numbers.
            </p>
          </div>
          <ContentGenerator />
          <p className="text-center text-xs text-muted mt-6">
            Three live demos — all run on a local Ollama model in development and OpenAI in
            production, and may occasionally be imperfect. The agent&apos;s calculator is a safe,
            arithmetic-only evaluator, and generated drafts are grounded in Jose&apos;s résumé.
          </p>
        </div>
      </Section>
    </div>
  );
}
