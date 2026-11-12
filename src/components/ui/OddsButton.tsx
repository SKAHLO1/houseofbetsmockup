'use client';

import type { CSSProperties } from 'react';
import { getEvent } from '@/lib/data/events';
import { MARKETS, SELECTIONS } from '@/lib/data/markets';
import { eventName, formatOdds } from '@/lib/format';
import { impliedChance, isSuspended, movementOf, priceOf, useStore } from '@/lib/store';
import { Icon } from './Icon';

interface Props {
  selectionId: string;
  /**
   * price   — price only, for aligned match-row columns
   * inline  — label left, price right, for market grids
   * stacked — label above price, for the featured match
   */
  variant?: 'price' | 'inline' | 'stacked';
  /** Short outcome key shown in the corner, e.g. 1 / X / 2. */
  outcomeKey?: string;
  /** Draw the implied-probability edge along the bottom. */
  showChance?: boolean;
  className?: string;
}

export function OddsButton({ selectionId, variant = 'price', outcomeKey, showChance = false, className = '' }: Props) {
  const { state, dispatch } = useStore();
  const selection = SELECTIONS[selectionId];
  const market = MARKETS[selection.marketId];
  const odds = priceOf(state, selectionId);
  const suspended = isSuspended(state, market.id);
  const selected = state.slip.some((i) => i.selectionId === selectionId);
  const move = suspended ? null : movementOf(state, selectionId);
  const chance = showChance && !suspended ? impliedChance(state, selectionId) : null;

  const event = getEvent(selection.eventId)!;
  const spoken = suspended
    ? `${selection.label}, ${market.name}, ${eventName(event)}: suspended`
    : `${selection.label}, ${market.name}, ${eventName(event)}: ${formatOdds(odds)}${
        move ? `, price ${move === 'up' ? 'lengthened' : 'shortened'}` : ''
      }`;

  return (
    <button
      type="button"
      className={`odds odds--${variant} ${selected ? 'is-selected' : ''} ${suspended ? 'is-suspended' : ''} ${className}`}
      aria-pressed={selected}
      aria-label={spoken}
      title={chance !== null ? `${selection.label} · ${chance}% implied chance` : undefined}
      style={chance !== null ? ({ '--chance': `${chance}%` } as CSSProperties) : undefined}
      // A selection already in the slip stays removable even if its market is suspended.
      disabled={suspended && !selected}
      onClick={() => dispatch({ type: 'toggle-selection', selectionId })}
    >
      {outcomeKey && (
        <span className="odds__key" aria-hidden="true">
          {outcomeKey}
        </span>
      )}
      {variant !== 'price' && <span className="odds__label">{selection.label}</span>}
      {suspended ? (
        <Icon name="lock" size={14} className="odds__lock" />
      ) : (
        <span className="odds__price">
          {move && <span className={`odds__move odds__move--${move}`} />}
          {/* Keyed on the price: a new number remounts and plays a one-off tint in its direction */}
          <span key={formatOdds(odds)} className={move ? `odds__num odds__num--${move}` : 'odds__num'}>
            {formatOdds(odds)}
          </span>
        </span>
      )}
      {chance !== null && <span className="odds__chance" aria-hidden="true" />}
    </button>
  );
}
