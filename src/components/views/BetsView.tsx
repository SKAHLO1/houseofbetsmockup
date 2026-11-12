'use client';

import { useStore } from '@/lib/store';
import { BetSlip } from '../betting/BetSlip';
import { MyBets } from '../betting/MyBets';
import { Icon } from '../ui/Icon';
import { Tabs } from '../ui/Tabs';

/**
 * Bet slip and My Bets on one page: side by side on desktop,
 * switched with a tab strip on mobile.
 */
export function BetsView() {
  const { state, dispatch } = useStore();
  const openBets = state.bets.filter((b) => b.status === 'open').length;

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-head__title">
          <Icon name="slip" size={20} />
          Bet slip &amp; My bets
        </h1>
        <span className="page-head__meta">Singles only · stakes in USDT</span>
      </div>

      <div className="bets-switch">
        <Tabs
          label="Bet slip or my bets"
          value={state.panelTab}
          onChange={(tab) => dispatch({ type: 'set-panel-tab', tab })}
          tabs={[
            { id: 'slip', label: 'Bet slip', count: state.slip.length },
            { id: 'bets', label: 'My bets', count: openBets },
          ]}
        />
      </div>

      <div className={`bets-layout bets-layout--${state.panelTab}`}>
        <section className="bets-col bets-col--slip" aria-label="Bet slip">
          <h2 className="bets-col__title">
            Bet slip <span>{state.slip.length}</span>
          </h2>
          <BetSlip onViewBets={() => dispatch({ type: 'set-panel-tab', tab: 'bets' })} />
        </section>
        <section className="bets-col bets-col--bets" aria-label="My bets">
          <h2 className="bets-col__title">My bets</h2>
          <MyBets />
        </section>
      </div>
    </div>
  );
}
