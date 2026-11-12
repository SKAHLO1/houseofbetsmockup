'use client';

import { EmptyState } from '@/components/ui/EmptyState';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page">
      <EmptyState
        icon="alert"
        title="This page didn’t load"
        action={
          <button type="button" className="btn btn--secondary" onClick={reset}>
            Try again
          </button>
        }
      >
        Something went wrong while loading these markets. Your bet slip has not been affected.
      </EmptyState>
    </div>
  );
}
