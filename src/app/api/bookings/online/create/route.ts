export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Body = {
  date: string;
  time: string;
  branchId: number;
  serviceId: number;
  peopleCount: number;
  customerName: string;
  customerPhone: string;
};

const json = (payload: any, status = 200) => NextResponse.json(payload, { status });

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!jwt) return json({ error: 'UNAUTHORIZED' }, 401);

  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: userRes, error: userErr } = await supabaseAnon.auth.getUser(jwt);
  if (userErr || !userRes.user) return json({ error: 'UNAUTHORIZED' }, 401);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'BAD_REQUEST', message: 'Invalid JSON' }, 400);
  }

  const { date, time, branchId, serviceId, peopleCount, customerName, customerPhone } = body;

  if (!date || !time) return json({ error: 'BAD_REQUEST', message: 'date/time required' }, 400);
  if (!branchId || !serviceId) return json({ error: 'BAD_REQUEST', message: 'branchId/serviceId required' }, 400);
  if (!Number.isFinite(peopleCount) || peopleCount < 1 || peopleCount > 6)
    return json({ error: 'BAD_REQUEST', message: 'peopleCount invalid' }, 400);
  if (!customerName?.trim() || !customerPhone?.trim())
    return json({ error: 'BAD_REQUEST', message: 'customerName/customerPhone required' }, 400);

  const { data: branch, error: branchErr } = await supabaseAdmin
    .from('branches')
    .select('id, name, capacity_skin, capacity_hair')
    .eq('id', branchId)
    .single();

  if (branchErr || !branch) return json({ error: 'BRANCH_NOT_FOUND' }, 404);

  const { data: service, error: serviceErr } = await supabaseAdmin
    .from('services')
    .select('id, name, category, is_active')
    .eq('id', serviceId)
    .single();

  if (serviceErr || !service) return json({ error: 'SERVICE_NOT_FOUND' }, 404);
  if (!service.is_active) return json({ error: 'SERVICE_INACTIVE' }, 400);

  const { data: priceRow, error: priceErr } = await supabaseAdmin
    .from('service_branch_prices')
    .select('price, enabled')
    .eq('service_id', serviceId)
    .eq('branch_id', branchId)
    .single();

  if (priceErr || !priceRow || !priceRow.enabled) return json({ error: 'PRICE_NOT_FOUND' }, 400);

  const unitAmount = Number(priceRow.price);
  if (!Number.isFinite(unitAmount) || unitAmount <= 0) return json({ error: 'INVALID_PRICE' }, 400);

  const category = (service.category ?? 'skin') as 'skin' | 'hair';
  const capacity =
    category === 'skin' ? Number(branch.capacity_skin ?? 0) : Number(branch.capacity_hair ?? 0);

  if (!Number.isFinite(capacity) || capacity <= 0) return json({ error: 'CAPACITY_ZERO' }, 400);

  const { data: existing, error: exErr } = await supabaseAdmin
    .from('bookings')
    .select('people_count, service:services(category)')
    .eq('branch_id', branchId)
    .eq('date', date)
    .eq('time', time)
    .neq('status', 'cancelled');

  if (exErr) return json({ error: 'CAPACITY_CHECK_FAILED' }, 500);

  const currentLoad =
    (existing ?? [])
      .filter((r: any) => (r?.service?.category ?? 'skin') === category)
      .reduce((sum: number, r: any) => sum + (r.people_count != null ? Number(r.people_count) : 1), 0) || 0;

  if (currentLoad + peopleCount > capacity) return json({ error: 'CAPACITY_FULL' }, 409);

  const totalAmount = unitAmount * peopleCount;

  const { data: booking, error: insErr } = await supabaseAdmin
    .from('bookings')
    .insert({
      date,
      time,
      branch_id: branchId,
      service_id: serviceId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      people_count: peopleCount,
      total_amount: totalAmount,
      channel: 'online',
      status: 'pending',
      payment_status: 'pending',
      customer_id: userRes.user.id,
    })
    .select('id')
    .single();

  if (insErr || !booking) return json({ error: 'BOOKING_CREATE_FAILED', detail: insErr?.message }, 500);

  const bookingId = booking.id as number;

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
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL!}/payment/success?bookingId=${bookingId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL!}/payment/cancel?bookingId=${bookingId}`,
        client_reference_id: String(bookingId),
        phone_number_collection: true,
        items: [
          {
            price_data: {
              unit_amount: totalAmount,
              product_data: { name: `${service.name} - ${branch.name}` },
            },
            quantity: 1,
          },
        ],
      }),
    },
  );

  const checkoutJson = await checkoutRes.json().catch(() => null);

  if (!checkoutRes.ok || !checkoutJson?.data?.id || !checkoutJson?.data?.url) {
    await supabaseAdmin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    return json({ error: 'BYL_CREATE_FAILED', detail: checkoutJson }, 500);
  }

  const checkoutId = Number(checkoutJson.data.id);
  const checkoutUrl = String(checkoutJson.data.url);

  const { error: payErr } = await supabaseAdmin.from('payments').insert({
    booking_id: bookingId,
    provider: 'byl',
    provider_object: 'checkout',
    provider_object_id: checkoutId,
    status: 'open',
    amount: totalAmount,
    currency: 'MNT',
    checkout_url: checkoutUrl,
  });

  if (payErr) return json({ error: 'PAYMENT_SAVE_FAILED', detail: payErr.message }, 500);

  return json({ bookingId, checkoutUrl });
}
