import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LeagueView } from '@/components/views/LeagueView';
import { COMPETITIONS } from '@/lib/data/catalog';

interface Props {
  params: Promise<{ league: string }>;
}

/** Football competitions only; anything else under /football is not a league. */
function footballLeague(id: string) {
  return COMPETITIONS.find((c) => c.id === id && c.sportId === 'football');
}

export function generateStaticParams() {
  return COMPETITIONS.filter((c) => c.sportId === 'football').map((c) => ({ league: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league } = await params;
  return { title: footballLeague(league)?.name ?? 'League not found' };
}

/** A football league inside the Football section, e.g. /football/premier-league, with its photo hero. */
export default async function FootballLeaguePage({ params }: Props) {
  const { league } = await params;
  if (!footballLeague(league)) notFound();
  return <LeagueView competitionId={league} />;
}
