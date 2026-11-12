import type { Metadata } from 'next';
import { BetsView } from '@/components/views/BetsView';

export const metadata: Metadata = { title: 'Bet slip & My bets' };

export default function BetsPage() {
  return <BetsView />;
}
