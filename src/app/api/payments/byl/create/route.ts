export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const json = (payload: any, status = 200) => NextResponse.json(payload, { status });

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  const authHeader = req.headers.get('authorization') || '';
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!jwt) return json({ error: 'UNAUTHORIZED' }, 401);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anonKey) return json({ error: 'SERVER_ENV_MISSING' }, 500);

  const supabaseAnon = createClient(url, anonKey, { auth: { persistSession: false } });

  const { data: userRes, error: userErr } = await supabaseAnon.auth.getUser(jwt);
  if (userErr || !userRes.user) return json({ error: 'UNAUTHORIZED' }, 401);

  const body = await req.json().catch(() => null);
  const bookingId = body?.bookingId;
  if (!bookingId) return json({ error: 'BAD_REQUEST', message: 'bookingId required' }, 400);

  const { data: booking, error: bookErr } = await supabaseAdmin
    .from('bookings')
    .select('id, total_amount, customer_id, service_id, branch_id')
    .eq('id', bookingId)
    .single();

  if (bookErr || !booking) return json({ error: 'BOOKING_NOT_FOUND' }, 404);
  if (booking.customer_id !== userRes.user.id) return json({ error: 'FORBIDDEN' }, 403);

  const amount = Number(booking.total_amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return json({ error: 'INVALID_AMOUNT' }, 400);

  const { data: branch } = await supabaseAdmin
    .from('branches')
    .select('name')
    .eq('id', booking.branch_id)
    .single();

  const { data: service } = await supabaseAdmin
    .from('services')
    .select('name')
    .eq('id', booking.service_id)
    .single();

  const checkoutRes = await fetch(
    `https://byl.mn/api/v1/projects/${process.env.BYL_PROJECT_ID!}/checkouts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BYL_TOKEN!}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL!}/payment/success?bookingId=${booking.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL!}/payment/cancel?bookingId=${booking.id}`,
        client_reference_id: String(booking.id),
        phone_number_collection: true,
        items: [
          {
            price_data: {
              unit_amount: amount,
              product_data: { name: `${service?.name ?? 'Service'} - ${branch?.name ?? 'Branch'}` },
            },
            quantity: 1,
          },
        ],
      }),
    },
  );

  const checkoutJson = await checkoutRes.json().catch(() => null);

  if (!checkoutRes.ok || !checkoutJson?.data?.id || !checkoutJson?.data?.url) {
    return json({ error: 'BYL_CREATE_FAILED', detail: checkoutJson }, 500);
  }

  const checkoutId = Number(checkoutJson.data.id);
  const checkoutUrl = String(checkoutJson.data.url);

  await supabaseAdmin.from('payments').insert({
    booking_id: booking.id,
    provider: 'byl',
    provider_object: 'checkout',
    provider_object_id: checkoutId,
    status: 'open',
    amount,
    currency: 'MNT',
    checkout_url: checkoutUrl,
  });

  return json({ checkoutUrl });
}
