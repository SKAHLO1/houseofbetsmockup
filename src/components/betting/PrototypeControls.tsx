'use client';

import { useStore, type SlipLine } from '@/lib/store';

/**
 * Simulation switches for reviewers. Clearly separated from the betting UI
 * so nothing here reads as a real product feature.
 */
export function PrototypeControls({ lines }: { lines: SlipLine[] }) {
  const { state, dispatch, nudgeOdds } = useStore();

  return (
    <details className="proto">
      <summary className="proto__summary">
        Prototype controls
        <span className="proto__hint">Simulate price moves, suspensions and failures</span>
      </summary>
      <div className="proto__body">
        {lines.length > 0 && (
          <ul className="proto__list">
            {lines.map((line) => (
              <li key={line.selection.id} className="proto__row">
                <span className="proto__name">{line.selection.label}</span>
                <button type="button" className="chip-btn" disabled={line.suspended} onClick={() => nudgeOdds(line.selection.id)}>
                  Change odds
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => dispatch({ type: 'set-suspended', marketId: line.market.id, suspended: !line.suspended })}
                >
                  {line.suspended ? 'Reopen' : 'Suspend'}
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="proto__check">
          <input type="checkbox" checked={state.failNext} onChange={(e) => dispatch({ type: 'set-fail-next', fail: e.target.checked })} />
          Fail the next bet placement
        </label>
        <label className="proto__check">
          <input type="checkbox" checked={state.feedOn} onChange={(e) => dispatch({ type: 'set-feed', on: e.target.checked })} />
          Live price feed (in-play prices drift every few seconds)
        </label>
      </div>
    </details>
  );
}
