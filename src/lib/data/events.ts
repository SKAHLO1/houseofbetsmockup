import type { SportEvent, SportId } from '../types';
import { getCompetition } from './catalog';

type Live = { minute?: number; period?: string; score: [number, number]; scoreDetail?: string };
type Upcoming = { day: string; time: string; inMin: number };

function live(id: string, competitionId: string, home: string, away: string, odds: number[], l: Live): SportEvent {
  return { id, competitionId, sportId: getCompetition(competitionId).sportId, home, away, odds, status: 'live', ...l };
}

function soon(id: string, competitionId: string, home: string, away: string, odds: number[], u: Upcoming): SportEvent {
  return { id, competitionId, sportId: getCompetition(competitionId).sportId, home, away, odds, status: 'upcoming', ...u };
}

const DAY = 24 * 60;

/**
 * The prototype is frozen at 19:25 on a midweek evening.
 * `inMin` is minutes from that moment and drives ordering.
 */
export const EVENTS: SportEvent[] = [
  // Premier League
  live('ars-bha', 'premier-league', 'arsenal', 'brighton', [1.3, 4.6, 11], { minute: 52, score: [1, 0] }),
  live('new-avl', 'premier-league', 'newcastle', 'aston-villa', [2.45, 3.1, 3.2], { minute: 49, score: [1, 1] }),
  soon('liv-mun', 'premier-league', 'liverpool', 'man-utd', [1.65, 4.0, 4.33], { day: 'Today', time: '19:45', inMin: 20 }),
  soon('mci-tot', 'premier-league', 'man-city', 'tottenham', [1.5, 4.5, 5.25], { day: 'Tomorrow', time: '20:00', inMin: DAY + 35 }),
  soon('che-wol', 'premier-league', 'chelsea', 'wolves', [1.44, 4.5, 7.0], { day: 'Sat 14 Nov', time: '15:00', inMin: 4 * DAY - 265 }),
  // Champions League
  soon('rma-bay', 'champions-league', 'real-madrid', 'bayern', [2.2, 3.7, 2.9], { day: 'Today', time: '20:00', inMin: 35 }),
  soon('int-psg', 'champions-league', 'inter', 'psg', [2.6, 3.4, 2.65], { day: 'Today', time: '20:00', inMin: 35 }),
  soon('nap-atm', 'champions-league', 'napoli', 'atletico', [2.4, 3.2, 3.0], { day: 'Tomorrow', time: '17:45', inMin: DAY - 100 }),
  soon('ben-bvb', 'champions-league', 'benfica', 'dortmund', [2.3, 3.5, 2.95], { day: 'Tomorrow', time: '20:00', inMin: DAY + 35 }),
  // LaLiga
  live('ath-rso', 'laliga', 'athletic', 'real-sociedad', [2.1, 3.1, 3.9], { minute: 23, score: [0, 0] }),
  soon('bar-sev', 'laliga', 'barcelona', 'sevilla', [1.28, 6.0, 9.5], { day: 'Today', time: '20:15', inMin: 50 }),
  soon('vil-bet', 'laliga', 'villarreal', 'real-betis', [2.05, 3.5, 3.6], { day: 'Sat 14 Nov', time: '17:30', inMin: 4 * DAY - 115 }),
  soon('val-gir', 'laliga', 'valencia', 'girona', [2.3, 3.25, 3.2], { day: 'Sun 15 Nov', time: '13:00', inMin: 5 * DAY - 385 }),
  // Serie A
  live('mil-laz', 'serie-a', 'milan', 'lazio', [2.75, 2.6, 3.4], { minute: 67, score: [2, 2] }),
  soon('juv-rom', 'serie-a', 'juventus', 'roma', [2.0, 3.3, 3.9], { day: 'Tomorrow', time: '19:45', inMin: DAY + 20 }),
  soon('ata-fio', 'serie-a', 'atalanta', 'fiorentina', [1.8, 3.7, 4.4], { day: 'Sat 14 Nov', time: '14:00', inMin: 4 * DAY - 325 }),
  soon('bol-tor', 'serie-a', 'bologna', 'torino', [1.9, 3.4, 4.33], { day: 'Sun 15 Nov', time: '11:30', inMin: 5 * DAY - 475 }),
  // Bundesliga
  live('sge-vfb', 'bundesliga', 'frankfurt', 'stuttgart', [9.0, 4.2, 1.36], { minute: 81, score: [0, 1] }),
  soon('b04-rbl', 'bundesliga', 'leverkusen', 'leipzig', [2.15, 3.6, 3.2], { day: 'Today', time: '19:45', inMin: 20 }),
  soon('bmg-wob', 'bundesliga', 'gladbach', 'wolfsburg', [2.5, 3.5, 2.7], { day: 'Sat 14 Nov', time: '14:30', inMin: 4 * DAY - 295 }),
  soon('scf-fcu', 'bundesliga', 'freiburg', 'union-berlin', [1.95, 3.4, 4.0], { day: 'Sat 14 Nov', time: '14:30', inMin: 4 * DAY - 295 }),
  // Tennis
  live('alc-zve', 'atp-finals', 'alcaraz', 'zverev', [1.22, 4.2], { period: '2nd set', score: [1, 0], scoreDetail: '6-4, 3-2' }),
  soon('sin-fri', 'atp-finals', 'sinner', 'fritz', [1.14, 5.5], { day: 'Today', time: '20:30', inMin: 65 }),
  // Basketball
  live('bos-mil', 'nba', 'celtics', 'bucks', [1.45, 2.75], { period: 'Q3 4:12', score: [78, 71] }),
  soon('lal-den', 'nba', 'lakers', 'nuggets', [2.1, 1.75], { day: 'Tomorrow', time: '03:00', inMin: 455 }),
  live('oly-fen', 'euroleague', 'olympiacos', 'fenerbahce', [1.8, 2.0], { period: 'Q2 6:40', score: [38, 35] }),
  soon('pao-mon', 'euroleague', 'panathinaikos', 'monaco', [1.62, 2.3], { day: 'Today', time: '20:45', inMin: 80 }),
  // Baseball
  soon('lic-agu', 'lidom', 'licey', 'aguilas', [1.8, 2.0], { day: 'Today', time: '23:30', inMin: 245 }),
  soon('esc-tor', 'lidom', 'escogido', 'toros', [1.72, 2.1], { day: 'Tomorrow', time: '23:30', inMin: DAY + 245 }),
  // American football
  soon('kc-buf', 'nfl', 'chiefs', 'bills', [1.8, 2.05], { day: 'Sun 15 Nov', time: '21:25', inMin: 5 * DAY + 120 }),
  soon('dal-phi', 'nfl', 'cowboys', 'eagles', [2.6, 1.52], { day: 'Mon 16 Nov', time: '01:20', inMin: 5 * DAY + 355 }),
  // Esports
  live('navi-faze', 'blast-fall-final', 'navi', 'faze', [1.55, 2.4], { period: 'Map 2', score: [1, 0], scoreDetail: '13-9, 6-4' }),
  soon('g2-vit', 'blast-fall-final', 'g2', 'vitality', [2.1, 1.72], { day: 'Today', time: '21:00', inMin: 95 }),
];

export const FEATURED_EVENT_ID = 'ars-bha';
export const STARTING_SOON_WINDOW_MIN = 120;

export function getEvent(id: string): SportEvent | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function liveEvents(sportId?: SportId): SportEvent[] {
  return EVENTS.filter((e) => e.status === 'live' && (!sportId || e.sportId === sportId));
}

export function upcomingEvents(sportId?: SportId): SportEvent[] {
  return EVENTS.filter((e) => e.status === 'upcoming' && (!sportId || e.sportId === sportId)).sort(
    (a, b) => (a.inMin ?? 0) - (b.inMin ?? 0),
  );
}

export function startingSoon(sportId?: SportId): SportEvent[] {
  return upcomingEvents(sportId).filter((e) => (e.inMin ?? Infinity) <= STARTING_SOON_WINDOW_MIN);
}

export function eventsByCompetition(competitionId: string): SportEvent[] {
  return EVENTS.filter((e) => e.competitionId === competitionId).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'live' ? -1 : 1;
    return (a.inMin ?? 0) - (b.inMin ?? 0);
  });
}

/** Groups events by competition, preserving first-seen order. */
export function groupByCompetition(events: SportEvent[]): { competitionId: string; events: SportEvent[] }[] {
  const groups: { competitionId: string; events: SportEvent[] }[] = [];
  for (const event of events) {
    const group = groups.find((g) => g.competitionId === event.competitionId);
    if (group) group.events.push(event);
    else groups.push({ competitionId: event.competitionId, events: [event] });
  }
  return groups;
}
