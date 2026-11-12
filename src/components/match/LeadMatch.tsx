'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getCompetition, getTeam } from '@/lib/data/catalog';
import { extraMarketCount, getResultMarket } from '@/lib/data/markets';
import { eventName, liveClock } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { SportEvent, Team } from '@/lib/types';
import { Crest } from '../ui/Crest';
import { Icon } from '../ui/Icon';
import { OddsButton } from '../ui/OddsButton';

function BugLine({ team, goals }: { team: Team; goals?: number }) {
  return (
    <span className="bug__line" style={{ '--team': team.colors[0] } as CSSProperties}>
      <Crest teamId={team.id} size={28} />
      <span className="bug__name">{team.name}</span>
      <span className="bug__score">{goals}</span>
    </span>
  );
}

/** Headline in-play match: a TV-style score bug with its result prices beside it. */
export function LeadMatch({ event }: { event: SportEvent }) {
  const { state } = useStore();
  const competition = getCompetition(event.competitionId);
  const result = getResultMarket(event.id);
  const keys = result.selections.length === 2 ? ['1', '2'] : ['1', 'X', '2'];
  const minute = event.minute !== undefined ? Math.min(90, event.minute + state.elapsed) : undefined;
  const period = minute !== undefined ? (minute > 45 ? '2nd half' : '1st half') : event.scoreDetail;

  return (
    <article className="bug" aria-label={`Featured live match: ${eventName(event)}`}>
      <Link href={`/match/${event.id}`} className="bug__board">
        <span className="bug__top">
          <span className="bug__clock">
            <span className="live-dot" aria-hidden="true" />
            {liveClock(event, state.elapsed)}
          </span>
          <span className="bug__comp">{competition.name}</span>
          {period && <span className="bug__period">{period}</span>}
          {minute !== undefined && (
            <span className="gauge" aria-hidden="true">
              <span style={{ width: `${(minute / 90) * 100}%` }} />
            </span>
          )}
        </span>
        <BugLine team={getTeam(event.home)} goals={event.score?.[0]} />
        <BugLine team={getTeam(event.away)} goals={event.score?.[1]} />
      </Link>
      <div className="bug__bets">
        <div className="bug__market">
          <span>{result.name}</span>
          <Link href={`/match/${event.id}`} className="bug__more">
            All {extraMarketCount(event.id) + 1} markets
            <Icon name="chevron-right" size={14} />
          </Link>
        </div>
        <div className={`bug__odds ${keys.length === 2 ? 'bug__odds--two' : ''}`}>
          {result.selections.map((sel, i) => (
            <OddsButton key={sel.id} selectionId={sel.id} variant="stacked" outcomeKey={keys[i]} showChance />
          ))}
        </div>
      </div>
    </article>
  );
}
