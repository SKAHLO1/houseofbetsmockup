import type { ReactNode } from 'react';

/** Ruled section heading. `tone="live"` switches the rule and marker to the live colour. */
export function SectionHeader({
  title,
  meta,
  tone = 'default',
  action,
}: {
  title: string;
  meta?: string;
  tone?: 'default' | 'live';
  action?: ReactNode;
}) {
  return (
    <div className={`section-head ${tone === 'live' ? 'section-head--live' : ''}`}>
      <h2 className="section-head__title">
        {tone === 'live' && <span className="live-dot" aria-hidden="true" />}
        {title}
      </h2>
      {meta && <span className="section-head__meta">{meta}</span>}
      {action && <span className="section-head__action">{action}</span>}
    </div>
  );
}
