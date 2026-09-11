export const EXTRACT_KEYS = [
  'product_item_id',
  'product_name',
  'product_category',
  'product_sub_category',
  'standard_size',
  'mrp',
  'mfd',
  'expiry_date',
] as const;

export type ExtractKey = (typeof EXTRACT_KEYS)[number];

export type ExtractedProduct = {
  product_item_id: string | number | null;
  product_name: string | null;
  product_category: string | null;
  product_sub_category: string | null;
  standard_size: string | null;
  mrp: string | number | null;
  mfd: string | null;
  expiry_date: string | null;
};

export type DraftExtractFields = Record<ExtractKey, string>;

export function emptyExtractFields(): DraftExtractFields {
  return {
    product_item_id: '',
    product_name: '',
    product_category: '',
    product_sub_category: '',
    standard_size: '',
    mrp: '',
    mfd: '',
    expiry_date: '',
  };
}

export function isBlank(value: unknown): boolean {
  if (value == null) {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isNaN(value);
  }
  return String(value).trim().length === 0;
}

export function asDraftString(value: unknown): string {
  if (isBlank(value)) {
    return '';
  }
  return String(value).trim();
}

export function pickExtractFields(input: Record<string, unknown>): DraftExtractFields {
  const next = emptyExtractFields();
  for (const key of EXTRACT_KEYS) {
    const value = input[key];
    next[key] = asDraftString(value);
  }
  return next;
}

/** Fill empty fields only. Never overwrite userEditedFields. */
export function mergeExtracted(
  current: DraftExtractFields,
  extracted: Partial<ExtractedProduct>,
  userEditedFields: string[],
): { merged: DraftExtractFields; warnings: string[] } {
  const edited = new Set(userEditedFields);
  const merged = { ...current };
  const warnings: string[] = [];

  for (const key of EXTRACT_KEYS) {
    if (edited.has(key)) {
      continue;
    }
    if (!isBlank(current[key])) {
      continue;
    }
    const incoming = asDraftString(extracted[key]);
    if (isBlank(incoming)) {
      continue;
    }
    merged[key] = incoming;
  }

  if (edited.has('product_name') && !isBlank(extracted.product_name)) {
    warnings.push('Kept your product name; Check did not overwrite it.');
  }

  return { merged, warnings };
}
