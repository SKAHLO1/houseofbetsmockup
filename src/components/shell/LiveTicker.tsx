'use client';

import Link from 'next/link';
import { getTeam } from '@/lib/data/catalog';
import { liveEvents } from '@/lib/data/events';
import { eventName, liveClock } from '@/lib/format';
import { useStore } from '@/lib/store';

/** Broadcast-style score strip under the top bar. Every chip opens its match. */
export function LiveTicker() {
  const { state } = useStore();
  const live = liveEvents();

  return (
    <nav className="ticker" aria-label="Live scores">
      <Link href="/live" className="ticker__label" aria-label={`Live: ${live.length} matches in play`}>
        <span className="live-dot" aria-hidden="true" />
        Live
        <b>{live.length}</b>
      </Link>
      <ul className="ticker__list">
        {live.map((event) => {
          const clock = liveClock(event, state.elapsed);
          return (
            <li key={event.id}>
              <Link
                href={`/match/${event.id}`}
                className="ticker__item"
                aria-label={`${eventName(event)}, ${event.score?.[0]}–${event.score?.[1]}, ${clock}`}
              >
                <span className="ticker__clock">{clock}</span>
                <span className="ticker__team">{getTeam(event.home).short}</span>
                <span className="ticker__score">
                  {event.score?.[0]}–{event.score?.[1]}
                </span>
                <span className="ticker__team">{getTeam(event.away).short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
