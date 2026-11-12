export type SportId =
  | 'football'
  | 'tennis'
  | 'basketball'
  | 'baseball'
  | 'american-football'
  | 'esports';

export interface Sport {
  id: SportId;
  name: string;
}

export interface Competition {
  id: string;
  sportId: SportId;
  name: string;
  region: string;
  /** One of the five headline football competitions. */
  top?: boolean;
}

export type CrestPattern = 'solid' | 'halves' | 'stripes' | 'band' | 'round';

export interface Team {
  id: string;
  name: string;
  /** Shorter display name for tight layouts and odds labels. */
  short: string;
  colors: [string, string];
  pattern: CrestPattern;
  players?: string[];
}

export interface SportEvent {
  id: string;
  sportId: SportId;
  competitionId: string;
  home: string;
  away: string;
  status: 'live' | 'upcoming';
  /** Decimal odds: [home, draw, away] or [home, away] for two-way sports. */
  odds: number[];
  /** Live only. */
  score?: [number, number];
  /** Live football: elapsed minute at prototype start. */
  minute?: number;
  /** Live non-football: fixed period label, e.g. "Q3 4:12". */
  period?: string;
  /** Live: extra score context, e.g. tennis games. */
  scoreDetail?: string;
  /** Upcoming only. */
  day?: string;
  time?: string;
  /** Minutes until start; used for ordering and "starting soon". */
  inMin?: number;
}

export type MarketGroupId =
  | 'popular'
  | 'goals'
  | 'halves'
  | 'handicaps'
  | 'goalscorers'
  | 'corners-cards';

export interface Selection {
  id: string;
  marketId: string;
  eventId: string;
  label: string;
  odds: number;
  /** Previous price, when the opening state should already show movement. */
  prev?: number;
}

export interface Market {
  id: string;
  eventId: string;
  group: MarketGroupId;
  name: string;
  cols: 2 | 3;
  selections: Selection[];
  suspended?: boolean;
}

export type BetStatus = 'open' | 'won' | 'lost' | 'cashed-out';

export interface Bet {
  id: string;
  eventId?: string;
  match: string;
  competition: string;
  market: string;
  selection: string;
  odds: number;
  stake: number;
  status: BetStatus;
  /** Actual return for settled bets. */
  returned?: number;
  placed: string;
  /** Illustrative prototype cash-out value. Not a live calculation. */
  cashOutOffer?: number;
}
