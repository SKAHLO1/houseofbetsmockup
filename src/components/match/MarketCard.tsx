'use client';

import { useId, useState } from 'react';
import { isSuspended, useStore } from '@/lib/store';
import type { Market } from '@/lib/types';
import { Icon } from '../ui/Icon';
import { OddsButton } from '../ui/OddsButton';

/** One collapsible market: a titled grid of selectable prices. */
export function MarketCard({ market }: { market: Market }) {
  const { state } = useStore();
  const [open, setOpen] = useState(true);
  const bodyId = useId();
  const suspended = isSuspended(state, market.id);

  return (
    <section className={`market ${suspended ? 'market--suspended' : ''}`} aria-label={market.name}>
      <h3 className="market__heading">
        <button type="button" className="market__toggle" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((v) => !v)}>
          <span className="market__name">{market.name}</span>
          {suspended && (
            <span className="tag tag--warn">
              <Icon name="lock" size={12} /> Suspended
            </span>
          )}
          <Icon name="chevron-down" size={16} className={`market__chev ${open ? '' : 'is-closed'}`} />
        </button>
      </h3>
      {open && (
        <div className={`market__grid market__grid--${market.cols}`} id={bodyId}>
          {market.selections.map((sel) => (
            <OddsButton key={sel.id} selectionId={sel.id} variant="inline" />
          ))}
        </div>
      )}
    </section>
  );
}
