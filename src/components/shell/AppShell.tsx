'use client';

import { usePathname } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { BettingPanel } from '../betting/BettingPanel';
import { Drawer } from './Drawer';
import { LiveTicker } from './LiveTicker';
import { MobileBars } from './MobileBars';
import { RightPanel } from './RightPanel';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, dispatch } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeSheet = useCallback(() => dispatch({ type: 'set-sheet', open: false }), [dispatch]);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Any navigation dismisses open overlays.
  useEffect(() => {
    closeSheet();
    setMenuOpen(false);
  }, [pathname, closeSheet]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="shell">
        <div className="shell__head">
          <TopBar onMenu={() => setMenuOpen(true)} />
          <LiveTicker />
        </div>
        {/* Wide desktop gets the labelled sidebar; narrow desktop folds to the icon rail (CSS picks one). */}
        <aside className="shell__nav">
          <Suspense fallback={null}>
            <div className="shell__nav-full">
              <Sidebar variant="full" />
            </div>
            <div className="shell__nav-rail">
              <Sidebar />
            </div>
          </Suspense>
        </aside>
        <main id="main" className="shell__main" tabIndex={-1}>
          {children}
        </main>
        <aside className="shell__panel" aria-label={pathname === '/bets' ? 'Account' : 'Bet slip and my bets'}>
          <RightPanel />
        </aside>
      </div>

      <MobileBars />

      <Drawer open={state.sheetOpen} onClose={closeSheet} title="Bet slip" side="bottom">
        <BettingPanel />
      </Drawer>

      <Drawer open={menuOpen} onClose={closeMenu} title="Sports menu" side="left">
        <Suspense fallback={null}>
          <Sidebar variant="full" onNavigate={closeMenu} />
        </Suspense>
      </Drawer>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}
