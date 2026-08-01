import { ReactNode } from 'react';

/**
 * Offline placeholder for an AI demo (issue #210): rendered instead of a live
 * input when the backend health probe fails, so visitors never invest effort in
 * a feature that cannot respond. Keeps demonstrating the capability via a
 * clearly-labeled sample, and always routes to the contact form.
 */
export default function AiOfflineState({
  title,
  description,
  sample,
}: {
  title: string;
  description: string;
  /** Optional canned example (transcript, trace, draft) labeled as a sample. */
  sample?: ReactNode;
}) {
  return (
    <div className="bg-surface border border-subtle rounded-2xl shadow-xl p-6 sm:p-8">
      <div className="text-center">
        <div className="text-4xl mb-3" aria-hidden>
          😴
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted max-w-xl mx-auto mb-4">{description}</p>
        <a
          href="/#contact"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Reach out via the contact form
        </a>
      </div>

      {sample && (
        <div className="mt-8 pt-6 border-t border-subtle">
          <p className="text-xs text-faint uppercase tracking-wide mb-3">
            Sample conversation (recorded earlier — the live demo is offline)
          </p>
          {sample}
        </div>
      )}
    </div>
  );
}
