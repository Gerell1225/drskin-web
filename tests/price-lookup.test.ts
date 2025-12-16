import { describe, expect, it } from 'vitest';
import { priceLookup } from '@/components/admin/utils';
import { branchServices } from '@/components/admin/data.mock';

describe('price lookup', () => {
  it('returns price for known pair', () => {
    const price = priceLookup(branchServices, 'b1', 's1');
    expect(price).toBe(95000);
  });

  it('returns null for missing pair', () => {
    const price = priceLookup(branchServices, 'unknown', 'unknown');
    expect(price).toBeNull();
  });
});
