'use client';

import { useState } from 'react';
import { SPORTS, getCompetition, getSport } from '@/lib/data/catalog';
import { groupByCompetition, liveEvents, upcomingEvents } from '@/lib/data/events';
import type { SportId } from '@/lib/types';
import { MatchTable } from '../match/MatchTable';
import { EmptyState } from '../ui/EmptyState';
import { Icon } from '../ui/Icon';
import { SectionHeader } from '../ui/SectionHeader';

type SportFilter = SportId | 'all';

export function LiveView() {
  const [sport, setSport] = useState<SportFilter>('all');
  const [competition, setCompetition] = useState<string>('all');

  const allLive = liveEvents();
  const inSport = sport === 'all' ? allLive : allLive.filter((e) => e.sportId === sport);
  const competitions = groupByCompetition(inSport).map((g) => g.competitionId);
  const shown = competition === 'all' ? inSport : inSport.filter((e) => e.competitionId === competition);

  const pickSport = (next: SportFilter) => {
    setSport(next);
    setCompetition('all');
  };

  const sportName = sport === 'all' ? '' : getSport(sport)?.name ?? '';
  const fallback = upcomingEvents(sport === 'all' ? undefined : sport).slice(0, 6);

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-head__title">
          <span className="live-dot" aria-hidden="true" />
          Live
        </h1>
        <span className="page-head__meta">{allLive.length} matches in play</span>
      </div>

      <div className="filters">
        <div className="filter-row" role="group" aria-label="Filter by sport">
          <button type="button" className="filter" aria-pressed={sport === 'all'} onClick={() => pickSport('all')}>
            All sports <span className="filter__count">{allLive.length}</span>
          </button>
          {SPORTS.map((s) => {
            const count = allLive.filter((e) => e.sportId === s.id).length;
            return (
              <button key={s.id} type="button" className="filter" aria-pressed={sport === s.id} onClick={() => pickSport(s.id)}>
                <Icon name={s.id} size={16} />
                {s.name} <span className="filter__count">{count}</span>
              </button>
            );
          })}
        </div>

        {competitions.length > 1 && (
          <div className="filter-row filter-row--sub" role="group" aria-label="Filter by competition">
            <button type="button" className="filter filter--sub" aria-pressed={competition === 'all'} onClick={() => setCompetition('all')}>
              All competitions
            </button>
            {competitions.map((id) => (
              <button
                key={id}
                type="button"
                className="filter filter--sub"
                aria-pressed={competition === id}
                onClick={() => setCompetition(id)}
              >
                {getCompetition(id).name}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length > 0 ? (
        <div className="block" aria-live="polite">
          {groupByCompetition(shown).map((group) => (
            <MatchTable key={group.competitionId} competitionId={group.competitionId} events={group.events} showSport={sport === 'all'} />
          ))}
        </div>
      ) : (
        <div aria-live="polite">
          <EmptyState icon="live" title={`No live ${sportName.toLowerCase()} right now`}>
            Nothing is in play at the moment. These are the next {sportName.toLowerCase()} fixtures — prices are open now.
          </EmptyState>
          {fallback.length > 0 && (
            <section className="block" aria-label="Starting soon">
              <SectionHeader title="Starting soon" meta={`Next ${sportName.toLowerCase()} fixtures`} />
              {groupByCompetition(fallback).map((group) => (
                <MatchTable key={group.competitionId} competitionId={group.competitionId} events={group.events} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
