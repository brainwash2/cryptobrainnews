import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Supabase removed; stub endpoint that always returns success.
  return NextResponse.json({
    success: true,
    note: 'Ad leads feature not available (Supabase removed).',
  });
}