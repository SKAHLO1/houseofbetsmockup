import type { Metadata } from 'next';
import { FootballView } from '@/components/views/FootballView';

export const metadata: Metadata = { title: 'Football' };

export default function FootballPage() {
  return <FootballView />;
}
