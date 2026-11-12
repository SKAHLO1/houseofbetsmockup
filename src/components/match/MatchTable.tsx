'use client';

import { useId, useState, type ReactNode } from 'react';
import { getCompetition } from '@/lib/data/catalog';
import { getResultMarket } from '@/lib/data/markets';
import type { SportEvent } from '@/lib/types';
import { Icon } from '../ui/Icon';
import { MatchRow } from './MatchRow';

interface Props {
  competitionId: string;
  events: SportEvent[];
  /** Show the sport icon — useful where several sports share a list. */
  showSport?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  followable?: boolean;
  /** Extra controls placed in the header, e.g. a follow button. */
  actions?: ReactNode;
  /** Anchor id for in-page navigation. */
  anchor?: string;
  /** Chapter number shown before the name (Football page). */
  index?: number;
}

/**
 * A competition as one grouped surface: a header that names the league and
 * labels the price columns once, then divider-separated match rows.
 */
export function MatchTable({
  competitionId,
  events,
  showSport = false,
  collapsible = false,
  defaultOpen = true,
  followable = false,
  actions,
  anchor,
  index,
}: Props) {
  const competition = getCompetition(competitionId);
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const liveCount = events.filter((e) => e.status === 'live').length;
  // A competition is a single sport, so every match shares the same outcome shape.
  const twoWay = events.length > 0 && getResultMarket(events[0].id).selections.length === 2;
  const columns = twoWay ? ['1', '2'] : ['1', 'X', '2'];

  const title = (
    <>
      {showSport && <Icon name={competition.sportId} size={16} className="comp__sport" />}
      <span className="comp__name">{competition.name}</span>
      <span className="comp__region">{competition.region}</span>
    </>
  );

  return (
    <section
      className={`comp ${open ? '' : 'is-closed'} ${liveCount > 0 ? 'comp--live' : ''} ${index !== undefined ? 'comp--indexed' : ''}`}
      id={anchor}
      aria-label={competition.name}
    >
      <header className="comp__head">
        <div className="comp__lead">
          {index !== undefined && (
            <span className="comp__index" aria-hidden="true">
              {String(index).padStart(2, '0')}
            </span>
          )}
          {collapsible ? (
            <button
              type="button"
              className="comp__title comp__toggle"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={() => setOpen((v) => !v)}
            >
              {title}
              <Icon name="chevron-down" size={16} className={`comp__chev ${open ? '' : 'is-closed'}`} />
            </button>
          ) : (
            <h3 className="comp__title">{title}</h3>
          )}
          <span className="comp__count">
            <span className="comp__total">
              {events.length} {events.length === 1 ? 'match' : 'matches'}
            </span>
            {liveCount > 0 && <span className="comp__live">{liveCount} live</span>}
          </span>
          {actions && <span className="comp__actions">{actions}</span>}
        </div>
        {open && (
          <div className={`comp__cols ${twoWay ? 'comp__cols--two' : ''}`} aria-hidden="true">
            {columns.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        )}
      </header>
      {open && (
        <ul className="comp__rows" id={bodyId}>
          {events.map((event) => (
            <MatchRow key={event.id} event={event} followable={followable} showKeys={false} />
          ))}
        </ul>
      )}
    </section>
  );
}
