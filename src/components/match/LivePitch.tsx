'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { getTeam } from '@/lib/data/catalog';
import {
  PITCH_H,
  PITCH_W,
  initialSim,
  possessionPct,
  shortName,
  step,
  zoneOf,
  type Side,
  type SimState,
} from '@/lib/sim/matchSim';
import { useStore } from '@/lib/store';
import type { SportEvent, Team } from '@/lib/types';
import { Icon } from '../ui/Icon';

const TICK_MS = 1500;

/** Relative luminance of a #rrggbb colour, 0–1. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * A team's marker colour that stays visible on the dark pitch
 * (falls back to the second kit colour when the first is near-black),
 * plus a text colour that reads on it.
 */
function kit(team: Team): { bg: string; fg: string } {
  const bg = luminance(team.colors[0]) < 0.04 ? team.colors[1] : team.colors[0];
  return { bg, fg: luminance(bg) > 0.45 ? '#03262c' : '#ffffff' };
}

const ZONE_LABEL = { safe: 'In possession', attack: 'Attack', danger: 'Dangerous attack' } as const;

/** Static pitch markings, drawn to scale in metres. */
function Markings() {
  const stripes = Array.from({ length: 10 }, (_, i) => i);
  return (
    <>
      {stripes.map((i) => (
        <rect key={i} x={i * 10.5} y={0} width={10.5} height={PITCH_H} className={i % 2 ? 'pitch__stripe' : undefined} />
      ))}
      <g className="pitch__line">
        <rect x={0.5} y={0.5} width={PITCH_W - 1} height={PITCH_H - 1} />
        <line x1={PITCH_W / 2} y1={0.5} x2={PITCH_W / 2} y2={PITCH_H - 0.5} />
        <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r={9.15} />
        {/* Penalty and goal areas, both ends */}
        <rect x={0.5} y={13.84} width={16} height={40.32} />
        <rect x={PITCH_W - 16.5} y={13.84} width={16} height={40.32} />
        <rect x={0.5} y={24.84} width={5} height={18.32} />
        <rect x={PITCH_W - 5.5} y={24.84} width={5} height={18.32} />
        <path d="M16.5 26.69 A9.15 9.15 0 0 1 16.5 41.31" />
        <path d="M88.5 26.69 A9.15 9.15 0 0 0 88.5 41.31" />
      </g>
      <g className="pitch__spot">
        <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r={0.5} />
        <circle cx={11} cy={PITCH_H / 2} r={0.4} />
        <circle cx={PITCH_W - 11} cy={PITCH_H / 2} r={0.4} />
      </g>
      {/* Goals, just inside the touchline so they stay in frame */}
      <rect x={0} y={30.34} width={0.9} height={7.32} className="pitch__goal" />
      <rect x={PITCH_W - 0.9} y={30.34} width={0.9} height={7.32} className="pitch__goal" />
    </>
  );
}

/**
 * Live match tracker: a simulated top-down view of the match with the ball,
 * the player on it, attack zones, possession and a short commentary feed.
 * All movement is mock data from the match simulator.
 */
export function LivePitch({ event }: { event: SportEvent }) {
  const { state } = useStore();
  const home = getTeam(event.home);
  const away = getTeam(event.away);
  const teams = { home, away };
  const kits: Record<Side, { bg: string; fg: string }> = { home: kit(home), away: kit(away) };
  const minute = Math.min(90, (event.minute ?? 0) + state.elapsed);

  const [open, setOpen] = useState(true);
  const [sim, setSim] = useState<SimState>(() => ({ ...initialSim(teams), possession: { home: 30, away: 26 } }));
  const minuteRef = useRef(minute);
  minuteRef.current = minute;
  const bodyId = useId();

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      if (document.hidden) return; // don't simulate an unseen match
      setSim((prev) => step(prev, { home, away }, minuteRef.current));
    }, TICK_MS);
    return () => window.clearInterval(id);
    // Teams are fixed for a match page; the event id is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event.id]);

  const zone = zoneOf(sim);
  const attacking = sim.side === 'home' ? home : away;
  const pct = possessionPct(sim);
  const left = (sim.x / PITCH_W) * 100;
  const top = (sim.y / PITCH_H) * 100;
  const showTrail = sim.action === 'pass' || sim.action === 'shot' || sim.action === 'dribble';

  return (
    <section className="tracker" aria-label="Live match tracker">
      <header className="tracker__head">
        <h2 className="tracker__title">
          <span className="live-dot" aria-hidden="true" />
          Live match tracker
        </h2>
        <span className="tracker__sim">Simulated</span>
        <button
          type="button"
          className="tracker__toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide' : 'Show'}
          <Icon name="chevron-down" size={16} className={open ? '' : 'is-closed'} />
        </button>
      </header>

      {open && (
        <div className="tracker__body" id={bodyId}>
          <div
            className="pitch"
            role="img"
            aria-label={`Simulated pitch view. ${attacking.name} in possession, ${ZONE_LABEL[zone].toLowerCase()}, ball with ${shortName(sim.carrier)}.`}
            style={{ '--home': kits.home.bg, '--away': kits.away.bg } as CSSProperties}
          >
            <svg className="pitch__svg" viewBox={`0 0 ${PITCH_W} ${PITCH_H}`} aria-hidden="true">
              <Markings />
              {showTrail && (
                <line
                  key={sim.tick}
                  className={`pitch__trail pitch__trail--${sim.action}`}
                  x1={sim.fromX}
                  y1={sim.fromY}
                  x2={sim.x}
                  y2={sim.y}
                  style={{ stroke: kits[sim.side].bg }}
                />
              )}
            </svg>

            {/* Attacking third / box shading for the side in possession */}
            <div className={`pitch__zone pitch__zone--${zone} pitch__zone--${sim.side}`} style={{ '--team': kits[sim.side].bg } as CSSProperties} />

            <span className="pitch__dir pitch__dir--home" aria-hidden="true">
              {home.short} <Icon name="chevron-right" size={12} />
            </span>
            <span className="pitch__dir pitch__dir--away" aria-hidden="true">
              <Icon name="chevron-right" size={12} className="pitch__flip" /> {away.short}
            </span>

            <div
              className={`pitch__ball pitch__ball--${sim.action} ${top < 18 ? 'pitch__ball--low' : ''}`}
              style={{ left: `${left}%`, top: `${top}%`, '--team': kits[sim.side].bg, '--team-fg': kits[sim.side].fg } as CSSProperties}
              aria-hidden="true"
            >
              <span className="pitch__marker" />
              <span className="pitch__name">{shortName(sim.carrier)}</span>
            </div>
          </div>

          <div className="tracker__side">
            <p className={`tracker__status tracker__status--${zone}`} style={{ '--team': kits[sim.side].bg } as CSSProperties}>
              <span className="tracker__swatch" aria-hidden="true" />
              <span>
                <b>{ZONE_LABEL[zone]}</b>
                {attacking.short}
              </span>
            </p>

            <div className="possession">
              <div className="possession__labels">
                <span>{home.short}</span>
                <span className="label">Possession</span>
                <span>{away.short}</span>
              </div>
              <div className="possession__bar" aria-label={`Possession: ${home.short} ${pct.home}%, ${away.short} ${pct.away}%`} role="img">
                <span style={{ width: `${pct.home}%`, background: kits.home.bg }} />
                <span style={{ width: `${pct.away}%`, background: kits.away.bg }} />
              </div>
              <div className="possession__labels possession__labels--pct">
                <span>{pct.home}%</span>
                <span>{pct.away}%</span>
              </div>
            </div>

            <ol className="tracker__feed" aria-label="Match events">
              {sim.events.length === 0 && <li className="tracker__empty">Waiting for the next action…</li>}
              {sim.events.map((e) => (
                <li key={e.id} className={`feed-item ${e.big ? 'feed-item--big' : ''}`}>
                  <span className="feed-item__min">{e.minute}&apos;</span>
                  <span className="feed-item__bar" style={{ background: kits[e.side].bg }} aria-hidden="true" />
                  <span className="feed-item__text">{e.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
