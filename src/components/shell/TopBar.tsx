'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatMoney } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { SearchBox } from './SearchBox';

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { state } = useStore();
  const [searching, setSearching] = useState(false);

  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" aria-label="Open sports menu" onClick={onMenu}>
        <Icon name="menu" size={20} />
      </button>

      <Link href="/" className="topbar__logo" aria-label="Housebets — sports home">
        <Logo />
      </Link>

      <div className="topbar__search">
        <SearchBox />
      </div>

      <div className="topbar__end">
        <button type="button" className="icon-btn topbar__search-btn" aria-label="Search" onClick={() => setSearching(true)}>
          <Icon name="search" size={20} />
        </button>
        <Link href="/bets" className="wallet" aria-label={`Demo balance ${formatMoney(state.balance)} USDT. Open bets page`}>
          <span className="wallet__tag">Demo</span>
          <span className="wallet__amount">{formatMoney(state.balance)}</span>
          <span className="wallet__unit">USDT</span>
        </Link>
      </div>

      {searching && (
        <div className="topbar__overlay" role="dialog" aria-modal="true" aria-label="Search">
          <SearchBox autoFocus onClose={() => setSearching(false)} />
          <button type="button" className="link-btn" onClick={() => setSearching(false)}>
            Cancel
          </button>
        </div>
      )}
    </header>
  );
}
