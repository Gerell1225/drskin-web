export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await req.json();

    const {
      date,
      time,
      branchId,
      serviceId,
      peopleCount,
      customerName,
      customerPhone,
    } = body;

    if (!date || !time || !branchId || !serviceId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        date,
        time,
        branch_id: Number(branchId),
        service_id: Number(serviceId),
        people_count: Number(peopleCount || 1),
        customer_name: customerName,
        customer_phone: customerPhone,
        total_amount: 0,
        channel: 'online',
        status: 'pending',
        payment_status: 'pending',
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      booking: data,
      message: 'Booking created successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
