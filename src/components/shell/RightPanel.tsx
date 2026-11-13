'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCompetition, getTeam } from '@/lib/data/catalog';
import { formatMoney } from '@/lib/format';
import { useStore } from '@/lib/store';
import { BettingPanel } from '../betting/BettingPanel';
import { Crest } from '../ui/Crest';

/**
 * On the Bets page the slip lives in the main column, so the side panel
 * switches to account context instead of repeating it.
 */
function AccountPanel() {
  const { state } = useStore();
  const open = state.bets.filter((b) => b.status === 'open');
  const atStake = open.reduce((s, b) => s + b.stake, 0);
  const toReturn = open.reduce((s, b) => s + b.stake * b.odds, 0);

  return (
    <div className="account">
      <section aria-label="Demo wallet">
        <p className="account__heading">Demo wallet</p>
        <p className="account__balance">
          {formatMoney(state.balance)} <span>USDT</span>
        </p>
        <dl className="account__stats">
          <div>
            <dt>Open bets</dt>
            <dd>{open.length}</dd>
          </div>
          <div>
            <dt>At stake</dt>
            <dd>{formatMoney(atStake)}</dd>
          </div>
          <div>
            <dt>Potential returns</dt>
            <dd>{formatMoney(toReturn)}</dd>
          </div>
        </dl>
        <p className="fineprint">Prototype balance. No deposits, withdrawals or real stakes exist in this build.</p>
      </section>

      <section aria-label="Following">
        <p className="account__heading">Following</p>
        {state.followedCompetitions.length + state.followedTeams.length === 0 ? (
          <p className="account__none">
            Follow teams and competitions on the <Link href="/football">Football</Link> page.
          </p>
        ) : (
          <ul className="account__follows">
            {state.followedCompetitions.map((id) => (
              <li key={id}>
                <Link href={`/league/${id}`}>{getCompetition(id).name}</Link>
              </li>
            ))}
            {state.followedTeams.map((id) => (
              <li key={id}>
                <Crest teamId={id} size={16} />
                <Link href="/football">{getTeam(id).name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function RightPanel() {
  const pathname = usePathname();
  return pathname === '/bets' ? <AccountPanel /> : <BettingPanel />;
}
