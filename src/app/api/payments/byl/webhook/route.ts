export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const json = (payload: any, status = 200) => NextResponse.json(payload, { status });

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a, 'utf8');
  const y = Buffer.from(b, 'utf8');
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
};

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  const signature = req.headers.get('Byl-Signature') || '';
  const payload = await req.text();

  const secret = process.env.BYL_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'SERVER_ENV_MISSING' }, 500);

  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  if (!signature || !safeEqual(signature, computed)) {
    return json({ error: 'INVALID_SIGNATURE' }, 401);
  }

  let evt: any;
  try {
    evt = JSON.parse(payload);
  } catch {
    return json({ error: 'INVALID_JSON' }, 400);
  }

  const type = evt?.type as string | undefined;
  const eventId = evt?.id as number | undefined;

  if (type !== 'checkout.completed') {
    return json({ received: true }, 200);
  }

  const checkout = evt?.data?.object;
  const checkoutId = Number(checkout?.id);
  const checkoutStatus = checkout?.status ? String(checkout.status) : 'complete';
  const paymentMethod = checkout?.payment_method ? String(checkout.payment_method) : null;
  const clientRef = checkout?.client_reference_id ? String(checkout.client_reference_id) : null;
  const bookingId = clientRef ? Number(clientRef) : null;

  if (!Number.isFinite(checkoutId) || !bookingId || !Number.isFinite(bookingId)) {
    return json({ error: 'MISSING_IDS' }, 400);
  }

  const amountFromEvent =
    Number(checkout?.amount_total ?? checkout?.amount ?? 0) || 0;

  const upsertRes = await supabaseAdmin.from('payments').upsert(
    {
      booking_id: bookingId,
      provider: 'byl',
      provider_object: 'checkout',
      provider_object_id: checkoutId,
      status: checkoutStatus === 'complete' ? 'paid' : checkoutStatus,
      payment_method: paymentMethod,
      last_event_id: eventId ?? null,
      last_event_type: type ?? null,
      raw_event: evt,
      currency: 'MNT',
      amount: amountFromEvent,
      checkout_url: checkout?.url ? String(checkout.url) : null,
    },
    { onConflict: 'provider,provider_object,provider_object_id' },
  );

  if (upsertRes.error) {
    return json({ error: 'PAYMENT_UPSERT_FAILED', detail: upsertRes.error.message }, 500);
  }

  const update1 = await supabaseAdmin
    .from('bookings')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', bookingId);

  if (update1.error) {
    const update2 = await supabaseAdmin
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', bookingId);

    if (update2.error) {
      return json({ error: 'BOOKING_UPDATE_FAILED', detail: update2.error.message }, 500);
    }
  }

  return json({ received: true }, 200);
}
