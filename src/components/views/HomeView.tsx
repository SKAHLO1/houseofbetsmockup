'use client';

import Link from 'next/link';
import { SPORTS, TOP_COMPETITIONS, getSport, getTeam } from '@/lib/data/catalog';
import { EVENTS, FEATURED_EVENT_ID, eventsByCompetition, liveEvents, startingSoon, upcomingEvents } from '@/lib/data/events';
import { getResultMarket } from '@/lib/data/markets';
import { startsInLabel } from '@/lib/format';
import type { SportEvent, SportId } from '@/lib/types';
import { BigMatches } from '../match/BigMatches';
import { LeadMatch } from '../match/LeadMatch';
import { MatchRow } from '../match/MatchRow';
import { FollowButton } from '../ui/FollowButton';
import { Icon } from '../ui/Icon';
import { SectionHeader } from '../ui/SectionHeader';

const HOME_LIVE_ROWS = 5;

function SportTabs({ active }: { active?: SportId }) {
  return (
    <nav className="sport-tabs" aria-label="Filter by sport">
      <Link href="/" className="sport-tabs__link" aria-current={!active ? 'page' : undefined}>
        All
        <span className="sport-tabs__count">{EVENTS.length}</span>
      </Link>
      {SPORTS.map((sport) => (
        <Link
          key={sport.id}
          href={`/?sport=${sport.id}`}
          className="sport-tabs__link"
          aria-current={active === sport.id ? 'page' : undefined}
        >
          <Icon name={sport.id} size={16} />
          {sport.name}
          <span className="sport-tabs__count">{EVENTS.filter((e) => e.sportId === sport.id).length}</span>
        </Link>
      ))}
    </nav>
  );
}

/**
 * In-play matches grouped by sport, so each group labels its price columns
 * once (1 X 2 or 1 2) instead of printing the outcome inside every button.
 */
function LiveBySport({ events }: { events: SportEvent[] }) {
  const groups: { sport: SportId; events: SportEvent[] }[] = [];
  for (const event of events) {
    const group = groups.find((g) => g.sport === event.sportId);
    if (group) group.events.push(event);
    else groups.push({ sport: event.sportId, events: [event] });
  }

  return (
    <div className="sport-groups">
      {groups.map((group) => {
        const twoWay = getResultMarket(group.events[0].id).selections.length === 2;
        return (
          <section key={group.sport} className="comp comp--live" aria-label={`${getSport(group.sport)?.name} in play`}>
            <header className="comp__head">
              <div className="comp__lead">
                <h3 className="comp__title">
                  <Icon name={group.sport} size={16} className="comp__sport" />
                  <span className="comp__name">{getSport(group.sport)?.name}</span>
                </h3>
                <span className="comp__count">
                  <span className="comp__live">{group.events.length} live</span>
                </span>
              </div>
              <div className={`comp__cols ${twoWay ? 'comp__cols--two' : ''}`} aria-hidden="true">
                {(twoWay ? ['1', '2'] : ['1', 'X', '2']).map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </header>
            <ul className="comp__rows">
              {group.events.map((event) => (
                <MatchRow key={event.id} event={event} showCompetition showKeys={false} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Upcoming matches hung off a vertical time axis, grouped by kick-off. */
function KickoffTimeline({ events }: { events: SportEvent[] }) {
  const slots: { key: string; time: string; sub: string; events: SportEvent[] }[] = [];
  for (const event of events) {
    const key = `${event.day} ${event.time}`;
    const slot = slots.find((s) => s.key === key);
    if (slot) slot.events.push(event);
    else slots.push({ key, time: event.time!, sub: startsInLabel(event.inMin) ?? event.day!, events: [event] });
  }

  return (
    <ol className="timeline">
      {slots.map((slot) => (
        <li key={slot.key} className="timeline__slot">
          <div className="timeline__time">
            <span className="timeline__clock">{slot.time}</span>
            <span className="timeline__in">{slot.sub}</span>
          </div>
          <ul className="timeline__rows">
            {slot.events.map((event) => (
              <MatchRow key={event.id} event={event} showWhen={false} showCompetition />
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function CompetitionIndex() {
  return (
    <ol className="index">
      {TOP_COMPETITIONS.map((comp, i) => {
        const events = eventsByCompetition(comp.id);
        const live = events.filter((e) => e.status === 'live').length;
        const next = events.find((e) => e.status === 'upcoming');
        return (
          <li key={comp.id} className="index__item">
            <Link href={`/football#${comp.id}`} className="index__link">
              <span className="index__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="index__title">
                <span className="index__name">{comp.name}</span>
                <span className="index__region">{comp.region}</span>
              </span>
              <span className="index__next">
                {next && (
                  <>
                    <span className="index__next-time">
                      {next.day === 'Today' ? next.time : `${next.day} ${next.time}`}
                    </span>
                    {getTeam(next.home).short} v {getTeam(next.away).short}
                  </>
                )}
              </span>
              <span className="index__stats">
                {live > 0 && <span className="index__live">{live} live</span>}
                <span>{events.length} matches</span>
              </span>
            </Link>
            <FollowButton kind="competition" id={comp.id} name={comp.name} />
          </li>
        );
      })}
    </ol>
  );
}

export function HomeView({ sport }: { sport?: SportId }) {
  const sportName = sport ? getSport(sport)?.name : undefined;
  const live = liveEvents(sport);
  const lead = live.find((e) => e.id === FEATURED_EVENT_ID) ?? live[0];
  const liveRest = live.filter((e) => e !== lead);
  const liveShown = liveRest.slice(0, HOME_LIVE_ROWS);

  const soon = startingSoon(sport);
  // Nothing inside the window: fall back to the next fixtures so the section is never a dead end.
  const upcoming = soon.length > 0 ? soon : upcomingEvents(sport).slice(0, 6);

  return (
    <div className="page">
      <h1 className="sr-only">{sportName ? `${sportName} betting` : 'Sports home'}</h1>
      <SportTabs active={sport} />

      <section className="block" aria-label="Live now">
        <SectionHeader
          title="Live now"
          tone="live"
          meta={`${live.length} in play`}
          action={
            live.length > 0 && (
              <Link href="/live" className="text-link">
                All live <Icon name="chevron-right" size={14} />
              </Link>
            )
          }
        />
        {lead ? (
          <>
            <LeadMatch event={lead} />
            {liveShown.length > 0 && <LiveBySport events={liveShown} />}
            {liveRest.length > liveShown.length && (
              <Link href="/live" className="more-link">
                {liveRest.length - liveShown.length} more in play
                <Icon name="chevron-right" size={14} />
              </Link>
            )}
          </>
        ) : (
          <p className="quiet-note">No {sportName?.toLowerCase()} matches are in play right now. The next fixtures are below.</p>
        )}
      </section>

      {(!sport || sport === 'football') && <BigMatches />}

      <section className="block" aria-label="Starting soon">
        <SectionHeader
          title={soon.length > 0 ? 'Starting soon' : 'Next up'}
          meta={soon.length > 0 ? 'Next 2 hours' : 'Upcoming fixtures'}
        />
        <KickoffTimeline events={upcoming} />
      </section>

      {(!sport || sport === 'football') && (
        <section className="block" aria-label="Top competitions">
          <SectionHeader
            title="Top competitions"
            meta="Football"
            action={
              <Link href="/football" className="text-link">
                All football <Icon name="chevron-right" size={14} />
              </Link>
            }
          />
          <CompetitionIndex />
        </section>
      )}
    </div>
  );
}
