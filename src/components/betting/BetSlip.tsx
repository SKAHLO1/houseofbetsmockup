'use client';

import { formatMoney, formatOdds } from '@/lib/format';
import { useSlip, useStore, type SlipLine } from '@/lib/store';
import type { Bet } from '@/lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Icon } from '../ui/Icon';
import { PrototypeControls } from './PrototypeControls';
import { SlipPick } from './SlipPick';
import { StakeInput } from './StakeInput';

function Receipt({ receipt, onViewBets }: { receipt: Bet[]; onViewBets: () => void }) {
  const { dispatch } = useStore();
  const staked = receipt.reduce((s, b) => s + b.stake, 0);
  return (
    <div className="receipt" role="status">
      <div className="receipt__head">
        <span className="receipt__mark">
          <Icon name="check" size={18} />
        </span>
        <div>
          <p className="receipt__title">{receipt.length === 1 ? 'Bet placed' : `${receipt.length} bets placed`}</p>
          <p className="receipt__sub">{formatMoney(staked)} USDT staked from your demo balance</p>
        </div>
      </div>
      <ul className="receipt__list">
        {receipt.map((bet) => (
          <li key={bet.id} className="receipt__item">
            <div>
              <span className="receipt__selection">{bet.selection}</span>
              <span className="receipt__meta">
                {bet.market} · {bet.match}
              </span>
              <span className="receipt__meta">Ref {bet.id}</span>
            </div>
            <div className="receipt__figures">
              <span>
                {formatMoney(bet.stake)} @ {formatOdds(bet.odds)}
              </span>
              <span className="receipt__return">Returns {formatMoney(Math.round(bet.stake * bet.odds * 100) / 100)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="receipt__actions">
        <button type="button" className="btn btn--secondary" onClick={onViewBets}>
          View open bets
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'dismiss-placement' })}>
          Done
        </button>
      </div>
      <p className="fineprint">Prototype only. No real funds were staked.</p>
    </div>
  );
}

export function BetSlip({ onViewBets }: { onViewBets: () => void }) {
  const { state, dispatch, placeBets } = useStore();
  const slip = useSlip();
  const { placement } = state;
  const placing = placement.status === 'placing';
  const count = slip.lines.length;

  if (placement.status === 'success') {
    return (
      <div className="slip">
        <Receipt
          receipt={placement.receipt}
          onViewBets={() => {
            dispatch({ type: 'dismiss-placement' });
            onViewBets();
          }}
        />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="slip">
        <EmptyState icon="slip" title="Your bet slip is empty">
          Select any price to add it here. Each selection is placed as its own single bet.
        </EmptyState>
        <PrototypeControls lines={[]} />
      </div>
    );
  }

  const needsAcceptance = slip.blocker === 'odds-changed';

  return (
    <div className="slip">
      {placement.status === 'failed' && (
        <div className="banner banner--error" role="alert">
          <Icon name="alert" size={18} />
          <div>
            <p className="banner__title">Bet not placed</p>
            <p className="banner__text">
              We couldn’t confirm your {count === 1 ? 'bet' : 'bets'} and nothing was staked. Your selections are still here — try
              again.
            </p>
          </div>
          <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => dispatch({ type: 'dismiss-placement' })}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <div className="slip__bar">
        <span>
          {count} {count === 1 ? 'single' : 'singles'}
        </span>
        <button type="button" className="link-btn" disabled={placing} onClick={() => dispatch({ type: 'clear-slip' })}>
          Clear all
        </button>
      </div>

      {count > 1 && <StakeAll lines={slip.lines} locked={placing} />}

      <ul className="slip__list">
        {slip.lines.map((line) => (
          <SlipPick key={line.selection.id} line={line} locked={placing} />
        ))}
      </ul>

      <div className="slip__foot">
        <dl className="slip__totals">
          <div>
            <dt>Total stake</dt>
            <dd>{formatMoney(slip.totalStake)} USDT</dd>
          </div>
          <div className="slip__totals-return">
            <dt>Potential return</dt>
            <dd>{formatMoney(slip.totalReturn)} USDT</dd>
          </div>
        </dl>

        {slip.message && (
          <p className={`slip__message slip__message--${slip.blocker}`} role="status">
            {slip.message}
          </p>
        )}

        {needsAcceptance ? (
          <button type="button" className="btn btn--warn btn--block" onClick={() => dispatch({ type: 'accept-odds' })}>
            Accept new odds
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={slip.blocker !== null || placing}
            onClick={placeBets}
          >
            {placing ? (
              <>
                <span className="spinner" aria-hidden="true" /> Placing…
              </>
            ) : (
              <>
                <span>{failedLabel(placement.status, count)}</span>
                {slip.totalStake > 0 && <span className="btn__amount">{formatMoney(slip.totalStake)} USDT</span>}
              </>
            )}
          </button>
        )}
        <p className="fineprint">Prototype only. No real funds are staked.</p>
      </div>

      <PrototypeControls lines={slip.lines} />
    </div>
  );
}

/**
 * One stake applied to every open single. Shows the shared value while all
 * picks agree; once a pick is edited on its own the field reads empty again.
 */
function StakeAll({ lines, locked }: { lines: SlipLine[]; locked: boolean }) {
  const { dispatch } = useStore();
  const open = lines.filter((l) => !l.suspended);
  const shared = open.length > 0 && open.every((l) => l.item.stake === open[0].item.stake) ? open[0].item.stake : '';

  return (
    <div className="stake-all">
      <p className="stake-all__title">Same stake on every single</p>
      <StakeInput
        value={shared}
        error={null}
        disabled={locked || open.length === 0}
        label="all selections"
        onChange={(stake) => open.forEach((l) => dispatch({ type: 'set-stake', selectionId: l.item.selectionId, stake }))}
      />
    </div>
  );
}

function failedLabel(status: string, count: number): string {
  const noun = count === 1 ? 'bet' : `${count} bets`;
  return status === 'failed' ? `Try again — place ${noun}` : `Place ${noun}`;
}
