'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We encountered an unexpected error while preparing this experience. Our team has been notified.
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 text-sm font-medium rounded-full bg-foreground text-background hover:opacity-90 transition-all"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2.5 text-sm font-medium rounded-full border border-border hover:bg-muted transition-all"
        >
          Return home
        </button>
      </div>
    </div>
  );
}
