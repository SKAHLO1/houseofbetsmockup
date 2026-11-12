'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { getCompetition } from './data/catalog';
import { DEMO_BALANCE, MAX_STAKE, MIN_STAKE, SEED_BETS } from './data/bets';
import { EVENTS, getEvent } from './data/events';
import { MARKETS, SELECTIONS, getResultMarket, snapOdds } from './data/markets';
import { eventName, formatMoney } from './format';
import type { Bet, Market, Selection, SportEvent } from './types';

/* ---------- state ---------- */

interface PriceOverride {
  odds: number;
  prev: number;
  /** Feed tick on which the price last moved. */
  at: number;
}

export interface SlipItem {
  selectionId: string;
  /** The price the player has seen and agreed to. */
  acceptedOdds: number;
  stake: string;
}

export type Placement =
  | { status: 'idle' }
  | { status: 'placing' }
  | { status: 'success'; receipt: Bet[] }
  | { status: 'failed' };

export type PanelTab = 'slip' | 'bets';

interface State {
  prices: Record<string, PriceOverride>;
  suspended: Record<string, boolean>;
  feedTick: number;
  feedOn: boolean;
  /** Minutes elapsed since the prototype loaded; advances live clocks. */
  elapsed: number;
  slip: SlipItem[];
  placement: Placement;
  failNext: boolean;
  bets: Bet[];
  balance: number;
  nextRef: number;
  followedTeams: string[];
  followedCompetitions: string[];
  panelTab: PanelTab;
  sheetOpen: boolean;
}

type Action =
  | { type: 'toggle-selection'; selectionId: string }
  | { type: 'remove-selection'; selectionId: string }
  | { type: 'clear-slip' }
  | { type: 'set-stake'; selectionId: string; stake: string }
  | { type: 'accept-odds' }
  | { type: 'move-odds'; moves: { selectionId: string; odds: number }[]; tick?: boolean }
  | { type: 'set-suspended'; marketId: string; suspended: boolean }
  | { type: 'minute' }
  | { type: 'set-feed'; on: boolean }
  | { type: 'set-fail-next'; fail: boolean }
  | { type: 'place-start' }
  | { type: 'place-success' }
  | { type: 'place-fail' }
  | { type: 'dismiss-placement' }
  | { type: 'cash-out'; betId: string }
  | { type: 'toggle-follow-team'; teamId: string }
  | { type: 'toggle-follow-competition'; competitionId: string }
  | { type: 'set-panel-tab'; tab: PanelTab }
  | { type: 'set-sheet'; open: boolean };

function initialState(): State {
  const prices: Record<string, PriceOverride> = {};
  for (const sel of Object.values(SELECTIONS)) {
    if (sel.prev !== undefined) prices[sel.id] = { odds: sel.odds, prev: sel.prev, at: 0 };
  }
  return {
    prices,
    suspended: {},
    feedTick: 0,
    feedOn: true,
    elapsed: 0,
    slip: [],
    placement: { status: 'idle' },
    failNext: false,
    bets: SEED_BETS,
    balance: DEMO_BALANCE,
    nextRef: 48214,
    followedTeams: ['arsenal'],
    followedCompetitions: ['premier-league'],
    panelTab: 'slip',
    sheetOpen: false,
  };
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/* ---------- selectors ---------- */

export function priceOf(state: State, selectionId: string): number {
  return state.prices[selectionId]?.odds ?? SELECTIONS[selectionId].odds;
}

export function isSuspended(state: State, marketId: string): boolean {
  return state.suspended[marketId] ?? MARKETS[marketId].suspended ?? false;
}

/** Bookmaker-implied chance for one outcome, normalised across its market (margin removed). */
export function impliedChance(state: State, selectionId: string): number {
  const market = MARKETS[SELECTIONS[selectionId].marketId];
  const total = market.selections.reduce((sum, s) => sum + 1 / priceOf(state, s.id), 0);
  return Math.round((1 / priceOf(state, selectionId) / total) * 100);
}

/** Direction of a recent price move; indicators expire after a few feed ticks. */
export function movementOf(state: State, selectionId: string): 'up' | 'down' | null {
  const p = state.prices[selectionId];
  if (!p || p.odds === p.prev || state.feedTick - p.at > 2) return null;
  return p.odds > p.prev ? 'up' : 'down';
}

export type StakeError = 'empty' | 'min' | 'max' | null;

export function stakeError(stake: string): StakeError {
  if (stake.trim() === '') return 'empty';
  const value = Number(stake);
  if (!Number.isFinite(value) || value < MIN_STAKE) return 'min';
  if (value > MAX_STAKE) return 'max';
  return null;
}

export interface SlipLine {
  item: SlipItem;
  selection: Selection;
  market: Market;
  event: SportEvent;
  odds: number;
  oddsChanged: boolean;
  suspended: boolean;
  stake: number;
  stakeError: StakeError;
  potentialReturn: number;
  potentialProfit: number;
}

export function slipLines(state: State): SlipLine[] {
  return state.slip.map((item) => {
    const selection = SELECTIONS[item.selectionId];
    const market = MARKETS[selection.marketId];
    const event = getEvent(selection.eventId)!;
    const odds = priceOf(state, item.selectionId);
    const error = stakeError(item.stake);
    const stake = error === 'empty' ? 0 : Number(item.stake) || 0;
    // Potential Return = Stake × Decimal Odds; Potential Profit = Return − Stake.
    const potentialReturn = Math.round(stake * odds * 100) / 100;
    return {
      item,
      selection,
      market,
      event,
      odds,
      oddsChanged: odds !== item.acceptedOdds,
      suspended: isSuspended(state, market.id),
      stake,
      stakeError: error,
      potentialReturn,
      potentialProfit: Math.round((potentialReturn - stake) * 100) / 100,
    };
  });
}

/* ---------- reducer ---------- */

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle-selection': {
      const market = MARKETS[SELECTIONS[action.selectionId].marketId];
      const existing = state.slip.some((i) => i.selectionId === action.selectionId);
      if (existing) return { ...state, slip: state.slip.filter((i) => i.selectionId !== action.selectionId) };
      if (isSuspended(state, market.id)) return state;
      // Singles only: a second pick from the same market replaces the first.
      const slip = state.slip.filter((i) => SELECTIONS[i.selectionId].marketId !== market.id);
      return {
        ...state,
        slip: [...slip, { selectionId: action.selectionId, acceptedOdds: priceOf(state, action.selectionId), stake: '' }],
        placement: { status: 'idle' },
        panelTab: 'slip',
      };
    }
    case 'remove-selection':
      return { ...state, slip: state.slip.filter((i) => i.selectionId !== action.selectionId) };
    case 'clear-slip':
      return { ...state, slip: [], placement: { status: 'idle' } };
    case 'set-stake':
      return {
        ...state,
        slip: state.slip.map((i) => (i.selectionId === action.selectionId ? { ...i, stake: action.stake } : i)),
      };
    case 'accept-odds':
      return { ...state, slip: state.slip.map((i) => ({ ...i, acceptedOdds: priceOf(state, i.selectionId) })) };
    case 'move-odds': {
      const feedTick = action.tick ? state.feedTick + 1 : state.feedTick;
      const prices = { ...state.prices };
      for (const move of action.moves) {
        const current = priceOf(state, move.selectionId);
        if (move.odds !== current) prices[move.selectionId] = { odds: move.odds, prev: current, at: feedTick };
      }
      return { ...state, prices, feedTick };
    }
    case 'set-suspended':
      return { ...state, suspended: { ...state.suspended, [action.marketId]: action.suspended } };
    case 'minute':
      return { ...state, elapsed: state.elapsed + 1 };
    case 'set-feed':
      return { ...state, feedOn: action.on };
    case 'set-fail-next':
      return { ...state, failNext: action.fail };
    case 'place-start':
      return { ...state, placement: { status: 'placing' } };
    case 'place-fail':
      return { ...state, placement: { status: 'failed' }, failNext: false };
    case 'place-success': {
      const lines = slipLines(state);
      const receipt: Bet[] = lines.map((line, i) => ({
        id: `HB-${state.nextRef + i}`,
        eventId: line.event.id,
        match: eventName(line.event),
        competition: getCompetition(line.event.competitionId).name,
        market: line.market.name,
        selection: line.selection.label,
        odds: line.odds,
        stake: line.stake,
        status: 'open',
        placed: 'Just now',
      }));
      const staked = lines.reduce((sum, l) => sum + l.stake, 0);
      return {
        ...state,
        slip: [],
        bets: [...receipt, ...state.bets],
        balance: Math.round((state.balance - staked) * 100) / 100,
        nextRef: state.nextRef + lines.length,
        placement: { status: 'success', receipt },
      };
    }
    case 'dismiss-placement':
      return { ...state, placement: { status: 'idle' } };
    case 'cash-out': {
      const bet = state.bets.find((b) => b.id === action.betId);
      if (!bet || bet.status !== 'open' || bet.cashOutOffer === undefined) return state;
      return {
        ...state,
        balance: Math.round((state.balance + bet.cashOutOffer) * 100) / 100,
        bets: state.bets.map((b) =>
          b.id === bet.id ? { ...b, status: 'cashed-out', returned: bet.cashOutOffer, cashOutOffer: undefined } : b,
        ),
      };
    }
    case 'toggle-follow-team':
      return { ...state, followedTeams: toggle(state.followedTeams, action.teamId) };
    case 'toggle-follow-competition':
      return { ...state, followedCompetitions: toggle(state.followedCompetitions, action.competitionId) };
    case 'set-panel-tab':
      return { ...state, panelTab: action.tab };
    case 'set-sheet':
      return { ...state, sheetOpen: action.open };
  }
}

/* ---------- provider ---------- */

interface Store {
  state: State;
  dispatch: (action: Action) => void;
  /** Runs the simulated placement round-trip. */
  placeBets: () => void;
  /** Prototype control: nudges one selection's price up or down. */
  nudgeOdds: (selectionId: string) => void;
}

const StoreContext = createContext<Store | null>(null);

const FEED_INTERVAL_MS = 9000;
const PLACEMENT_DELAY_MS = 1100;

function nudged(odds: number, direction: 1 | -1): number {
  const next = snapOdds(odds * (1 + direction * (0.03 + Math.random() * 0.05)));
  if (next !== odds) return next;
  return snapOdds(odds + direction * 0.02);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Simulated live price feed: every tick, a couple of in-play match-result prices drift.
  useEffect(() => {
    if (!state.feedOn) return;
    const id = window.setInterval(() => {
      const current = stateRef.current;
      const candidates = EVENTS.filter((e) => e.status === 'live')
        .map((e) => getResultMarket(e.id))
        .filter((mk) => !isSuspended(current, mk.id));
      const moves = [];
      for (let i = 0; i < 2 && candidates.length > 0; i++) {
        const mk = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
        const sel = mk.selections[Math.floor(Math.random() * mk.selections.length)];
        moves.push({ selectionId: sel.id, odds: nudged(priceOf(current, sel.id), Math.random() > 0.5 ? 1 : -1) });
      }
      dispatch({ type: 'move-odds', moves, tick: true });
    }, FEED_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [state.feedOn]);

  useEffect(() => {
    const id = window.setInterval(() => dispatch({ type: 'minute' }), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const placeBets = useCallback(() => {
    if (stateRef.current.placement.status === 'placing') return;
    dispatch({ type: 'place-start' });
    window.setTimeout(() => {
      dispatch({ type: stateRef.current.failNext ? 'place-fail' : 'place-success' });
    }, PLACEMENT_DELAY_MS);
  }, []);

  const nudgeOdds = useCallback((selectionId: string) => {
    const odds = priceOf(stateRef.current, selectionId);
    dispatch({ type: 'move-odds', moves: [{ selectionId, odds: nudged(odds, Math.random() > 0.5 ? 1 : -1) }] });
  }, []);

  const store = useMemo(() => ({ state, dispatch, placeBets, nudgeOdds }), [state, placeBets, nudgeOdds]);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}

/* ---------- slip summary ---------- */

export interface SlipSummary {
  lines: SlipLine[];
  totalStake: number;
  totalReturn: number;
  /** Why the slip cannot be placed yet, or null when it is ready. */
  blocker: 'empty' | 'suspended' | 'odds-changed' | 'stake' | 'balance' | null;
  message: string | null;
}

export function useSlip(): SlipSummary {
  const { state } = useStore();
  return useMemo(() => {
    const lines = slipLines(state);
    const totalStake = Math.round(lines.reduce((s, l) => s + l.stake, 0) * 100) / 100;
    const totalReturn = Math.round(lines.reduce((s, l) => s + l.potentialReturn, 0) * 100) / 100;
    let blocker: SlipSummary['blocker'] = null;
    let message: string | null = null;
    if (lines.length === 0) blocker = 'empty';
    else if (lines.some((l) => l.suspended)) {
      blocker = 'suspended';
      message = 'Remove the suspended selection, or wait for the market to reopen.';
    } else if (lines.some((l) => l.oddsChanged)) {
      blocker = 'odds-changed';
      message = 'Prices have changed since you added these selections.';
    } else if (lines.some((l) => l.stakeError)) {
      blocker = 'stake';
      message = lines.some((l) => l.stakeError && l.stakeError !== 'empty')
        ? 'Fix the highlighted stake to continue.'
        : 'Enter a stake for each selection.';
    } else if (totalStake > state.balance) {
      blocker = 'balance';
      message = `Total stake exceeds your demo balance of ${formatMoney(state.balance)} USDT.`;
    }
    return { lines, totalStake, totalReturn, blocker, message };
  }, [state]);
}
