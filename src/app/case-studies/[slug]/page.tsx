import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Section, Card, Badge } from '@/components/ui';
import { getCaseStudyBySlug, getAllCaseStudySlugs, CaseStudy } from '../case-studies-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: `${caseStudy.title} | Case Study | Jose Roberts`,
    description: caseStudy.description,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <Section padding="xl" background="subtle">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/case-studies"
              className="text-purple-400 hover:text-purple-300 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Case Studies
            </Link>
          </div>

          {/* Icon and Category */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">{caseStudy.icon}</div>
            <div>
              <Badge variant="primary" size="lg">{caseStudy.category}</Badge>
            </div>
          </div>

          {/* Title and Subtitle */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {caseStudy.title}
          </h1>
          <h2 className="text-2xl text-purple-400 mb-6 font-medium">
            {caseStudy.subtitle}
          </h2>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{caseStudy.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{caseStudy.publishedDate}</span>
            </div>
          </div>

          {/* Challenge Statement */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              The Challenge
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {caseStudy.challenge}
            </p>
          </Card>
        </div>
      </Section>

      {/* Key Metrics */}
      <Section padding="lg">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {caseStudy.metrics.map((metric) => (
              <Card key={metric.label} variant="bordered" padding="md">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-white mb-1">
                    {metric.label}
                  </div>
                  {metric.description && (
                    <div className="text-xs text-gray-500">
                      {metric.description}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Technologies Used */}
      <Section padding="lg" background="subtle">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Technologies Used</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {caseStudy.technologies.map((tech) => (
              <Badge key={tech} variant="primary" size="lg">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Main Content Sections */}
      <div className="max-w-4xl mx-auto">
        <CaseStudySection section={caseStudy.problemStatement} />
        <CaseStudySection section={caseStudy.technicalChallenges} />
        <CaseStudySection section={caseStudy.solutionArchitecture} />
        <CaseStudySection section={caseStudy.implementation} />
        <CaseStudySection section={caseStudy.resultsAndImpact} />
        <CaseStudySection section={caseStudy.tradeoffsAndDecisions} />
        <CaseStudySection section={caseStudy.lessonsLearned} />
      </div>

      {/* Live Demo CTA */}
      {caseStudy.liveDemo && (
        <Section padding="lg" background="subtle">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              See It In Action
            </h3>
            <p className="text-gray-400 mb-6">
              Experience the live implementation and interact with the features described in this case study.
            </p>
            <Link
              href={caseStudy.liveDemo}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg group"
            >
              <span>View Live Demo</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </Section>
      )}

      {/* Related Case Studies */}
      {caseStudy.relatedCaseStudies.length > 0 && (
        <Section padding="lg">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Related Case Studies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseStudy.relatedCaseStudies.map((relatedSlug) => {
                const related = getCaseStudyBySlug(relatedSlug);
                if (!related) return null;

                return (
                  <Link key={related.slug} href={`/case-studies/${related.slug}`}>
                    <Card variant="bordered" padding="lg" hover>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-4xl">{related.icon}</div>
                        <div className="flex-1">
                          <Badge variant="secondary" size="sm">{related.category}</Badge>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        {related.title}
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {related.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </Section>
      )}

      {/* Bottom CTA */}
      <Section padding="lg" background="subtle">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Interested in Working Together?
          </h3>
          <p className="text-gray-400 mb-6">
            Let's discuss how I can help solve your technical challenges.
          </p>
          <Link
            href="/#contact"
            className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </Section>
    </div>
  );
}

// Component for rendering case study sections
function CaseStudySection({ section }: { section: CaseStudy['problemStatement'] }) {
  return (
    <Section padding="lg">
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
          {section.title}
        </h2>

        {/* Content paragraphs */}
        <div className="prose prose-invert prose-lg max-w-none mb-6">
          {section.content.map((paragraph, idx) => {
            // Check if paragraph starts with **text** for bold headings
            if (paragraph.startsWith('**') && paragraph.includes('**:')) {
              const parts = paragraph.split('**');
              return (
                <p key={idx} className="text-gray-300 mb-4">
                  <strong className="text-white">{parts[1]}</strong>
                  {parts[2]}
                </p>
              );
            }
            // Check if it's a bullet point (starts with •)
            else if (paragraph.startsWith('•')) {
              return (
                <p key={idx} className="text-gray-300 mb-2 ml-4">
                  {paragraph}
                </p>
              );
            }
            // Check if it's a numbered point
            else if (/^\d+\./.test(paragraph)) {
              return (
                <p key={idx} className="text-gray-300 mb-2 ml-4">
                  {paragraph}
                </p>
              );
            }
            // Empty line (section break)
            else if (paragraph === '') {
              return <div key={idx} className="h-4"></div>;
            }
            // Regular paragraph
            else {
              return (
                <p key={idx} className="text-gray-300 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              );
            }
          })}
        </div>

        {/* Highlights */}
        {section.highlights && section.highlights.length > 0 && (
          <Card variant="bordered" padding="lg" className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Highlights
            </h4>
            <ul className="space-y-2">
              {section.highlights.map((highlight, idx) => (
                <li key={idx} className="text-gray-300 flex items-start gap-3">
                  <span className="text-purple-400 mt-1">▸</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Code Example */}
        {section.codeExample && (
          <Card variant="elevated" padding="none" className="mb-6">
            <div className="bg-slate-950 rounded-t-lg px-4 py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">{section.codeExample.language}</span>
              </div>
            </div>
            <pre className="p-6 overflow-x-auto bg-slate-950 rounded-b-lg">
              <code className="text-sm text-gray-300 font-mono">
                {section.codeExample.code}
              </code>
            </pre>
            {section.codeExample.caption && (
              <div className="px-6 py-3 bg-slate-900/50 rounded-b-lg border-t border-slate-800">
                <p className="text-sm text-gray-400 italic">{section.codeExample.caption}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Section>
  );
}
