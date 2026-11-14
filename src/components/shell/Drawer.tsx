'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../ui/Icon';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** bottom — sheet rising from the bottom edge; left — navigation drawer. */
  side: 'bottom' | 'left';
  children: ReactNode;
}

/** Matches the exit animation length in shell.css (.drawer.is-closing). */
const EXIT_MS = 260;

/**
 * Modal drawer: locks page scroll, traps Tab, closes on Escape or backdrop, restores focus.
 * Stays mounted briefly after closing so it can slide out instead of vanishing.
 */
export function Drawer({ open, onClose, title, side, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  // Mount immediately on open; on close, play the exit animation, then unmount.
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setClosing(true);
    const id = window.setTimeout(
      () => {
        setMounted(false);
        setClosing(false);
      },
      reduced ? 0 : EXIT_MS,
    );
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('has-drawer');
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('has-drawer');
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className={`drawer drawer--${side} ${closing ? 'is-closing' : ''}`} data-lenis-prevent>
      <div className="drawer__backdrop" onClick={onClose} />
      <div
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={closing || undefined}
        ref={panelRef}
      >
        <div className="drawer__head">
          <span className="drawer__title">{title}</span>
          <button type="button" className="icon-btn" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose} ref={closeRef}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </div>
    </div>
  );
}
