'use client';

import Link from 'next/link';
import { eventName, formatMoney, formatOdds } from '@/lib/format';
import { useStore, type SlipLine } from '@/lib/store';
import { Icon } from '../ui/Icon';
import { StakeInput } from './StakeInput';

/** One single bet in the slip: selection, price, stake and its own returns. */
export function SlipPick({ line, locked }: { line: SlipLine; locked: boolean }) {
  const { dispatch } = useStore();
  const { selection, market, event, item } = line;
  const drift = line.odds > item.acceptedOdds ? 'up' : 'down';

  return (
    <li className={`pick ${line.suspended ? 'pick--suspended' : ''} ${line.oddsChanged && !line.suspended ? 'pick--changed' : ''}`}>
      <div className="pick__head">
        <div className="pick__what">
          <span className="pick__selection">{selection.label}</span>
          <span className="pick__market">{market.name}</span>
          <Link href={`/match/${event.id}`} className="pick__match">
            {event.status === 'live' && <span className="live-dot" aria-hidden="true" />}
            {eventName(event)}
          </Link>
        </div>
        <div className="pick__price">
          {line.suspended ? (
            <span className="tag tag--warn">
              <Icon name="lock" size={12} /> Suspended
            </span>
          ) : (
            <span className="pick__odds">{formatOdds(line.odds)}</span>
          )}
        </div>
        <button
          type="button"
          className="icon-btn pick__remove"
          aria-label={`Remove ${selection.label}, ${eventName(event)}`}
          disabled={locked}
          onClick={() => dispatch({ type: 'remove-selection', selectionId: item.selectionId })}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {line.suspended && (
        <p className="pick__notice pick__notice--warn" role="status">
          This market is suspended. The bet can’t be placed until it reopens — keep it and wait, or remove it.
        </p>
      )}

      {line.oddsChanged && !line.suspended && (
        <p className="pick__notice pick__notice--change" role="status">
          <span className={`odds__move odds__move--${drift}`} aria-hidden="true" />
          Odds changed
          <s>{formatOdds(item.acceptedOdds)}</s>
          <span aria-hidden="true">→</span>
          <strong>{formatOdds(line.odds)}</strong>
        </p>
      )}

      <div className="pick__perf" aria-hidden="true" />

      <StakeInput
        value={item.stake}
        error={line.stakeError}
        disabled={locked || line.suspended}
        label={`${selection.label}, ${eventName(event)}`}
        onChange={(stake) => dispatch({ type: 'set-stake', selectionId: item.selectionId, stake })}
      />

      <dl className="pick__returns">
        <div>
          <dt>Potential return</dt>
          <dd>{formatMoney(line.potentialReturn)} USDT</dd>
        </div>
        <div>
          <dt>Profit</dt>
          <dd>{formatMoney(line.potentialProfit)}</dd>
        </div>
      </dl>
    </li>
  );
}
