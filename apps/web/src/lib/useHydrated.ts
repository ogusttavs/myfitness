'use client';

import { useEffect, useState } from 'react';

/** Retorna true após o primeiro render no cliente — evita SSR mismatch com stores persistidos. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
