'use client';

import { useStore } from '@/lib/store';
import { Tabs } from '../ui/Tabs';
import { BetSlip } from './BetSlip';
import { MyBets } from './MyBets';

/** Bet slip and My Bets behind one switch. Used by the desktop side panel and the mobile sheet. */
export function BettingPanel() {
  const { state, dispatch } = useStore();
  const openBets = state.bets.filter((b) => b.status === 'open').length;

  return (
    <div className="bpanel">
      <Tabs
        label="Betting"
        value={state.panelTab}
        onChange={(tab) => dispatch({ type: 'set-panel-tab', tab })}
        tabs={[
          { id: 'slip', label: 'Bet slip', count: state.slip.length },
          { id: 'bets', label: 'My bets', count: openBets },
        ]}
      />
      <div className="bpanel__body">
        {state.panelTab === 'slip' ? <BetSlip onViewBets={() => dispatch({ type: 'set-panel-tab', tab: 'bets' })} /> : <MyBets />}
      </div>
    </div>
  );
}
