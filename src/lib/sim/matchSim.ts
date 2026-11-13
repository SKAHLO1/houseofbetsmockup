/**
 * Mock in-play football simulation for the live match tracker.
 *
 * Coordinates are metres on a 105 × 68 pitch. Home attacks left → right
 * (towards x = 105), away attacks right → left. Each `step` advances one
 * "action" (pass, dribble, tackle, shot, restart) and returns a new state.
 *
 * Deliberately never produces a goal: the score shown on the match page is
 * fixed mock data, and the tracker must not contradict it.
 */
import type { Team } from '../types';

export const PITCH_W = 105;
export const PITCH_H = 68;

export type Side = 'home' | 'away';

export type Zone = 'safe' | 'attack' | 'danger';

export interface SimEvent {
  id: number;
  minute: number;
  side: Side;
  text: string;
  /** Highlights shots and big chances in the feed. */
  big?: boolean;
}

export interface SimState {
  tick: number;
  side: Side;
  x: number;
  y: number;
  /** Where the ball came from, for the pass trail. */
  fromX: number;
  fromY: number;
  carrier: string;
  /** Last action, drives animation speed and the trail style. */
  action: 'pass' | 'dribble' | 'tackle' | 'shot' | 'restart';
  pending: null | { kind: 'corner' | 'goal-kick' | 'keeper'; side: Side };
  possession: Record<Side, number>;
  events: SimEvent[];
  nextEventId: number;
}

export interface SimTeams {
  home: Team;
  away: Team;
}

const FALLBACK_NUMBERS = [4, 6, 8, 10, 11, 9, 7, 5];

/** Outfield names for a side: real squad names where the mock data has them, shirt numbers otherwise. */
export function squad(team: Team): string[] {
  if (team.players && team.players.length >= 3) return team.players;
  return FALLBACK_NUMBERS.map((n) => `${team.short} #${n}`);
}

const keeper = (team: Team) => `${team.short} keeper`;

/**
 * Short display form. Team colour already says whose player it is, so:
 * "Martin Ødegaard" → "Ødegaard", "Real Sociedad #8" → "#8", "Brighton keeper" → "Keeper".
 */
export function shortName(name: string): string {
  if (name.includes('#')) return name.slice(name.indexOf('#'));
  if (name.endsWith('keeper')) return 'Keeper';
  const parts = name.split(' ');
  return parts[parts.length - 1];
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const pick = <T,>(list: T[], rand: () => number) => list[Math.floor(rand() * list.length)];
const other = (side: Side): Side => (side === 'home' ? 'away' : 'home');
const dir = (side: Side) => (side === 'home' ? 1 : -1);

/** Distance travelled towards the opponent's goal, 0–105. */
export function progress(side: Side, x: number): number {
  return side === 'home' ? x : PITCH_W - x;
}

export function zoneOf(state: Pick<SimState, 'side' | 'x'>): Zone {
  const p = progress(state.side, state.x);
  if (p > 82) return 'danger';
  if (p > 58) return 'attack';
  return 'safe';
}

function teamOf(teams: SimTeams, side: Side): Team {
  return side === 'home' ? teams.home : teams.away;
}

function newCarrier(teams: SimTeams, side: Side, current: string, rand: () => number): string {
  const names = squad(teamOf(teams, side)).filter((n) => n !== current);
  return pick(names, rand);
}

export function initialSim(teams: SimTeams): SimState {
  const carrier = squad(teams.home)[0];
  return {
    tick: 0,
    side: 'home',
    x: 52.5,
    y: 34,
    fromX: 52.5,
    fromY: 34,
    carrier,
    action: 'restart',
    pending: null,
    possession: { home: 1, away: 1 },
    events: [],
    nextEventId: 1,
  };
}

/** Advances the simulation by one action. `rand` is injectable for tests. */
export function step(prev: SimState, teams: SimTeams, minute: number, rand: () => number = Math.random): SimState {
  const s: SimState = {
    ...prev,
    tick: prev.tick + 1,
    fromX: prev.x,
    fromY: prev.y,
    possession: { ...prev.possession },
    events: prev.events,
  };
  const events: SimEvent[] = [];
  const log = (side: Side, text: string, big = false) => events.push({ id: s.nextEventId++, minute, side, text, big });

  // A restart decided on the previous action (corner, goal kick, keeper's ball).
  if (prev.pending) {
    const { kind, side } = prev.pending;
    const team = teamOf(teams, side);
    s.side = side;
    s.pending = null;
    s.action = 'restart';
    if (kind === 'corner') {
      s.x = side === 'home' ? PITCH_W - 0.5 : 0.5;
      s.y = rand() > 0.5 ? 0.5 : PITCH_H - 0.5;
      s.carrier = newCarrier(teams, side, '', rand);
      log(side, `Corner to ${team.short}, ${shortName(s.carrier)} to take`);
    } else {
      s.x = side === 'home' ? 6 : PITCH_W - 6;
      s.y = 34 + (rand() - 0.5) * 10;
      s.carrier = keeper(team);
      if (kind === 'goal-kick') log(side, `Goal kick for ${team.short}`);
    }
    s.possession[side] += 1;
    s.events = [...events, ...prev.events].slice(0, 6);
    return s;
  }

  const team = teamOf(teams, s.side);
  const p = progress(s.side, s.x);
  const r = rand();

  if (p > 80 && r < 0.26) {
    // Shot: the ball goes to the goal mouth, then a restart is queued.
    const shooter = s.carrier.endsWith('keeper') ? newCarrier(teams, s.side, '', rand) : s.carrier;
    s.carrier = shooter;
    s.action = 'shot';
    s.x = s.side === 'home' ? PITCH_W - 0.8 : 0.8;
    const outcome = rand();
    if (outcome < 0.45) {
      s.y = 31 + rand() * 6;
      log(s.side, `${shortName(shooter)} shoots — saved by the ${teamOf(teams, other(s.side)).short} keeper`, true);
      s.pending = { kind: 'keeper', side: other(s.side) };
    } else if (outcome < 0.75) {
      s.y = rand() > 0.5 ? 26 : 42;
      log(s.side, `${shortName(shooter)} fires wide`, true);
      s.pending = { kind: 'goal-kick', side: other(s.side) };
    } else {
      s.x = s.side === 'home' ? PITCH_W - 9 : 9;
      s.y = 34 + (rand() - 0.5) * 12;
      log(s.side, `${shortName(shooter)}'s shot is blocked, out for a corner`, true);
      s.pending = { kind: 'corner', side: s.side };
    }
  } else if (r < 0.2) {
    // Turnover: the opponent wins it near the ball.
    const winner = other(s.side);
    s.side = winner;
    s.action = 'tackle';
    s.x = clamp(s.x + (rand() - 0.5) * 6, 2, PITCH_W - 2);
    s.y = clamp(s.y + (rand() - 0.5) * 8, 2, PITCH_H - 2);
    s.carrier = newCarrier(teams, winner, '', rand);
    log(winner, `${teamOf(teams, winner).short} win it back through ${shortName(s.carrier)}`);
  } else {
    // Pass or carry, mostly forward, drifting across the width.
    const pass = rand() < 0.72;
    const forward = pass ? 5 + rand() * 15 : 3 + rand() * 7;
    const back = rand() < 0.15 ? -1 : 1; // the odd recycling pass backwards
    s.x = clamp(s.x + dir(s.side) * forward * back, 3, PITCH_W - 3);
    s.y = clamp(s.y + (rand() - 0.5) * (pass ? 30 : 10), 3, PITCH_H - 3);
    s.action = pass ? 'pass' : 'dribble';
    if (pass) {
      const from = s.carrier;
      s.carrier = newCarrier(teams, s.side, from, rand);
      // Commentate the passes that matter: into the final third.
      if (progress(s.side, s.x) > 70 && rand() < 0.6) {
        log(s.side, `${shortName(from)} finds ${shortName(s.carrier)} in the final third`);
      }
    } else if (rand() < 0.25) {
      log(s.side, `${shortName(s.carrier)} drives forward`);
    }
    // Keepers distribute quickly
    if (prev.carrier === keeper(team) && !pass) s.carrier = newCarrier(teams, s.side, '', rand);
  }

  s.possession[s.side] += 1;
  s.events = [...events, ...prev.events].slice(0, 6);
  return s;
}

export function possessionPct(state: SimState): { home: number; away: number } {
  const total = state.possession.home + state.possession.away;
  const home = Math.round((state.possession.home / total) * 100);
  return { home, away: 100 - home };
}
