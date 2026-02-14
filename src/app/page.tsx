// src/app/page.tsx
// ─── Root route redirects to homepage ─────────────────────────────────────
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/homepage');
}
