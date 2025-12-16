import { describe, expect, it } from 'vitest';
import { bookingCapacityOk } from '@/components/admin/utils';
import { Booking } from '@/components/admin/types';
import { bookings, branches, services } from '@/components/admin/data.mock';

describe('booking capacity', () => {
  it('fails when capacity exceeded', () => {
    const branch = branches[0];
    const service = services.find((s) => s.kind === 'skin')!;
    const first: Booking = {
      id: 'bk-a',
      customer: 'A',
      phone: '1',
      branchId: branch.id,
      serviceId: service.id,
      dateISO: '2025-01-01',
      time: '13:00',
      partySize: 3,
      status: 'pending',
      paid: false,
    };
    const second: Booking = { ...first, id: 'bk-b', partySize: 2 };
    const ok = bookingCapacityOk(first, [], branch, service);
    const fail = bookingCapacityOk(second, [first], branch, service);
    expect(ok).toBe(true);
    expect(fail).toBe(false);
  });
});
