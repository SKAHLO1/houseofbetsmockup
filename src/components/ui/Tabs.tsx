'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';

interface Tab<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  label: string;
  tabs: Tab<T>[];
  value: T;
  onChange: (id: T) => void;
  /** underline — page-level navigation; segmented — compact switch inside a panel. */
  variant?: 'underline' | 'segmented';
}

/** Single-select tab strip with arrow-key navigation. */
export function Tabs<T extends string>({ label, tabs, value, onChange, variant = 'underline' }: Props<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the selected tab visible when the strip scrolls horizontally.
  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !selected) return;
    const left = selected.offsetLeft - 12;
    const right = selected.offsetLeft + selected.offsetWidth + 12;
    if (left < list.scrollLeft) list.scrollLeft = left;
    else if (right > list.scrollLeft + list.clientWidth) list.scrollLeft = right - list.clientWidth;
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const index = tabs.findIndex((t) => t.id === value);
    const next = tabs[(index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    onChange(next.id);
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[tabs.indexOf(next)]?.focus();
  };

  return (
    <div className={`tabs tabs--${variant}`} role="tablist" aria-label={label} ref={listRef} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          className="tabs__tab"
          aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && <span className="tabs__count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
