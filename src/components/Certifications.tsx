import Image from 'next/image';
import { Badge } from '@/components/ui';

interface Certification {
  name: string;
  issuer: string;
  /** Validity window or status shown as a pill. */
  period: string;
  /** Short issuer mark shown in the seal when there is no official badge image. */
  abbr: string;
  /** Official credential badge image (in /public/badges). Falls back to the seal when absent. */
  badgeImage?: string;
  /** Optional verification link (e.g. Credly). Renders a "Verify" link when set. */
  credentialUrl?: string;
}

const certifications: Certification[] = [
  {
    name: 'Databricks Certified Data Engineer Professional',
    issuer: 'Databricks',
    period: '2026 – 2028',
    abbr: 'DB',
    badgeImage: '/badges/databricks-dep.png',
  },
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    period: 'Certified',
    abbr: 'AWS',
    badgeImage: '/badges/aws-saa.png',
  },
  {
    name: 'TinyML Certification',
    issuer: 'Harvard edX',
    period: 'Certified',
    abbr: 'edX',
  },
];

export default function Certifications() {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Certifications</h2>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Industry-recognized credentials in data engineering, cloud architecture, and machine learning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {certifications.map((cert) => (
          <div
            key={cert.name}
            className="flex flex-col items-center text-center bg-surface border border-subtle rounded-xl p-8 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
          >
            {/* Official badge image, or a styled seal when the credential has no badge */}
            <div className="mb-5 flex h-24 items-center justify-center">
              {cert.badgeImage ? (
                <div className="relative h-24 w-24">
                  <Image
                    src={cert.badgeImage}
                    alt={`${cert.name} badge`}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">{cert.abbr}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface border border-subtle flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug">{cert.name}</h3>
            <p className="text-muted mb-4">{cert.issuer}</p>
            <div className="mt-auto">
              <Badge variant="primary">{cert.period}</Badge>
            </div>

            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                Verify
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
