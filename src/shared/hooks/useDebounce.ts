// src/shared/hooks/useDebounce.ts
import React from 'react';

// Devuelve `value` retrasado `delayMs` — mismo mecanismo de debounce que
// estaba copiado inline (useState + useEffect + setTimeout) en varios filtros.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
