import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(`ad-leads:${ip}`, 3, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validation
    const required = ['company_name', 'email', 'budget_range', 'package_interest'] as const;
    for (const field of required) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Length limits to prevent abuse
    if (body.company_name.length > 200 || body.email.length > 254 || (body.message && body.message.length > 5000)) {
      return NextResponse.json({ error: 'Field length exceeded' }, { status: 400 });
    }

    // Allowed values validation
    const validBudgets = ['$1k-$5k', '$5k-$15k', '$15k-$50k', '$50k+'];
    const validPackages = ['signal', 'alpha', 'institutional', 'event'];
    if (!validBudgets.includes(body.budget_range)) {
      return NextResponse.json({ error: 'Invalid budget range' }, { status: 400 });
    }
    if (!validPackages.includes(body.package_interest)) {
      return NextResponse.json({ error: 'Invalid package interest' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('ad_leads').insert({
      company_name: body.company_name.trim(),
      contact_name: body.contact_name?.trim() || null,
      email: body.email.trim().toLowerCase(),
      telegram: body.telegram?.trim() || null,
      website: body.website?.trim() || null,
      budget_range: body.budget_range,
      package_interest: body.package_interest,
      message: body.message?.trim() || null,
      source_page: '/advertise',
    });

    if (error) {
      console.error('[AdLeads] Insert error:', error);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
