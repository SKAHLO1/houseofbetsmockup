import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import 'lenis/dist/lenis.css';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/shell.css';
import '@/styles/components.css';
import '@/styles/pages.css';
import '@/styles/pitch.css';
import '@/styles/league.css';
import '@/styles/glass.css';

/*
 * One family, many voices. Archivo's width axis gives a semi-condensed cut
 * for headings and scores and a normal cut for reading, and its tabular
 * figures keep every price column aligned without switching to a mono face.
 */
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Housebets Sportsbook — Prototype', template: '%s · Housebets' },
  description: 'Clickable sportsbook prototype with mock data. No real money is processed.',
};

export const viewport: Viewport = { themeColor: '#04141a', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
