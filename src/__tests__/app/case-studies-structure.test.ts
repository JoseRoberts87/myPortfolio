/**
 * Structural invariants for the case studies (issues #197 / #198).
 *
 * Every study must follow the senior-level narrative structure — problem,
 * stakeholders, constraints, architecture, decisions, implementation,
 * reliability, security, testing, results, lessons, future — and document real
 * tradeoffs. A study added or edited without these fails CI here, which is what
 * keeps the format a standard rather than a suggestion.
 */
import { caseStudies, CaseStudySection } from '@/app/case-studies/case-studies-data';

const NARRATIVE_SECTIONS = [
  'problemStatement',
  'stakeholders',
  'constraints',
  'technicalChallenges',
  'solutionArchitecture',
  'implementation',
  'reliability',
  'security',
  'testingStrategy',
  'resultsAndImpact',
  'tradeoffsAndDecisions',
  'lessonsLearned',
  'futureImprovements',
] as const;

function nonEmpty(section: CaseStudySection): boolean {
  return (
    Boolean(section?.title?.trim()) &&
    Array.isArray(section?.content) &&
    section.content.some((line) => line.trim().length > 0)
  );
}

describe.each(caseStudies.map((cs) => [cs.slug, cs] as const))(
  'case study %s',
  (_slug, study) => {
    it('has an executive summary, description, and category', () => {
      expect(study.challenge.trim().length).toBeGreaterThan(50);
      expect(study.description.trim().length).toBeGreaterThan(50);
      expect(study.category.trim()).toBeTruthy();
    });

    it.each(NARRATIVE_SECTIONS.map((k) => [k] as const))(
      'has a non-empty %s section',
      (key) => {
        expect(nonEmpty(study[key])).toBe(true);
      },
    );

    it('documents at least two tradeoff decisions with rationale (#198)', () => {
      const text = study.tradeoffsAndDecisions.content.join('\n');
      const decisions = text.match(/\*\*Decision \d+/g) || [];
      expect(decisions.length).toBeGreaterThanOrEqual(2);
      // Each decision states what was chosen and what it cost.
      expect(text).toMatch(/Rationale/);
      expect(text).toMatch(/Trade-off/);
    });

    it('states at least one real constraint (#197)', () => {
      expect(study.constraints.content.length).toBeGreaterThanOrEqual(1);
    });

    it('states a measurable impact line with context (#199)', () => {
      expect(study.impact.trim().length).toBeGreaterThan(40);
      // Measurable means a number, not an adjective.
      expect(study.impact).toMatch(/\d/);
    });

    it('has metrics with labels and values', () => {
      expect(study.metrics.length).toBeGreaterThanOrEqual(3);
      for (const metric of study.metrics) {
        expect(metric.label.trim()).toBeTruthy();
        expect(metric.value.trim()).toBeTruthy();
      }
    });

    it('links only to related studies that actually exist', () => {
      const slugs = new Set(caseStudies.map((cs) => cs.slug));
      for (const related of study.relatedCaseStudies) {
        expect(slugs.has(related)).toBe(true);
      }
    });
  },
);

describe('portfolio-app studies separate measured results from benchmarks (#197)', () => {
  it.each([
    ['computer-vision-object-detection'],
    ['nlp-pipeline-architecture'],
  ])('%s carries a metrics provenance note', (slug) => {
    const study = caseStudies.find((cs) => cs.slug === slug)!;
    expect(study.metricsNote).toMatch(/published benchmarks|measure/i);
  });
});
