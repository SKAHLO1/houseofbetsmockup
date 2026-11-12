import { HomeView } from '@/components/views/HomeView';
import { getSport } from '@/lib/data/catalog';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const { sport } = await searchParams;
  return <HomeView sport={sport ? getSport(sport)?.id : undefined} />;
}
