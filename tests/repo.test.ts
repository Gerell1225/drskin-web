import { describe, expect, it } from 'vitest';
import { repo } from '@/components/admin/repo';

describe('repo', () => {
  it('upserts branches', () => {
    const id = 'new-branch';
    repo.branches.upsert({
      id,
      title: 'Test',
      address: 'Addr',
      phone: '123',
      hours: '9-18',
      bedsSkin: 1,
      bedsHair: 1,
    });
    const list = repo.branches.list();
    expect(list.some((b) => b.id === id)).toBe(true);
    repo.branches.remove(id);
    expect(repo.branches.list().some((b) => b.id === id)).toBe(false);
  });

  it('manages services and prices', () => {
    const serviceId = 'sv-test';
    repo.services.upsert({
      id: serviceId,
      name: 'Test',
      category: 'Cat',
      durationMin: 30,
      kind: 'skin',
    });
    repo.pricing.upsert({ branchId: 'b1', serviceId, price: 1234 });
    expect(
      repo.pricing.list().find((p) => p.serviceId === serviceId)?.price,
    ).toBe(1234);
    repo.services.remove(serviceId);
    expect(repo.services.list().some((s) => s.id === serviceId)).toBe(false);
  });

  it('handles bookings lifecycle', () => {
    const id = 'bk-test';
    repo.bookings.upsert({
      id,
      customer: 'Test',
      phone: '9900',
      branchId: 'b1',
      serviceId: 's1',
      dateISO: '2025-01-01',
      time: '10:00',
      partySize: 1,
      status: 'pending',
      paid: false,
    });
    expect(repo.bookings.list().some((b) => b.id === id)).toBe(true);
    repo.bookings.remove(id);
    expect(repo.bookings.list().some((b) => b.id === id)).toBe(false);
  });
});
