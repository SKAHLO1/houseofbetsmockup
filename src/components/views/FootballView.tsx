'use client';

import Link from 'next/link';
import { TOP_COMPETITIONS, getCompetition, getTeam } from '@/lib/data/catalog';
import { EVENTS, eventsByCompetition } from '@/lib/data/events';
import { useStore } from '@/lib/store';
import { MatchRow } from '../match/MatchRow';
import { MatchTable } from '../match/MatchTable';
import { Crest } from '../ui/Crest';
import { FollowButton } from '../ui/FollowButton';
import { Icon } from '../ui/Icon';
import { SectionHeader } from '../ui/SectionHeader';

function Following() {
  const { state, dispatch } = useStore();
  const { followedTeams, followedCompetitions } = state;
  const matches = EVENTS.filter(
    (e) => e.sportId === 'football' && (followedTeams.includes(e.home) || followedTeams.includes(e.away)),
  ).sort((a, b) => (a.status === 'live' ? -1 : a.inMin ?? 0) - (b.status === 'live' ? -1 : b.inMin ?? 0));
  const none = followedTeams.length + followedCompetitions.length === 0;

  return (
    <section className="block following" aria-label="Following">
      <SectionHeader title="Following" meta={none ? undefined : `${followedCompetitions.length} competitions · ${followedTeams.length} teams`} />
      {none ? (
        <p className="quiet-note">
          Use the <Icon name="star" size={14} /> next to a team or competition to pin it here.
        </p>
      ) : (
        <ul className="following__chips">
          {followedCompetitions.map((id) => (
            <li key={id} className="follow-chip">
              <a href={`#${id}`} className="follow-chip__link">
                <Icon name="star-filled" size={12} className="follow-chip__star" />
                {getCompetition(id).name}
              </a>
              <button
                type="button"
                className="follow-chip__remove"
                aria-label={`Unfollow ${getCompetition(id).name}`}
                onClick={() => dispatch({ type: 'toggle-follow-competition', competitionId: id })}
              >
                <Icon name="close" size={12} />
              </button>
            </li>
          ))}
          {followedTeams.map((id) => (
            <li key={id} className="follow-chip">
              <span className="follow-chip__link">
                <Crest teamId={id} size={16} />
                {getTeam(id).name}
              </span>
              <button
                type="button"
                className="follow-chip__remove"
                aria-label={`Unfollow ${getTeam(id).name}`}
                onClick={() => dispatch({ type: 'toggle-follow-team', teamId: id })}
              >
                <Icon name="close" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {matches.length > 0 && (
        <div className="comp comp--pinned">
          <header className="comp__head">
            <h3 className="comp__title">
              <span className="comp__name">Your teams’ matches</span>
            </h3>
            <span className="comp__count">{matches.length}</span>
          </header>
          <ul className="comp__rows">
            {matches.map((event) => (
              <MatchRow key={event.id} event={event} followable showCompetition />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function FootballView() {
  const { state } = useStore();
  // Followed competitions float to the top; otherwise keep the editorial order.
  const competitions = [...TOP_COMPETITIONS].sort(
    (a, b) => Number(state.followedCompetitions.includes(b.id)) - Number(state.followedCompetitions.includes(a.id)),
  );

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-head__title">
          <Icon name="football" size={20} />
          Football
        </h1>
        <span className="page-head__meta">{EVENTS.filter((e) => e.sportId === 'football').length} matches · 5 competitions</span>
      </div>

      <nav className="jump" aria-label="Jump to competition">
        {TOP_COMPETITIONS.map((comp) => (
          <a key={comp.id} href={`#${comp.id}`} className="jump__link">
            {comp.name}
            <span className="jump__count">{eventsByCompetition(comp.id).length}</span>
          </a>
        ))}
      </nav>

      <Following />

      <section className="block" aria-label="Competitions">
        <SectionHeader title="Competitions" meta="Match result · 1 X 2" />
        {competitions.map((comp) => (
          <MatchTable
            key={comp.id}
            index={TOP_COMPETITIONS.indexOf(comp) + 1}
            anchor={comp.id}
            competitionId={comp.id}
            events={eventsByCompetition(comp.id)}
            collapsible
            followable
            actions={
              <span className="comp__action-group">
                <Link href={`/league/${comp.id}`} className="text-link comp__league-link">
                  League page <Icon name="chevron-right" size={14} />
                </Link>
                <FollowButton kind="competition" id={comp.id} name={comp.name} labelled />
              </span>
            }
          />
        ))}
      </section>
    </div>
  );
}
