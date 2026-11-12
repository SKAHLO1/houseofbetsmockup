'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { liveEvents } from '@/lib/data/events';
import { formatMoney } from '@/lib/format';
import { useSlip, useStore } from '@/lib/store';
import { Icon, type IconName } from '../ui/Icon';

/** Mobile-only: persistent bet slip bar stacked on the page tab bar. */
export function MobileBars() {
  const pathname = usePathname();
  const { state, dispatch } = useStore();
  const slip = useSlip();
  const count = slip.lines.length;
  const needsAttention = slip.blocker === 'odds-changed' || slip.blocker === 'suspended';

  const tabs: { href: string; label: string; icon: IconName; badge?: number }[] = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/live', label: 'Live', icon: 'live', badge: liveEvents().length },
    { href: '/football', label: 'Football', icon: 'football' },
    { href: '/bets', label: 'My bets', icon: 'slip' },
  ];

  return (
    <div className="mbars">
      {/* The Bets page already shows the slip in full, so the bar would only duplicate it. */}
      {pathname !== '/bets' && (
        <button
          type="button"
          className={`slipbar ${count > 0 ? 'has-picks' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={state.sheetOpen}
          onClick={() => dispatch({ type: 'set-sheet', open: true })}
        >
          <span className="slipbar__count">{count}</span>
          <span className="slipbar__label">
            Bet slip
            {needsAttention && <span className="slipbar__alert">{slip.blocker === 'suspended' ? 'Suspended' : 'Odds changed'}</span>}
          </span>
          <span className="slipbar__total">
            {/* Once staked, show what the slip could return: the number people actually care about */}
            {count === 0 ? 'No selections' : slip.totalStake > 0 ? `Returns ${formatMoney(slip.totalReturn)} USDT` : 'Add stake'}
          </span>
          <Icon name="chevron-down" size={16} className="slipbar__chev" />
        </button>
      )}
      <nav className="tabbar" aria-label="Pages">
        {tabs.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href} className="tabbar__link" aria-current={active ? 'page' : undefined}>
              <span className="tabbar__icon">
                <Icon name={tab.icon} size={20} />
                {tab.badge !== undefined && <span className="tabbar__badge">{tab.badge}</span>}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
