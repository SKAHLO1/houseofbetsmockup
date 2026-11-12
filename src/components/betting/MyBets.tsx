'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { EmptyState } from '../ui/EmptyState';
import { Tabs } from '../ui/Tabs';
import { BetCard } from './BetCard';

type View = 'open' | 'settled' | 'cash-out';

const EMPTY: Record<View, { title: string; text: string }> = {
  open: { title: 'No open bets', text: 'Bets you place will appear here until they settle.' },
  settled: { title: 'No settled bets yet', text: 'Won, lost and cashed-out bets are listed here.' },
  'cash-out': { title: 'Nothing to cash out', text: 'Cash out is offered on selected open bets only.' },
};

export function MyBets() {
  const { state } = useStore();
  const [view, setView] = useState<View>('open');

  const open = state.bets.filter((b) => b.status === 'open');
  const settled = state.bets.filter((b) => b.status !== 'open');
  const cashable = open.filter((b) => b.cashOutOffer !== undefined);
  const bets = view === 'open' ? open : view === 'settled' ? settled : cashable;

  return (
    <div className="mybets">
      <Tabs
        label="Bet history"
        variant="segmented"
        value={view}
        onChange={setView}
        tabs={[
          { id: 'open', label: 'Open', count: open.length },
          { id: 'settled', label: 'Settled', count: settled.length },
          { id: 'cash-out', label: 'Cash Out', count: cashable.length },
        ]}
      />
      {bets.length === 0 ? (
        <EmptyState icon="slip" title={EMPTY[view].title}>
          {EMPTY[view].text}
        </EmptyState>
      ) : (
        <ul className="mybets__list">
          {bets.map((bet) => (
            <BetCard key={bet.id} bet={bet} cashOut={view === 'cash-out'} />
          ))}
        </ul>
      )}
    </div>
  );
}
