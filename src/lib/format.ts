import { getTeam } from './data/catalog';
import type { SportEvent } from './types';

export const formatOdds = (odds: number) => odds.toFixed(2);

export const formatMoney = (amount: number) =>
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function eventName(event: SportEvent): string {
  return `${getTeam(event.home).short} v ${getTeam(event.away).short}`;
}

export function startsInLabel(inMin?: number): string | null {
  if (inMin === undefined || inMin > 90) return null;
  return `in ${inMin} min`;
}

/** Live clock text. Football minutes advance with the prototype clock. */
export function liveClock(event: SportEvent, elapsed: number): string {
  if (event.minute !== undefined) return `${Math.min(90, event.minute + elapsed)}'`;
  return event.period ?? 'Live';
}

/** Keeps a stake field to digits with at most two decimals. */
export function sanitiseStake(raw: string): string {
  const cleaned = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole.slice(0, 7);
  return `${whole.slice(0, 7)}.${rest.join('').slice(0, 2)}`;
}
