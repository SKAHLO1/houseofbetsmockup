'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

/** Areas that scroll on their own: wheel input inside them stays native. */
const OWN_SCROLLERS = '.shell__nav, .shell__panel, .search__panel, .drawer';

/**
 * Smoothed wheel and trackpad scrolling for the page (Lenis).
 *
 * - Touch scrolling stays native on phones, which already feels right.
 * - Turns itself off for prefers-reduced-motion (Lenis default).
 * - The sidebar, bet slip panel, search results and drawers keep their own
 *   native scrolling; drawers also lock the page behind them.
 * - In-page anchor links glide to their target.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.matches?.(OWN_SCROLLERS) ?? false,
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
