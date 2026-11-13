'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getCompetition, getSport } from '@/lib/data/catalog';
import { eventsByCompetition } from '@/lib/data/events';
import { LEAGUE_HEROES } from '@/lib/data/leagues';
import { sportHref } from '../shell/Sidebar';
import { MatchTable } from '../match/MatchTable';
import { FollowButton } from '../ui/FollowButton';
import { Icon } from '../ui/Icon';

/** A competition's own page: a photo hero where we have one, then all its matches. */
export function LeagueView({ competitionId }: { competitionId: string }) {
  const competition = getCompetition(competitionId);
  const sport = getSport(competition.sportId)!;
  const events = eventsByCompetition(competitionId);
  const live = events.filter((e) => e.status === 'live').length;
  const hero = LEAGUE_HEROES[competitionId];

  const meta = (
    <p className="league-hero__meta">
      <span>{events.length} matches</span>
      {live > 0 && (
        <span className="league-hero__live">
          <span className="live-dot" aria-hidden="true" />
          {live} live
        </span>
      )}
    </p>
  );

  return (
    <div className="page">
      <nav className="crumbs crumbs--page" aria-label="Breadcrumb">
        <Link href={sportHref(sport.id)}>{sport.name}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{competition.name}</span>
      </nav>

      {hero ? (
        <header className="league-hero">
          <Image
            src={hero.image}
            alt={hero.alt}
            fill
            priority
            sizes="(max-width: 1099px) 100vw, 1040px"
            className="league-hero__img"
            style={{ objectPosition: hero.focus }}
          />
          <div className="league-hero__fade" aria-hidden="true" />
          <div className="league-hero__content">
            <p className="league-hero__region">{competition.region}</p>
            <h1 className="league-hero__title">{competition.name}</h1>
            {meta}
          </div>
          <div className="league-hero__actions">
            <FollowButton kind="competition" id={competition.id} name={competition.name} labelled />
          </div>
          <p className="league-hero__credit">
            {hero.club} · Photo:{' '}
            <a href={hero.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
              {hero.credit.author}
            </a>
            ,{' '}
            <a href={hero.credit.licenseUrl} target="_blank" rel="noopener noreferrer license">
              {hero.credit.license}
            </a>
          </p>
        </header>
      ) : (
        <div className="page-head">
          <h1 className="page-head__title">
            <Icon name={sport.id} size={24} />
            {competition.name}
          </h1>
          <span className="page-head__meta">
            {competition.region} · {events.length} matches{live > 0 ? ` · ${live} live` : ''}
          </span>
          <span className="page-head__action">
            <FollowButton kind="competition" id={competition.id} name={competition.name} labelled />
          </span>
        </div>
      )}

      <section className="block" aria-label="Matches">
        <MatchTable competitionId={competitionId} events={events} followable={sport.id === 'football'} />
      </section>
    </div>
  );
}
