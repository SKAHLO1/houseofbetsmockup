import { ALL_TEAMS, COMPETITIONS, getTeam } from './catalog';
import { EVENTS } from './events';
import { MARKETS_BY_EVENT } from './markets';

export type SearchKind = 'Teams' | 'Players' | 'Competitions' | 'Markets';

export interface SearchResult {
  kind: SearchKind;
  id: string;
  title: string;
  detail: string;
  href: string;
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o');

function eventLabel(eventId: string): string {
  const e = EVENTS.find((x) => x.id === eventId)!;
  return `${getTeam(e.home).short} v ${getTeam(e.away).short}`;
}

function nextEventFor(teamId: string) {
  return EVENTS.filter((e) => e.home === teamId || e.away === teamId).sort(
    (a, b) => (a.status === 'live' ? -1 : a.inMin ?? 0) - (b.status === 'live' ? -1 : b.inMin ?? 0),
  )[0];
}

const PER_KIND = 4;

export function search(query: string): SearchResult[] {
  const q = normalise(query.trim());
  if (q.length < 2) return [];
  const hit = (s: string) => normalise(s).includes(q);
  const results: SearchResult[] = [];

  // Tennis players compete as "teams" in the data model but are people to the punter.
  const isPerson = (teamId: string) => EVENTS.some((e) => e.sportId === 'tennis' && (e.home === teamId || e.away === teamId));

  const teams: SearchResult[] = [];
  const players: SearchResult[] = [];

  for (const team of ALL_TEAMS) {
    const event = nextEventFor(team.id);
    if (!event) continue;
    if (hit(team.name) || hit(team.short)) {
      (isPerson(team.id) ? players : teams).push({
        kind: isPerson(team.id) ? 'Players' : 'Teams',
        id: `team-${team.id}`,
        title: team.name,
        detail: `${eventLabel(event.id)} · ${event.status === 'live' ? 'Live' : `${event.day} ${event.time}`}`,
        href: `/match/${event.id}`,
      });
    }
    for (const player of team.players ?? []) {
      if (hit(player)) {
        players.push({
          kind: 'Players',
          id: `player-${team.id}-${player}`,
          title: player,
          detail: `${team.short} · Goalscorer markets, ${eventLabel(event.id)}`,
          href: `/match/${event.id}?group=goalscorers`,
        });
      }
    }
  }

  const competitions: SearchResult[] = COMPETITIONS.filter((c) => hit(c.name) || hit(c.region)).map((c) => ({
    kind: 'Competitions',
    id: `comp-${c.id}`,
    title: c.name,
    detail: `${c.region} · ${EVENTS.filter((e) => e.competitionId === c.id).length} matches`,
    href: `/league/${c.id}`,
  }));

  const markets: SearchResult[] = [];
  const ordered = [...EVENTS].sort((a, b) => (a.status === 'live' ? -1 : a.inMin ?? 0) - (b.status === 'live' ? -1 : b.inMin ?? 0));
  for (const event of ordered) {
    if (markets.length >= PER_KIND) break;
    const match = MARKETS_BY_EVENT[event.id].find((mk) => hit(mk.name));
    if (match) {
      markets.push({
        kind: 'Markets',
        id: `market-${match.id}`,
        title: match.name,
        detail: eventLabel(event.id),
        href: `/match/${event.id}?group=${match.group}`,
      });
    }
  }

  results.push(...teams.slice(0, PER_KIND), ...players.slice(0, PER_KIND), ...competitions.slice(0, PER_KIND), ...markets);
  return results;
}
