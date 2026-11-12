import type { Market, MarketGroupId, Selection, SportEvent } from '../types';
import { getTeam } from './catalog';
import { EVENTS } from './events';

export const MARKET_GROUPS: { id: MarketGroupId; name: string }[] = [
  { id: 'popular', name: 'Popular' },
  { id: 'goals', name: 'Goals' },
  { id: 'halves', name: 'Halves' },
  { id: 'handicaps', name: 'Handicaps' },
  { id: 'goalscorers', name: 'Goalscorers' },
  { id: 'corners-cards', name: 'Corners & Cards' },
];

/* ---------- pricing helpers ---------- */

/** Deterministic 0..1 value from a string, so mock prices are stable between renders. */
function seeded(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Snap to the price ladder a sportsbook would actually quote. */
export function snapOdds(o: number): number {
  const step = o < 2 ? 0.01 : o < 4 ? 0.05 : o < 10 ? 0.1 : o < 20 ? 0.5 : 1;
  const snapped = Math.round(o / step) * step;
  return Math.round(clamp(snapped, 1.01, 151) * 100) / 100;
}

function price(probability: number, margin = 1.06): number {
  return snapOdds(1 / (clamp(probability, 0.01, 0.97) * margin));
}

/* ---------- market construction ---------- */

type Outcome = [label: string, odds: number];

function market(
  event: SportEvent,
  key: string,
  group: MarketGroupId,
  name: string,
  cols: 2 | 3,
  outcomes: Outcome[],
): Market {
  const id = `${event.id}:${key}`;
  const selections: Selection[] = outcomes.map(([label, odds], i) => ({
    id: `${id}:${i}`,
    marketId: id,
    eventId: event.id,
    label,
    odds,
  }));
  return { id, eventId: event.id, group, name, cols, selections };
}

function overUnder(lines: [line: number, pOver: number][]): Outcome[] {
  return lines.flatMap(([line, p]): Outcome[] => [
    [`Over ${line}`, price(p)],
    [`Under ${line}`, price(1 - p)],
  ]);
}

function resultMarket(event: SportEvent): Market {
  const home = getTeam(event.home).short;
  const away = getTeam(event.away).short;
  const threeWay = event.odds.length === 3;
  const name =
    event.sportId === 'football' ? 'Match result' : event.sportId === 'tennis' || event.sportId === 'esports' ? 'Match winner' : 'Moneyline';
  const outcomes: Outcome[] = threeWay
    ? [
        [home, event.odds[0]],
        ['Draw', event.odds[1]],
        [away, event.odds[2]],
      ]
    : [
        [home, event.odds[0]],
        [away, event.odds[1]],
      ];
  return market(event, 'result', 'popular', name, threeWay ? 3 : 2, outcomes);
}

function footballMarkets(event: SportEvent): Market[] {
  const home = getTeam(event.home);
  const away = getTeam(event.away);
  const [oh, od, oa] = event.odds;
  const total = 1 / oh + 1 / od + 1 / oa;
  const pH = 1 / oh / total;
  const pD = 1 / od / total;
  const pA = 1 / oa / total;
  const gap = Math.abs(pH - pA);
  const jitter = (k: string) => (seeded(event.id + k) - 0.5) * 0.08;
  const m = (key: string, group: MarketGroupId, name: string, cols: 2 | 3, outcomes: Outcome[]) =>
    market(event, key, group, name, cols, outcomes);

  const pO25 = clamp(0.5 + gap * 0.18 + jitter('o25'), 0.3, 0.72);
  const pBtts = clamp(0.57 - gap * 0.25 + jitter('btts'), 0.3, 0.68);
  const secondHalf = event.status === 'live' && (event.minute ?? 0) > 45;
  const half = secondHalf ? '2nd half' : '1st half';
  const hk = secondHalf ? 'h2' : 'h1';

  const markets: Market[] = [
    resultMarket(event),
    m('dc', 'popular', 'Double chance', 3, [
      [`${home.short} or Draw`, price(pH + pD, 1.05)],
      [`${home.short} or ${away.short}`, price(pH + pA, 1.05)],
      [`Draw or ${away.short}`, price(pD + pA, 1.05)],
    ]),
    m('btts', 'popular', 'Both teams to score', 2, [
      ['Yes', price(pBtts)],
      ['No', price(1 - pBtts)],
    ]),
    m('ou25', 'popular', 'Total goals', 2, overUnder([[2.5, pO25]])),
    m('next-goal', 'popular', 'Next goal', 3, [
      [home.short, price((pH + pD / 2) * 0.88)],
      ['No goal', price(0.12)],
      [away.short, price((pA + pD / 2) * 0.88)],
    ]),
    m('dnb', 'popular', 'Draw no bet', 2, [
      [home.short, price(pH / (pH + pA))],
      [away.short, price(pA / (pH + pA))],
    ]),

    m('ou-lines', 'goals', 'Total goals — alternative lines', 2, overUnder([
      [1.5, clamp(pO25 + 0.24, 0.3, 0.9)],
      [2.5, pO25],
      [3.5, clamp(pO25 - 0.24, 0.1, 0.7)],
      [4.5, clamp(pO25 - 0.4, 0.05, 0.5)],
    ])),
    m('home-goals', 'goals', `${home.short} total goals`, 2, overUnder([
      [0.5, clamp(0.5 + pH * 0.55, 0.4, 0.93)],
      [1.5, clamp(0.2 + pH * 0.6, 0.15, 0.8)],
    ])),
    m('away-goals', 'goals', `${away.short} total goals`, 2, overUnder([
      [0.5, clamp(0.5 + pA * 0.55, 0.4, 0.93)],
      [1.5, clamp(0.2 + pA * 0.6, 0.15, 0.8)],
    ])),
    m('odd-even', 'goals', 'Total goals odd / even', 2, [
      ['Odd', 1.9],
      ['Even', 1.9],
    ]),

    m(`${hk}-result`, 'halves', `${half} result`, 3, [
      [home.short, price(pH * 0.72)],
      ['Draw', price(1 - (pH + pA) * 0.72)],
      [away.short, price(pA * 0.72)],
    ]),
    m(`${hk}-goals`, 'halves', `${half} total goals`, 2, overUnder([
      [0.5, clamp(0.68 + jitter('hg'), 0.5, 0.85)],
      [1.5, clamp(0.34 + jitter('hg'), 0.2, 0.55)],
    ])),
    m(`${hk}-btts`, 'halves', `${half} both teams to score`, 2, [
      ['Yes', price(pBtts * 0.38)],
      ['No', price(1 - pBtts * 0.38)],
    ]),
    m('half-most', 'halves', 'Half with most goals', 3, [
      ['1st half', price(0.31)],
      ['Tie', price(0.25)],
      ['2nd half', price(0.44)],
    ]),

    m('hcap-home-1', 'handicaps', `Handicap — ${home.short} −1`, 3, [
      [`${home.short} −1`, price(pH * 0.56)],
      ['Tie', price(pH * 0.27)],
      [`${away.short} +1`, price(1 - pH * 0.83)],
    ]),
    m('hcap-away-1', 'handicaps', `Handicap — ${away.short} −1`, 3, [
      [`${home.short} +1`, price(1 - pA * 0.83)],
      ['Tie', price(pA * 0.27)],
      [`${away.short} −1`, price(pA * 0.56)],
    ]),
    m('asian', 'handicaps', 'Asian handicap', 2, [
      [`${home.short} −1.5`, price(pH * 0.56, 1.05)],
      [`${away.short} +1.5`, price(1 - pH * 0.56, 1.05)],
      [`${home.short} −0.5`, price(pH, 1.05)],
      [`${away.short} +0.5`, price(pD + pA, 1.05)],
      [`${home.short} +0.5`, price(pH + pD, 1.05)],
      [`${away.short} −0.5`, price(pA, 1.05)],
    ]),

    m('corners', 'corners-cards', 'Total corners', 2, overUnder([
      [8.5, clamp(0.66 + jitter('co'), 0.4, 0.8)],
      [9.5, clamp(0.52 + jitter('co'), 0.3, 0.7)],
      [10.5, clamp(0.38 + jitter('co'), 0.2, 0.6)],
    ])),
    m('most-corners', 'corners-cards', 'Most corners', 3, [
      [home.short, price(0.25 + pH * 0.45)],
      ['Tie', price(0.09)],
      [away.short, price(0.25 + pA * 0.45)],
    ]),
    m('cards', 'corners-cards', 'Total cards', 2, overUnder([
      [3.5, clamp(0.6 + jitter('ca'), 0.4, 0.75)],
      [4.5, clamp(0.4 + jitter('ca'), 0.25, 0.6)],
    ])),
    m('red-card', 'corners-cards', 'Red card in match', 2, [
      ['Yes', price(0.11)],
      ['No', price(0.89)],
    ]),
  ];

  const scorers = [
    ...(home.players ?? []).map((name, i) => ({ name, p: (0.42 - i * 0.07) * (0.6 + pH * 0.9) })),
    ...(away.players ?? []).map((name, i) => ({ name, p: (0.42 - i * 0.07) * (0.6 + pA * 0.9) })),
  ].sort((a, b) => b.p - a.p);

  if (scorers.length > 0) {
    markets.push(
      m('anytime', 'goalscorers', 'Anytime goalscorer', 2, scorers.map((s) => [s.name, price(s.p, 1.1)])),
      m('next-scorer', 'goalscorers', event.status === 'live' ? 'Next goalscorer' : 'First goalscorer', 2, [
        ...scorers.map((s): Outcome => [s.name, price(s.p / 3.2, 1.12)]),
        ['No goalscorer', price(0.1, 1.12)],
      ]),
      m('two-plus', 'goalscorers', 'To score 2 or more', 2, scorers.map((s) => [s.name, price(s.p * s.p * 0.55, 1.12)])),
    );
  }

  return markets;
}

function twoWayMarkets(event: SportEvent): Market[] {
  const home = getTeam(event.home).short;
  const away = getTeam(event.away).short;
  const pH = 1 / event.odds[0] / (1 / event.odds[0] + 1 / event.odds[1]);
  const fav = pH >= 0.5;
  const j = seeded(event.id);
  const even = (a: string, b: string): Outcome[] => [
    [a, snapOdds(1.87 + j * 0.08)],
    [b, snapOdds(1.95 - j * 0.08)],
  ];
  const m = (key: string, name: string, outcomes: Outcome[]) => market(event, key, 'popular', name, 2, outcomes);
  const spread = (n: number) => even(`${home} ${fav ? '−' : '+'}${n}`, `${away} ${fav ? '+' : '−'}${n}`);
  const totals = (line: number) => even(`Over ${line}`, `Under ${line}`);

  const extras: Record<string, Market[]> = {
    tennis: [
      m('set-hcap', 'Set handicap', spread(1.5)),
      m('total-games', 'Total games', totals(22.5)),
      m('set-winner', event.status === 'live' ? 'Current set winner' : 'First set winner', [
        [home, price(pH * 0.92 + 0.04)],
        [away, price(1 - (pH * 0.92 + 0.04))],
      ]),
    ],
    basketball: [m('spread', 'Point spread', spread(4.5)), m('total-points', 'Total points', totals(221.5))],
    baseball: [m('run-line', 'Run line', spread(1.5)), m('total-runs', 'Total runs', totals(8.5))],
    'american-football': [m('spread', 'Point spread', spread(2.5)), m('total-points', 'Total points', totals(47.5))],
    esports: [m('map-hcap', 'Map handicap', spread(1.5)), m('total-maps', 'Total maps', totals(2.5))],
  };

  return [resultMarket(event), ...(extras[event.sportId] ?? [])];
}

function buildMarkets(event: SportEvent): Market[] {
  const markets = event.sportId === 'football' ? footballMarkets(event) : twoWayMarkets(event);
  applyOpeningState(event.id, markets);
  return markets;
}

/**
 * Opening prototype state: a few prices that have already moved and a few
 * suspended markets, so both states are visible without triggering anything.
 */
function applyOpeningState(eventId: string, markets: Market[]) {
  const find = (key: string) => markets.find((mk) => mk.id === `${eventId}:${key}`);
  if (eventId === 'ars-bha') {
    const result = find('result');
    if (result) {
      result.selections[0].prev = 1.33;
      result.selections[2].prev = 10;
    }
    const ou = find('ou25');
    if (ou) ou.selections[0].prev = snapOdds(ou.selections[0].odds - 0.07);
    const nextGoal = find('next-goal');
    if (nextGoal) nextGoal.suspended = true;
    const cards = find('cards');
    if (cards) cards.suspended = true;
  }
  if (eventId === 'mil-laz') {
    // Goal just scored: the whole result market is locked while prices are recalculated.
    const result = find('result');
    if (result) result.suspended = true;
  }
  if (eventId === 'sge-vfb') {
    const result = find('result');
    if (result) result.selections[2].prev = 1.4;
  }
}

/* ---------- registry ---------- */

export const MARKETS_BY_EVENT: Record<string, Market[]> = {};
export const MARKETS: Record<string, Market> = {};
export const SELECTIONS: Record<string, Selection> = {};

for (const event of EVENTS) {
  const markets = buildMarkets(event);
  MARKETS_BY_EVENT[event.id] = markets;
  for (const mk of markets) {
    MARKETS[mk.id] = mk;
    for (const sel of mk.selections) SELECTIONS[sel.id] = sel;
  }
}

export function getMarkets(eventId: string): Market[] {
  return MARKETS_BY_EVENT[eventId] ?? [];
}

export function getResultMarket(eventId: string): Market {
  return MARKETS[`${eventId}:result`];
}

/** Number of markets beyond the headline result market. */
export function extraMarketCount(eventId: string): number {
  return Math.max(0, getMarkets(eventId).length - 1);
}
