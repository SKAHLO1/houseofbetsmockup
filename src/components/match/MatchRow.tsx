'use client';

import Link from 'next/link';
import { getCompetition, getTeam } from '@/lib/data/catalog';
import { extraMarketCount, getResultMarket } from '@/lib/data/markets';
import { eventName, liveClock, startsInLabel } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { SportEvent, Team } from '@/lib/types';
import { Crest } from '../ui/Crest';
import { FollowButton } from '../ui/FollowButton';
import { Icon } from '../ui/Icon';
import { OddsButton } from '../ui/OddsButton';

interface Props {
  event: SportEvent;
  /** Adds per-team follow controls (Football page). */
  followable?: boolean;
  /** Hide the time column when a parent already shows it (kick-off timeline). */
  showWhen?: boolean;
  /** Label the competition above the teams, for mixed lists. */
  showCompetition?: boolean;
  /** Print 1 / X / 2 inside each price. Off where a column header already labels them. */
  showKeys?: boolean;
}

const KEYS_3 = ['1', 'X', '2'];
const KEYS_2 = ['1', '2'];

/** Kick-off or live-clock cell. */
export function EventWhen({ event }: { event: SportEvent }) {
  const { state } = useStore();
  if (event.status === 'live') {
    return (
      <div className="when when--live">
        <span className="when__clock">{liveClock(event, state.elapsed)}</span>
        <span className="when__sub">{event.scoreDetail ?? 'Live'}</span>
      </div>
    );
  }
  return (
    <div className="when">
      <span className="when__clock">{event.time}</span>
      <span className="when__sub">{startsInLabel(event.inMin) ?? event.day}</span>
    </div>
  );
}

function TeamLine({ team, goals }: { team: Team; goals?: number }) {
  return (
    <span className="row__team">
      <Crest teamId={team.id} size={18} />
      <span className="row__name">
        <span className="row__name-full">{team.name}</span>
        <span className="row__name-short">{team.short}</span>
      </span>
      {goals !== undefined && <span className="row__goals">{goals}</span>}
    </span>
  );
}

export function MatchRow({ event, followable = false, showWhen = true, showCompetition = false, showKeys = true }: Props) {
  const { state } = useStore();
  const home = getTeam(event.home);
  const away = getTeam(event.away);
  const result = getResultMarket(event.id);
  const keys = result.selections.length === 2 ? KEYS_2 : KEYS_3;
  const more = extraMarketCount(event.id);
  const isFollowed = state.followedTeams.includes(home.id) || state.followedTeams.includes(away.id);
  const live = event.status === 'live';

  return (
    <li className={`row ${showWhen ? '' : 'row--nowhen'} ${live ? 'row--live' : ''} ${isFollowed ? 'row--followed' : ''}`}>
      {showWhen && <EventWhen event={event} />}

      <div className="row__main">
        {followable && (
          <div className="row__follows">
            <FollowButton kind="team" id={home.id} name={home.name} />
            <FollowButton kind="team" id={away.id} name={away.name} />
          </div>
        )}
        <Link href={`/match/${event.id}`} className="row__link" aria-label={`${eventName(event)}, open match`}>
          {showCompetition && <span className="row__comp">{getCompetition(event.competitionId).name}</span>}
          <TeamLine team={home} goals={event.score?.[0]} />
          <TeamLine team={away} goals={event.score?.[1]} />
        </Link>
      </div>

      <div className={`row__odds ${keys.length === 2 ? 'row__odds--two' : ''}`}>
        {result.selections.map((sel, i) => (
          <OddsButton key={sel.id} selectionId={sel.id} outcomeKey={showKeys ? keys[i] : undefined} showChance />
        ))}
      </div>

      <Link href={`/match/${event.id}`} className="row__more" aria-label={`${more} more markets for ${eventName(event)}`}>
        +{more}
        <Icon name="chevron-right" size={14} />
      </Link>
    </li>
  );
}
