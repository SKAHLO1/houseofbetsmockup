import type { ReactNode } from 'react';
import type { SportId } from '@/lib/types';

export type IconName =
  | SportId
  | 'home'
  | 'live'
  | 'slip'
  | 'search'
  | 'star'
  | 'star-filled'
  | 'chevron-down'
  | 'chevron-right'
  | 'close'
  | 'lock'
  | 'menu'
  | 'check'
  | 'alert'
  | 'wallet';

const PATHS: Record<IconName, ReactNode> = {
  home: <path d="M3.5 11 12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" />,
  live: (
    <>
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <path d="M8.1 8.1a5.5 5.5 0 0 0 0 7.8M15.9 8.1a5.5 5.5 0 0 1 0 7.8M5.3 5.3a9.5 9.5 0 0 0 0 13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4" />
    </>
  ),
  football: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 8 3.8 2.8-1.45 4.4h-4.7L8.2 10.8zM12 8V3.2M15.8 10.8l4.6-1.5M14.35 15.2l2.8 3.9M9.65 15.2l-2.8 3.9M8.2 10.8 3.6 9.3" />
    </>
  ),
  tennis: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.4 9.4c4.4.4 7.6 3.6 8 11.2M20.6 14.6c-4.4-.4-7.6-3.6-8-11.2" />
    </>
  ),
  basketball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M5.7 5.5c2.2 1.6 3.3 3.8 3.3 6.5s-1.1 4.9-3.3 6.5M18.3 5.5C16.1 7.1 15 9.300 15 12s1.100 4.900 3.300 6.500" />
    </>
  ),
  baseball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.200 4.400c1.500 2.200 2.300 4.700 2.300 7.600s-.8 5.400-2.300 7.600M16.800 4.400c-1.500 2.200-2.300 4.700-2.300 7.600s.8 5.400 2.300 7.600M9 8.500l1.600-.5M9.500 12h1.700M9 15.500l1.600.5M15 8.500l-1.600-.5M14.500 12h-1.700M15 15.500l-1.600.5" />
    </>
  ),
  'american-football': (
    <>
      <path d="M4.300 19.700c-1.100-5.600.4-10.200 3.900-13.200s8.600-3.300 11.500-2.200c1.100 2.900.8 8-2.200 11.500s-7.600 5-13.200 3.900z" />
      <path d="m9.500 14.500 5-5M10.200 11.800l2 2M12.200 9.800l2 2" />
    </>
  ),
  esports: (
    <>
      <path d="M7.500 7.500h9a4 4 0 0 1 4 4.300l-.5 4.200a2.200 2.200 0 0 1-3.900 1.200L14.400 15H9.600l-1.700 2.200A2.200 2.200 0 0 1 4 16l-.5-4.200a4 4 0 0 1 4-4.300z" />
      <path d="M8 10v3M6.500 11.500h3M15.300 10.600h.01M17.200 12.400h.01" />
    </>
  ),
  slip: <path d="M6 3.500h12v17l-3-1.800-3 1.800-3-1.800-3 1.800zM9 8.500h6M9 12.500h6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.500" />
      <path d="m16 16 4.500 4.500" />
    </>
  ),
  star: <path d="m12 3.800 2.500 5.200 5.700.8-4.100 4 1 5.700L12 16.800l-5.100 2.700 1-5.700-4.100-4 5.700-.8z" />,
  'star-filled': (
    <path
      d="m12 3.800 2.500 5.200 5.700.8-4.100 4 1 5.700L12 16.800l-5.100 2.700 1-5.700-4.100-4 5.700-.8z"
      fill="currentColor"
    />
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  lock: (
    <>
      <rect x="5.500" y="10.500" width="13" height="9.500" rx="1.500" />
      <path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  alert: <path d="M12 4 2.800 19.500h18.400zM12 10v4.500M12 17.200h.01" />,
  wallet: (
    <>
      <path d="M4 7.500A2.500 2.500 0 0 1 6.500 5H18v3.500M4 7.500V17a2.500 2.500 0 0 0 2.500 2.500H20v-11H6.500A2.500 2.500 0 0 1 4 7.500z" />
      <path d="M16.500 14h.01" />
    </>
  ),
};

/** Decorative by default; pair with visible text or an aria-label on the parent control. */
export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
