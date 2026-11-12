'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SPORTS, TOP_COMPETITIONS } from '@/lib/data/catalog';
import { EVENTS, liveEvents } from '@/lib/data/events';
import { useStore } from '@/lib/store';
import type { SportId } from '@/lib/types';
import { Icon, type IconName } from '../ui/Icon';

/** Football has its own page; other sports open the home board filtered to that sport. */
export function sportHref(id: SportId): string {
  return id === 'football' ? '/football' : `/?sport=${id}`;
}

const RAIL_LABEL: Partial<Record<SportId, string>> = { 'american-football': 'NFL' };

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  active: boolean;
  badge?: number;
  live?: boolean;
  count?: number;
}

function useNavItems() {
  const pathname = usePathname();
  const activeSport = useSearchParams().get('sport');
  const { state } = useStore();

  const primary: NavItem[] = [
    { href: '/', label: 'Home', icon: 'home', active: pathname === '/' && !activeSport },
    { href: '/live', label: 'Live', icon: 'live', active: pathname === '/live', badge: liveEvents().length, live: true },
  ];
  const sports: NavItem[] = SPORTS.map((sport) => ({
    href: sportHref(sport.id),
    label: sport.name,
    icon: sport.id,
    active: sport.id === 'football' ? pathname === '/football' : pathname === '/' && activeSport === sport.id,
    count: EVENTS.filter((e) => e.sportId === sport.id).length,
  }));
  const bets: NavItem = {
    href: '/bets',
    label: 'My bets',
    icon: 'slip',
    active: pathname === '/bets',
    badge: state.slip.length || undefined,
  };
  return { primary, sports, bets, followed: state.followedCompetitions };
}

/** Desktop: a narrow icon rail so the board gets the width. */
function Rail() {
  const { primary, sports, bets } = useNavItems();

  const link = (item: NavItem, label = item.label) => (
    <li key={item.href}>
      <Link href={item.href} className="rail__link" aria-current={item.active ? 'page' : undefined} aria-label={item.label}>
        <Icon name={item.icon} size={22} />
        <span className="rail__label" aria-hidden="true">
          {label}
        </span>
        {item.badge !== undefined && (
          <span className={`rail__badge ${item.live ? 'rail__badge--live' : ''}`} aria-hidden="true">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );

  return (
    <nav className="rail" aria-label="Sports">
      <ul className="rail__list">{primary.map((item) => link(item))}</ul>
      <hr className="rail__sep" />
      <ul className="rail__list">
        {sports.map((item, i) => link(item, RAIL_LABEL[SPORTS[i].id] ?? item.label))}
      </ul>
      <hr className="rail__sep" />
      <ul className="rail__list">{link(bets)}</ul>
    </nav>
  );
}

/** Mobile drawer: the full list, including top competitions. */
function FullNav({ onNavigate }: { onNavigate?: () => void }) {
  const { primary, sports, bets, followed } = useNavItems();

  const link = (item: NavItem) => (
    <li key={item.href}>
      <Link href={item.href} className="sidenav__link" aria-current={item.active ? 'page' : undefined} onClick={onNavigate}>
        <Icon name={item.icon} />
        <span className="sidenav__label">{item.label}</span>
        {item.badge !== undefined && <span className={`sidenav__badge ${item.live ? 'sidenav__badge--live' : ''}`}>{item.badge}</span>}
        {item.count !== undefined && <span className="sidenav__count">{item.count}</span>}
      </Link>
    </li>
  );

  return (
    <nav className="sidenav" aria-label="Sports">
      <ul className="sidenav__list">
        {primary.map(link)}
        {link(bets)}
      </ul>
      <p className="sidenav__heading">Sports</p>
      <ul className="sidenav__list">{sports.map(link)}</ul>
      <p className="sidenav__heading">Top competitions</p>
      <ul className="sidenav__list">
        {TOP_COMPETITIONS.map((comp) => (
          <li key={comp.id}>
            <Link href={`/football#${comp.id}`} className="sidenav__link sidenav__link--plain" onClick={onNavigate}>
              <span className="sidenav__label">{comp.name}</span>
              {followed.includes(comp.id) && (
                <span className="sidenav__star">
                  <Icon name="star-filled" size={12} />
                  <span className="sr-only">Following</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Sidebar({ variant = 'rail', onNavigate }: { variant?: 'rail' | 'full'; onNavigate?: () => void }) {
  return variant === 'rail' ? <Rail /> : <FullNav onNavigate={onNavigate} />;
}
