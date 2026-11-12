'use client';

import Link from 'next/link';
import { getTeam } from '@/lib/data/catalog';
import { eventName, formatMoney, formatOdds, liveClock } from '@/lib/format';
import { useStore, type SlipLine } from '@/lib/store';
import { Icon } from '../ui/Icon';
import { StakeInput } from './StakeInput';

/** One single bet in the slip: selection, price, stake and its own returns. */
export function SlipPick({ line, locked }: { line: SlipLine; locked: boolean }) {
  const { state, dispatch } = useStore();
  const { selection, market, event, item } = line;
  const live = event.status === 'live';
  const home = getTeam(event.home);
  const away = getTeam(event.away);
  // Football minutes advance with the prototype clock; other sports show their period ("Q3 4:12", "2nd set", "Map 2").
  const clock = liveClock(event, state.elapsed);
  const drift = line.odds > item.acceptedOdds ? 'up' : 'down';

  return (
    <li className={`pick ${line.suspended ? 'pick--suspended' : ''} ${line.oddsChanged && !line.suspended ? 'pick--changed' : ''}`}>
      <div className="pick__head">
        <div className="pick__what">
          <span className="pick__selection">{selection.label}</span>
          <span className="pick__market">{market.name}</span>
          {live ? (
            /* In play: current score and clock, so the pick is judged against the match as it stands */
            <Link
              href={`/match/${event.id}`}
              className="pick__match pick__match--live"
              aria-label={`Live: ${home.short} ${event.score?.[0]}, ${away.short} ${event.score?.[1]}, ${clock}${
                event.scoreDetail ? `, ${event.scoreDetail}` : ''
              }. Open match`}
            >
              <span className="pick__clock">
                <span className="live-dot" aria-hidden="true" />
                {clock}
              </span>
              <span className="pick__scoreline">
                {home.short}
                <b>
                  {event.score?.[0]}–{event.score?.[1]}
                </b>
                {away.short}
              </span>
              {event.scoreDetail && <span className="pick__detail">{event.scoreDetail}</span>}
            </Link>
          ) : (
            <Link href={`/match/${event.id}`} className="pick__match">
              {eventName(event)}
            </Link>
          )}
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
