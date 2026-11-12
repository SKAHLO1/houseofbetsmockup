import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <div className="page">
      <EmptyState
        icon="search"
        title="We couldn’t find that match"
        action={
          <Link href="/" className="btn btn--secondary">
            Back to sports home
          </Link>
        }
      >
        It may have finished or the link is out of date. Live and upcoming matches are on the home page.
      </EmptyState>
    </div>
  );
}
