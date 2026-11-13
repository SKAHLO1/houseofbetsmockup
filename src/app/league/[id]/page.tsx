import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LeagueView } from '@/components/views/LeagueView';
import { COMPETITIONS } from '@/lib/data/catalog';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const competition = COMPETITIONS.find((c) => c.id === id);
  return { title: competition ? competition.name : 'League not found' };
}

export default async function LeaguePage({ params }: Props) {
  const { id } = await params;
  if (!COMPETITIONS.some((c) => c.id === id)) notFound();
  return <LeagueView competitionId={id} />;
}
