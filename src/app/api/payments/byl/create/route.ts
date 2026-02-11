export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

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

const requireEnv = (keys: string[]) => {
  const missing = keys.filter((k) => !process.env[k]);
  return missing.length ? missing : null;
};

const normalizeTime = (t: string) => {
  const s = String(t || '').trim();
  if (!s) return s;
  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return s;
};

export async function POST(req: Request) {
  try {
    const missing = requireEnv([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'BYL_PROJECT_ID',
      'BYL_TOKEN',
      'NEXT_PUBLIC_SITE_URL',
    ]);
    if (missing) {
      return json({ error: 'SERVER_ENV_MISSING', missing }, 500);
    }

    const supabaseAdmin = getSupabaseAdmin();

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

    const date = String(body.date || '').trim();
    const time = normalizeTime(body.time);
    const branchId = Number(body.branchId);
    const serviceId = Number(body.serviceId);
    const peopleCount = Number(body.peopleCount);
    const customerName = String(body.customerName || '').trim();
    const customerPhone = String(body.customerPhone || '').trim();

    if (!date || !time) return json({ error: 'BAD_REQUEST', message: 'date/time required' }, 400);
    if (!branchId || !serviceId) return json({ error: 'BAD_REQUEST', message: 'branchId/serviceId required' }, 400);
    if (!Number.isFinite(peopleCount) || peopleCount < 1 || peopleCount > 6)
      return json({ error: 'BAD_REQUEST', message: 'peopleCount invalid' }, 400);
    if (!customerName || !customerPhone)
      return json({ error: 'BAD_REQUEST', message: 'customerName/customerPhone required' }, 400);

    const { data: branch, error: branchErr } = await supabaseAdmin
      .from('branches')
      .select('id, name, capacity_skin, capacity_hair')
      .eq('id', branchId)
      .single();

    if (branchErr || !branch) return json({ error: 'BRANCH_NOT_FOUND', detail: branchErr?.message }, 404);

    const { data: service, error: serviceErr } = await supabaseAdmin
      .from('services')
      .select('id, name, category, is_active')
      .eq('id', serviceId)
      .single();

    if (serviceErr || !service) return json({ error: 'SERVICE_NOT_FOUND', detail: serviceErr?.message }, 404);
    if (!service.is_active) return json({ error: 'SERVICE_INACTIVE' }, 400);

    const { data: priceRow, error: priceErr } = await supabaseAdmin
      .from('service_branch_prices')
      .select('price, enabled')
      .eq('service_id', serviceId)
      .eq('branch_id', branchId)
      .single();

    if (priceErr || !priceRow || !priceRow.enabled) {
      return json({ error: 'PRICE_NOT_FOUND', detail: priceErr?.message }, 400);
    }

    const unitAmount = Number(priceRow.price);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) return json({ error: 'INVALID_PRICE' }, 400);

    const category = (service.category ?? 'skin') as 'skin' | 'hair';
    const capacity =
      category === 'skin' ? Number(branch.capacity_skin ?? 0) : Number(branch.capacity_hair ?? 0);
    if (!Number.isFinite(capacity) || capacity <= 0) return json({ error: 'CAPACITY_ZERO' }, 400);

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('bookings')
      .select('people_count, service:services(category), status')
      .eq('branch_id', branchId)
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled');

    if (exErr) return json({ error: 'CAPACITY_CHECK_FAILED', detail: exErr.message }, 500);

    const currentLoad =
      (existing ?? [])
        .filter((r: any) => (r?.service?.category ?? 'skin') === category)
        .reduce((sum: number, r: any) => sum + (r.people_count != null ? Number(r.people_count) : 1), 0) || 0;

    if (currentLoad + peopleCount > capacity) return json({ error: 'CAPACITY_FULL' }, 409);

    const totalAmount = unitAmount * peopleCount;

    const baseInsert = {
      date,
      time,
      branch_id: branchId,
      service_id: serviceId,
      customer_name: customerName,
      customer_phone: customerPhone,
      people_count: peopleCount,
      total_amount: totalAmount,
      customer_id: userRes.user.id,
    };

    let bookingId: number | null = null;

    // Try preferred values first
    {
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .insert({
          ...baseInsert,
          channel: 'online',
          status: 'pending',
          payment_status: 'pending',
        })
        .select('id')
        .single();

      if (!error && data?.id != null) bookingId = Number(data.id);

      // If enum mismatch etc, fallback
      if (!bookingId && error) {
        const msg = error.message || '';
        const looksEnum = msg.includes('enum') || msg.includes('invalid input value');

        if (!looksEnum) {
          return json({ error: 'BOOKING_CREATE_FAILED', detail: msg }, 500);
        }
      }
    }

    // Fallback insert (uses DB defaults for enums)
    if (!bookingId) {
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .insert(baseInsert)
        .select('id')
        .single();

      if (error || !data?.id) return json({ error: 'BOOKING_CREATE_FAILED', detail: error?.message }, 500);
      bookingId = Number(data.id);

      await supabaseAdmin
        .from('bookings')
        .update({ payment_status: null })
        .eq('id', bookingId);
    }

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
      // Don’t crash silently — return Byl response so you can see it in Network tab
      return json({ error: 'BYL_CREATE_FAILED', detail: checkoutJson }, 500);
    }

    const checkoutId = Number(checkoutJson.data.id);
    const checkoutUrl = String(checkoutJson.data.url);

    await supabaseAdmin.from('payments').insert({
      booking_id: bookingId,
      provider: 'byl',
      provider_object: 'checkout',
      provider_object_id: checkoutId,
      status: 'open',
      amount: totalAmount,
      currency: 'MNT',
      checkout_url: checkoutUrl,
    });

    return json({ bookingId, checkoutUrl });
  } catch (e: any) {
    // Always return JSON (never HTML) so your client won’t throw “Unexpected token <”
    return json(
      {
        error: 'INTERNAL_ERROR',
        message: e?.message || 'Unknown error',
      },
      500,
    );
  }
}
