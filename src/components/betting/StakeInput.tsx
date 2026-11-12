'use client';

import { useId } from 'react';
import { MAX_STAKE, MIN_STAKE } from '@/lib/data/bets';
import { formatMoney, sanitiseStake } from '@/lib/format';
import type { StakeError } from '@/lib/store';

const QUICK_STAKES = [10, 50, 100];

const ERROR_TEXT: Record<Exclude<StakeError, null | 'empty'>, string> = {
  min: `Minimum stake is ${formatMoney(MIN_STAKE)} USDT.`,
  max: `Maximum stake is ${formatMoney(MAX_STAKE)} USDT.`,
};

interface Props {
  value: string;
  error: StakeError;
  disabled?: boolean;
  /** Names the selection for screen readers. */
  label: string;
  onChange: (stake: string) => void;
}

export function StakeInput({ value, error, disabled = false, label, onChange }: Props) {
  const id = useId();
  const invalid = error === 'min' || error === 'max';

  const add = (amount: number) => {
    const next = (Number(value) || 0) + amount;
    onChange(String(Math.round(next * 100) / 100));
  };

  return (
    <div className="stake">
      <div className="stake__row">
        <label htmlFor={id} className="stake__label">
          Stake
        </label>
        <div className={`stake__field ${invalid ? 'is-invalid' : ''}`}>
          <input
            id={id}
            className="stake__input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={value}
            disabled={disabled}
            aria-label={`Stake in USDT for ${label}`}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            onChange={(e) => onChange(sanitiseStake(e.target.value))}
          />
          <span className="stake__unit" aria-hidden="true">
            USDT
          </span>
        </div>
      </div>
      <div className="stake__quick">
        {QUICK_STAKES.map((amount) => (
          <button key={amount} type="button" className="chip-btn" disabled={disabled} onClick={() => add(amount)} aria-label={`Add ${amount} USDT to stake`}>
            +{amount}
          </button>
        ))}
      </div>
      {invalid && (
        <p className="stake__error" id={`${id}-error`} role="alert">
          {ERROR_TEXT[error]}
        </p>
      )}
    </div>
  );
}
