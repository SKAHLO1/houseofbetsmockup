'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatMoney, formatOdds } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { Bet, BetStatus } from '@/lib/types';

const STATUS: Record<BetStatus, { label: string; tone: string }> = {
  open: { label: 'Open', tone: 'info' },
  won: { label: 'Won', tone: 'win' },
  lost: { label: 'Lost', tone: 'muted' },
  'cashed-out': { label: 'Cashed out', tone: 'warn' },
};

export function BetCard({ bet, cashOut = false }: { bet: Bet; cashOut?: boolean }) {
  const { dispatch } = useStore();
  const [confirming, setConfirming] = useState(false);
  const status = STATUS[bet.status];
  const potential = Math.round(bet.stake * bet.odds * 100) / 100;
  const settled = bet.status !== 'open';

  return (
    <li className={`bet bet--${bet.status}`}>
      <div className="bet__head">
        <div className="bet__what">
          <span className="bet__selection">{bet.selection}</span>
          <span className="bet__market">{bet.market}</span>
          {bet.eventId ? (
            <Link href={`/match/${bet.eventId}`} className="bet__match">
              {bet.match}
            </Link>
          ) : (
            <span className="bet__match">{bet.match}</span>
          )}
        </div>
        <span className={`tag tag--${status.tone}`}>{status.label}</span>
      </div>

      <dl className="bet__figures">
        <div>
          <dt>Stake</dt>
          <dd>{formatMoney(bet.stake)}</dd>
        </div>
        <div>
          <dt>Odds</dt>
          <dd>{formatOdds(bet.odds)}</dd>
        </div>
        <div>
          <dt>{settled ? 'Returned' : 'Potential return'}</dt>
          <dd className={bet.status === 'won' ? 'is-win' : ''}>{formatMoney(settled ? bet.returned ?? 0 : potential)}</dd>
        </div>
      </dl>

      <p className="bet__ref">
        {bet.competition} · {bet.placed} · Ref {bet.id} · USDT
      </p>

      {cashOut && bet.cashOutOffer !== undefined && (
        <div className="bet__cashout">
          {confirming ? (
            <>
              <p className="bet__cashout-text">
                Settle this bet now for <strong>{formatMoney(bet.cashOutOffer)} USDT</strong>?
              </p>
              <div className="bet__cashout-actions">
                <button type="button" className="btn btn--warn" onClick={() => dispatch({ type: 'cash-out', betId: bet.id })}>
                  Confirm cash out
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
                  Keep bet
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn btn--secondary btn--block" onClick={() => setConfirming(true)}>
              Cash out {formatMoney(bet.cashOutOffer)} USDT
            </button>
          )}
          <p className="fineprint">Illustrative prototype value — not a live cash-out price.</p>
        </div>
      )}
    </li>
  );
}
