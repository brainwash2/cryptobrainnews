'use client';
import { DataPageError } from '../_components/DataPageError';
export default function TreasuriesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="p-6"><DataPageError error={error} reset={reset} title="Treasuries Data Error" /></main>;
}
