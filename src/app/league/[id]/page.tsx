import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
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

/** Non-football competitions. Football leagues live under /football/[league], so old links redirect there. */
export default async function LeaguePage({ params }: Props) {
  const { id } = await params;
  const competition = COMPETITIONS.find((c) => c.id === id);
  if (!competition) notFound();
  if (competition.sportId === 'football') permanentRedirect(`/football/${id}`);
  return <LeagueView competitionId={id} />;
}
