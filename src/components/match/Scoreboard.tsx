'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getCompetition, getSport, getTeam } from '@/lib/data/catalog';
import { liveClock, startsInLabel } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { SportEvent, Team } from '@/lib/types';
import { sportHref } from '../shell/Sidebar';
import { Crest } from '../ui/Crest';
import { FollowButton } from '../ui/FollowButton';

function periodLabel(event: SportEvent, elapsed: number): string | null {
  if (event.minute === undefined) return event.scoreDetail ?? null;
  return Math.min(90, event.minute + elapsed) > 45 ? '2nd half' : '1st half';
}

function Side({ team, side }: { team: Team; side: 'home' | 'away' }) {
  return (
    <div className={`board__side board__side--${side}`} style={{ '--team': team.colors[0] } as CSSProperties}>
      <Crest teamId={team.id} size={44} />
      <div className="board__who">
        <span className="board__role">{side === 'home' ? 'Home' : 'Away'}</span>
        <span className="board__name">{team.name}</span>
      </div>
      <FollowButton kind="team" id={team.id} name={team.name} />
    </div>
  );
}

/** Match header as a broadcast score bug: club colours on each side, score and clock in the middle. */
export function Scoreboard({ event }: { event: SportEvent }) {
  const { state } = useStore();
  const home = getTeam(event.home);
  const away = getTeam(event.away);
  const competition = getCompetition(event.competitionId);
  const sport = getSport(event.sportId)!;
  const live = event.status === 'live';
  const period = live ? periodLabel(event, state.elapsed) : null;

  return (
    <header className={`board ${live ? 'board--live' : ''}`}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={sportHref(sport.id)}>{sport.name}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/league/${competition.id}`}>{competition.name}</Link>
      </nav>

      <h1 className="sr-only">
        {home.name} v {away.name}
      </h1>

      <div className="board__grid">
        <Side team={home} side="home" />

        <div className="board__centre">
          {live ? (
            <>
              <p className="board__score" aria-label={`${home.name} ${event.score?.[0]}, ${away.name} ${event.score?.[1]}`}>
                <span>{event.score?.[0]}</span>
                <span className="board__dash" aria-hidden="true">
                  –
                </span>
                <span>{event.score?.[1]}</span>
              </p>
              <p className="board__status">
                <span className="board__clock">
                  <span className="live-dot" aria-hidden="true" />
                  {liveClock(event, state.elapsed)}
                </span>
                {period && <span className="board__period">{period}</span>}
              </p>
              {event.minute !== undefined && (
                <span className="gauge board__gauge" aria-hidden="true">
                  <span style={{ width: `${(Math.min(90, event.minute + state.elapsed) / 90) * 100}%` }} />
                </span>
              )}
            </>
          ) : (
            <>
              <p className="board__score board__score--time">{event.time}</p>
              <p className="board__status">
                <span className="board__period">
                  {startsInLabel(event.inMin) ? `${event.day} · ${startsInLabel(event.inMin)}` : event.day}
                </span>
              </p>
            </>
          )}
        </div>

        <Side team={away} side="away" />
      </div>
    </header>
  );
}
