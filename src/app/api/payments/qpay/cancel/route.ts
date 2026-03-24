import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getQPayAccessToken } from '@/lib/qpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bookingId = String(body.bookingId || '');

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 });
    }

    const { data: paymentRow, error } = await supabaseAdmin
      .from('qpay_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !paymentRow) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    const accessToken = await getQPayAccessToken();

    const res = await fetch(`${process.env.QPAY_BASE_URL}/v2/invoice/${paymentRow.invoice_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `QPay cancel failed: ${res.status} ${text}`,
      }, { status: 500 });
    }

    await supabaseAdmin
      .from('qpay_payments')
      .update({
        status: 'CANCELLED',
        payment_status: 'CANCELLED',
      })
      .eq('id', paymentRow.id);

    await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'CANCELLED',
        status: 'cancelled',
      })
      .eq('id', bookingId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Unexpected server error' },
      { status: 500 }
    );
  }
}