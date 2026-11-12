'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { search, type SearchKind } from '@/lib/data/search';
import { Icon } from '../ui/Icon';

const KINDS: SearchKind[] = ['Teams', 'Players', 'Competitions', 'Markets'];

interface Props {
  autoFocus?: boolean;
  /** Called after a result is opened or the box is dismissed with Escape. */
  onClose?: () => void;
}

/** Combobox search across teams, players, competitions and markets. */
export function SearchBox({ autoFocus = false, onClose }: Props) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => search(query), [query]);
  const showPanel = open && query.trim().length >= 2;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    router.push(href);
    onClose?.();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (query) setQuery('');
      else onClose?.();
      setOpen(false);
      return;
    }
    if (!showPanel || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active].href);
    }
  };

  return (
    <div className="search" ref={rootRef}>
      <div className="search__field">
        <Icon name="search" size={16} className="search__icon" />
        <input
          ref={inputRef}
          className="search__input"
          type="search"
          role="combobox"
          aria-label="Search teams, players, competitions and markets"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && results[active] ? `${listId}-${active}` : undefined}
          placeholder="Search teams, players, competitions, markets"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {showPanel && (
        <div className="search__panel" id={listId} role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <p className="search__none">
              No results for “{query.trim()}”. Try a team, player, competition or market such as “corners”.
            </p>
          ) : (
            KINDS.map((kind) => {
              const group = results.filter((r) => r.kind === kind);
              if (group.length === 0) return null;
              return (
                <div key={kind} role="group" aria-label={kind}>
                  <p className="search__kind" aria-hidden="true">
                    {kind}
                  </p>
                  {group.map((result) => {
                    const index = results.indexOf(result);
                    return (
                      <div
                        key={result.id}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={index === active}
                        className={`search__item ${index === active ? 'is-active' : ''}`}
                        onPointerEnter={() => setActive(index)}
                        onClick={() => go(result.href)}
                      >
                        <span className="search__title">{result.title}</span>
                        <span className="search__detail">{result.detail}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
