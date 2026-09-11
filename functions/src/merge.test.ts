import test from 'node:test';
import assert from 'node:assert/strict';

import { emptyExtractFields, mergeExtracted } from './merge';

test('merge fills empty name and mrp from extract', () => {
  const current = emptyExtractFields();
  const { merged } = mergeExtracted(current, { product_name: 'Tata Salt', mrp: 28 }, []);
  assert.equal(merged.product_name, 'Tata Salt');
  assert.equal(merged.mrp, '28');
});

test('merge does not overwrite a user-edited name on a later extract', () => {
  const current = { ...emptyExtractFields(), product_name: 'Shop name', mrp: '28' };
  const { merged, warnings } = mergeExtracted(
    current,
    { product_name: 'Tata Salt', mfd: '2026-01-01', expiry_date: '2027-01-01' },
    ['product_name'],
  );
  assert.equal(merged.product_name, 'Shop name');
  assert.equal(merged.mfd, '2026-01-01');
  assert.equal(merged.expiry_date, '2027-01-01');
  assert.equal(merged.mrp, '28');
  assert.ok(warnings.some((item) => item.toLowerCase().includes('name')));
});

test('merge never writes quantity (review-only field)', () => {
  const current = emptyExtractFields();
  const { merged } = mergeExtracted(current, { product_name: 'Salt', quantity: '12' } as never, []);
  assert.equal(merged.product_name, 'Salt');
  assert.equal('quantity' in merged, false);
});

test('merge skips extracted nulls and blank strings', () => {
  const current = { ...emptyExtractFields(), product_category: 'Eatables' };
  const { merged } = mergeExtracted(current, { product_category: null, standard_size: '  ' }, []);
  assert.equal(merged.product_category, 'Eatables');
  assert.equal(merged.standard_size, '');
});
