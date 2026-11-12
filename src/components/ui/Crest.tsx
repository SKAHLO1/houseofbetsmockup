import { useId } from 'react';
import { getTeam } from '@/lib/data/catalog';

const SHIELD = 'M4 3h16v9.500c0 4.600-3.300 7.400-8 9-4.700-1.600-8-4.400-8-9z';

/**
 * Generated team mark built from club colours.
 * Stands in for licensed crests, which are not part of this prototype.
 */
export function Crest({ teamId, size = 20 }: { teamId: string; size?: number }) {
  const team = getTeam(teamId);
  const [a, b] = team.colors;
  const clip = useId();
  const round = team.pattern === 'round';

  return (
    <svg className="crest" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>{round ? <circle cx="12" cy="12" r="9.500" /> : <path d={SHIELD} />}</clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="24" height="24" fill={a} />
        {team.pattern === 'halves' && <rect x="12" width="12" height="24" fill={b} />}
        {team.pattern === 'stripes' && (
          <>
            <rect x="7.200" width="3.200" height="24" fill={b} />
            <rect x="13.600" width="3.200" height="24" fill={b} />
          </>
        )}
        {team.pattern === 'band' && <rect y="3" width="24" height="5.500" fill={b} />}
        {team.pattern === 'solid' && <rect x="10.400" width="3.200" height="24" fill={b} />}
        {round && <circle cx="12" cy="12" r="4" fill={b} />}
      </g>
      {round ? (
        <circle cx="12" cy="12" r="9.500" fill="none" stroke="rgba(255,255,255,.28)" />
      ) : (
        <path d={SHIELD} fill="none" stroke="rgba(255,255,255,.28)" />
      )}
    </svg>
  );
}
