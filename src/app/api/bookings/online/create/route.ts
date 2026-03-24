import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  buildInvoiceReceiverCode,
  buildQPayCallbackUrl,
  generateSenderInvoiceNo,
  hhmmToMinutes,
  isValidTimeSlot,
  normalizeAmount,
  normalizePeopleCount,
} from '@/lib/paymentHelpers';
import { createQPayInvoice, getQPayInvoiceCode } from '@/lib/qpay';

type BranchRow = {
  id: number;
  name: string | null;
  capacity_skin: number | null;
  capacity_hair: number | null;
};

type ServiceRow = {
  id: number;
  name: string | null;
  category: 'skin' | 'hair' | null;
  is_active: boolean | null;
};

type ServiceBranchPriceRow = {
  id?: number;
  branch_id: number;
  service_id?: number;
  enabled: boolean | null;
  price: number | null;
};

function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...extra,
    },
    { status },
  );
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return jsonError('Unauthorized', 401);
    }

    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return jsonError('Unauthorized', 401);
    }

    const authUser = authData.user;

    const body = await req.json();

    const date = String(body.date || '').trim();
    const time = String(body.time || '').trim();
    const branchId = Number(body.branchId);
    const serviceId = Number(body.serviceId);
    const peopleCount = normalizePeopleCount(body.peopleCount);
    const customerName = String(body.customerName || '').trim();
    const customerPhone = String(body.customerPhone || '').trim();

    if (!date || !time || !branchId || !serviceId) {
      return jsonError('Мэдээллээ бүрэн оруулна уу.');
    }

    if (!customerName || !customerPhone) {
      return jsonError('Хэрэглэгчийн нэр, утас шаардлагатай.');
    }

    if (!isValidTimeSlot(time)) {
      return jsonError('Сонгосон цаг буруу байна.');
    }

    const today = new Date().toISOString().slice(0, 10);
    if (date < today) {
      return jsonError('Өнгөрсөн өдөр сонгох боломжгүй.');
    }

    if (date === today) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (hhmmToMinutes(time) <= nowMinutes) {
        return jsonError('Өнгөрсөн цаг сонгох боломжгүй.');
      }
    }

    const [
      customerRes,
      branchRes,
      serviceRes,
      priceRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('customers')
        .select('id, full_name, phone')
        .eq('id', authUser.id)
        .maybeSingle(),
      supabaseAdmin
        .from('branches')
        .select('id, name, capacity_skin, capacity_hair')
        .eq('id', branchId)
        .maybeSingle(),
      supabaseAdmin
        .from('services')
        .select('id, name, category, is_active')
        .eq('id', serviceId)
        .maybeSingle(),
      supabaseAdmin
        .from('service_branch_prices')
        .select('branch_id, service_id, enabled, price')
        .eq('branch_id', branchId)
        .eq('service_id', serviceId)
        .maybeSingle(),
    ]);

    if (customerRes.error || !customerRes.data) {
      return jsonError('Хэрэглэгчийн мэдээлэл олдсонгүй.', 404);
    }

    if (branchRes.error || !branchRes.data) {
      return jsonError('Салбар олдсонгүй.', 404);
    }

    if (serviceRes.error || !serviceRes.data) {
      return jsonError('Үйлчилгээ олдсонгүй.', 404);
    }

    if (priceRes.error || !priceRes.data) {
      return jsonError('Энэ салбар дээр үйлчилгээ идэвхгүй байна.', 400);
    }

    const customer = customerRes.data;
    const branch = branchRes.data as BranchRow;
    const service = serviceRes.data as ServiceRow;
    const priceRow = priceRes.data as ServiceBranchPriceRow;

    if (!service.is_active) {
      return jsonError('Үйлчилгээ идэвхгүй байна.');
    }

    if (!priceRow.enabled) {
      return jsonError('Энэ салбар дээр үйлчилгээ идэвхгүй байна.');
    }

    const category = (service.category || 'skin') as 'skin' | 'hair';
    const capacity =
      category === 'skin'
        ? Number(branch.capacity_skin || 0)
        : Number(branch.capacity_hair || 0);

    if (capacity <= 0) {
      return jsonError(
        category === 'skin'
          ? 'Энэ салбарт арьсны үйлчилгээ авах боломжгүй байна.'
          : 'Энэ салбарт үсний үйлчилгээ авах боломжгүй байна.',
      );
    }

    const unitPrice = normalizeAmount(priceRow.price || 0);
    const totalAmount = normalizeAmount(unitPrice * peopleCount);

    const { data: existingBookings, error: existingBookingsError } =
      await supabaseAdmin
        .from('bookings')
        .select('id, people_count, service_id, status')
        .eq('branch_id', branchId)
        .eq('date', date)
        .eq('time', time)
        .neq('status', 'cancelled');

    if (existingBookingsError) {
      return jsonError('Ачаалал шалгахад алдаа гарлаа.', 500);
    }

    const serviceIdsForCategoryRes = await supabaseAdmin
      .from('services')
      .select('id, category')
      .eq('category', category);

    if (serviceIdsForCategoryRes.error) {
      return jsonError('Үйлчилгээний мэдээлэл шалгахад алдаа гарлаа.', 500);
    }

    const categoryServiceIds = new Set(
      (serviceIdsForCategoryRes.data || []).map((x) => Number(x.id)),
    );

    let usedCapacity = 0;
    for (const row of existingBookings || []) {
      if (!categoryServiceIds.has(Number(row.service_id))) continue;
      usedCapacity += Number(row.people_count || 1);
    }

    const remaining = capacity - usedCapacity;
    if (remaining < peopleCount) {
      return NextResponse.json(
        {
          success: false,
          error: 'CAPACITY_FULL',
          message: 'Энэ цаг дүүрсэн байна. Өөр цаг сонгоно уу.',
        },
        { status: 409 },
      );
    }

    const insertBookingPayload: Record<string, unknown> = {
      customer_id: customer.id,
      branch_id: branchId,
      service_id: serviceId,
      date,
      time,
      people_count: peopleCount,
      amount: totalAmount,
      status: 'awaiting_payment',
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_provider: 'qpay',
      payment_status: 'PENDING',
      payment_amount: totalAmount,
    };

    const { data: bookingInsert, error: bookingInsertError } =
      await supabaseAdmin
        .from('bookings')
        .insert(insertBookingPayload)
        .select('id')
        .single();

    if (bookingInsertError || !bookingInsert) {
      return jsonError(
        bookingInsertError?.message || 'Захиалга үүсгэхэд алдаа гарлаа.',
        500,
      );
    }

    const bookingId = String(bookingInsert.id);
    const callbackUrl = buildQPayCallbackUrl();
    const senderInvoiceNo = generateSenderInvoiceNo(bookingId);
    const invoiceReceiverCode = buildInvoiceReceiverCode(customer.id, bookingId);
    const invoiceDescription = `${branch.name || 'DrSkin'} - ${service.name || 'Service'} - ${date} ${time}`;

    let invoice;
    try {
      invoice = await createQPayInvoice({
        invoice_code: getQPayInvoiceCode(),
        sender_invoice_no: senderInvoiceNo,
        invoice_receiver_code: invoiceReceiverCode,
        invoice_description: invoiceDescription,
        sender_branch_code: String(branchId),
        amount: totalAmount,
        callback_url: callbackUrl,
        allow_partial: false,
        allow_exceed: false,
        invoice_receiver_data: {
          name: customerName,
          phone: customerPhone,
          email: authUser.email || '',
        },
        lines: [
          {
            line_description: service.name || 'Appointment',
            line_quantity: String(peopleCount),
            line_unit_price: unitPrice.toFixed(2),
            note: `${date} ${time}`,
          },
        ],
      });
    } catch (qpayError: any) {
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'payment_failed',
          payment_status: 'FAILED',
        })
        .eq('id', bookingId);

      return jsonError(
        qpayError?.message || 'QPay invoice үүсгэхэд алдаа гарлаа.',
        500,
      );
    }

    const { error: paymentInsertError } = await supabaseAdmin
      .from('qpay_payments')
      .insert({
        booking_id: bookingId,
        customer_id: customer.id,
        provider: 'qpay',
        status: 'INVOICE_CREATED',
        payment_status: 'NEW',
        sender_invoice_no: senderInvoiceNo,
        invoice_id: invoice.invoice_id,
        invoice_code: getQPayInvoiceCode(),
        amount: totalAmount,
        currency: 'MNT',
        invoice_description: invoiceDescription,
        callback_url: callbackUrl,
        qr_text: invoice.qr_text ?? null,
        qr_image: invoice.qr_image ?? null,
        qpay_short_url: invoice.qPay_shortUrl ?? null,
        qpay_deeplink: invoice.qPay_deeplink ?? null,
        raw_create_response: invoice,
      });

    if (paymentInsertError) {
      await supabaseAdmin
        .from('bookings')
        .update({
          payment_status: 'FAILED',
          status: 'payment_failed',
        })
        .eq('id', bookingId);

      return jsonError(paymentInsertError.message, 500);
    }

    await supabaseAdmin
      .from('bookings')
      .update({
        payment_invoice_id: invoice.invoice_id,
      })
      .eq('id', bookingId);

    return NextResponse.json({
      success: true,
      bookingId,
      invoiceId: invoice.invoice_id,
      senderInvoiceNo,
      qrText: invoice.qr_text ?? null,
      qrImage: invoice.qr_image ?? null,
      qPayShortUrl: invoice.qPay_shortUrl ?? null,
      qPayDeeplink: invoice.qPay_deeplink ?? [],
      message: 'Захиалга үүслээ. Төлбөрөө хийнэ үү.',
    });
  } catch (error: any) {
    return jsonError(error?.message || 'Серверийн алдаа гарлаа.', 500);
  }
}