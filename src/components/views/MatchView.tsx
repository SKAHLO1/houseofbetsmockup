'use client';

import { useEffect, useRef, useState } from 'react';
import { getTeam } from '@/lib/data/catalog';
import { getEvent } from '@/lib/data/events';
import { MARKET_GROUPS, getMarkets } from '@/lib/data/markets';
import { liveClock } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { MarketGroupId, SportEvent } from '@/lib/types';
import { MarketCard } from '../match/MarketCard';
import { Scoreboard } from '../match/Scoreboard';
import { Crest } from '../ui/Crest';
import { Tabs } from '../ui/Tabs';

/** Slim score line shown in the sticky market bar once the full scoreboard scrolls away. */
function MiniBoard({ event }: { event: SportEvent }) {
  const { state } = useStore();
  const home = getTeam(event.home);
  const away = getTeam(event.away);
  const live = event.status === 'live';

  return (
    <div className="mini-board" aria-hidden="true">
      <Crest teamId={home.id} size={16} />
      <span className="mini-board__team">{home.short}</span>
      <span className="mini-board__score">{live ? `${event.score?.[0]} – ${event.score?.[1]}` : event.time}</span>
      <span className="mini-board__team">{away.short}</span>
      <Crest teamId={away.id} size={16} />
      {live && (
        <span className="mini-board__clock">
          <span className="live-dot" />
          {liveClock(event, state.elapsed)}
        </span>
      )}
    </div>
  );
}

export function MatchView({ eventId, initialGroup }: { eventId: string; initialGroup?: MarketGroupId }) {
  const event = getEvent(eventId)!;
  const markets = getMarkets(eventId);
  const groups = MARKET_GROUPS.filter((g) => markets.some((m) => m.group === g.id));
  const [group, setGroup] = useState<MarketGroupId>(
    initialGroup && groups.some((g) => g.id === initialGroup) ? initialGroup : groups[0].id,
  );
  const shown = markets.filter((m) => m.group === group);

  // Show the mini board only while the full scoreboard is out of view.
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardHidden, setBoardHidden] = useState(false);
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head-h')) || 0;
    const observer = new IntersectionObserver(([entry]) => setBoardHidden(!entry.isIntersecting), {
      rootMargin: `-${head + 60}px 0px 0px 0px`,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page page--match">
      <div ref={boardRef}>
        <Scoreboard event={event} />
      </div>

      <div className={`market-nav ${boardHidden ? 'has-mini' : ''}`}>
        {boardHidden && <MiniBoard event={event} />}
        <Tabs
          label="Market groups"
          value={group}
          onChange={setGroup}
          tabs={groups.map((g) => ({ id: g.id, label: g.name, count: markets.filter((m) => m.group === g.id).length }))}
        />
      </div>

      <div className="markets" role="tabpanel" aria-label={groups.find((g) => g.id === group)?.name}>
        {shown.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      <p className="fineprint fineprint--page">
        Prototype prices. In-play odds move on a simulated feed; arrows mark a price that has just lengthened or shortened.
      </p>
    </div>
  );
}
