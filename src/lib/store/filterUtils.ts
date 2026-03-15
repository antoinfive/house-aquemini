function hasMeaningfulFilterValue(value: unknown) {
  if (value == null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

export function normalizeFilters<T extends object>(filters: Partial<T>): T {
  const normalizedEntries = Object.entries(filters as Record<string, unknown>).filter(([, value]) =>
    hasMeaningfulFilterValue(value)
  );

  return Object.fromEntries(normalizedEntries) as T;
}

export function mergeFilters<T extends object>(
  current: T,
  updates: Partial<T>
): T {
  return normalizeFilters<T>({ ...current, ...updates });
}

export function filtersAreEqual<T extends object>(left: T, right: T) {
  return JSON.stringify(left) === JSON.stringify(right);
}
