import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MatchView } from '@/components/views/MatchView';
import { getEvent } from '@/lib/data/events';
import { MARKET_GROUPS } from '@/lib/data/markets';
import { eventName } from '@/lib/format';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ group?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEvent((await params).id);
  return { title: event ? eventName(event) : 'Match not found' };
}

export default async function MatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { group } = await searchParams;
  if (!getEvent(id)) notFound();
  // key: a fresh view per match so the selected market group resets on navigation.
  return <MatchView key={`${id}:${group ?? ''}`} eventId={id} initialGroup={MARKET_GROUPS.find((g) => g.id === group)?.id} />;
}
