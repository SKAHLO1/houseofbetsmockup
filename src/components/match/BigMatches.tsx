'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { getCompetition, getTeam } from '@/lib/data/catalog';
import { upcomingEvents } from '@/lib/data/events';
import { getResultMarket } from '@/lib/data/markets';
import { eventName } from '@/lib/format';
import type { SportEvent } from '@/lib/types';
import { Crest } from '../ui/Crest';
import { Icon } from '../ui/Icon';
import { OddsButton } from '../ui/OddsButton';
import { SectionHeader } from '../ui/SectionHeader';

const MAX_CARDS = 6;
const WINDOW_MIN = 2 * 24 * 60;

/**
 * The fixtures most people will want to bet on next: top-competition football
 * in the next two days, Champions League first, then by kick-off.
 */
export function bigMatches(): SportEvent[] {
  return upcomingEvents('football')
    .filter((e) => getCompetition(e.competitionId).top && (e.inMin ?? Infinity) <= WINDOW_MIN)
    .sort((a, b) => {
      const ucl = Number(b.competitionId === 'champions-league') - Number(a.competitionId === 'champions-league');
      return ucl || (a.inMin ?? 0) - (b.inMin ?? 0);
    })
    .slice(0, MAX_CARDS);
}

function MatchCard({ event }: { event: SportEvent }) {
  const home = getTeam(event.home);
  const away = getTeam(event.away);
  const result = getResultMarket(event.id);

  return (
    <li className="big-card">
      <Link href={`/match/${event.id}`} className="big-card__link" aria-label={`${eventName(event)}, open match`}>
        <span className="big-card__meta">
          <span className="big-card__comp">{getCompetition(event.competitionId).name}</span>
          <span className="big-card__when">
            {event.day === 'Today' ? 'Today' : event.day} · <b>{event.time}</b>
          </span>
        </span>
        <span className="big-card__team">
          <Crest teamId={home.id} size={22} />
          {home.name}
        </span>
        <span className="big-card__team">
          <Crest teamId={away.id} size={22} />
          {away.name}
        </span>
      </Link>
      <div className="big-card__odds">
        {result.selections.map((sel) => (
          <OddsButton key={sel.id} selectionId={sel.id} variant="stacked" />
        ))}
      </div>
    </li>
  );
}

/** Horizontally scrolling row of headline fixtures; arrow buttons page it on desktop. */
export function BigMatches() {
  const events = bigMatches();
  const trackRef = useRef<HTMLUListElement>(null);
  if (events.length === 0) return null;

  const page = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <section className="block" aria-label="Big matches">
      <SectionHeader
        title="Big matches"
        meta="Next 48 hours"
        action={
          <span className="pager">
            <button type="button" className="icon-btn pager__btn pager__btn--prev" aria-label="Previous matches" onClick={() => page(-1)}>
              <Icon name="chevron-right" size={18} />
            </button>
            <button type="button" className="icon-btn pager__btn" aria-label="Next matches" onClick={() => page(1)}>
              <Icon name="chevron-right" size={18} />
            </button>
          </span>
        }
      />
      <ul className="big-row" ref={trackRef}>
        {events.map((event) => (
          <MatchCard key={event.id} event={event} />
        ))}
      </ul>
    </section>
  );
}
