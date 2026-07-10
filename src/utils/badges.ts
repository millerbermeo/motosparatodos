// src/utils/badges.ts

export type BadgeInfo = { clase: string; texto: string };

// Badge "Sí"/"No" a partir de un booleano.
export const siNoBadge = (ok?: boolean): BadgeInfo => ({
  clase: `badge ${ok ? 'badge-success' : 'badge-error'} badge-sm font-medium`,
  texto: ok ? 'Sí' : 'No',
});

// Badge neutro (ghost) para mostrar un texto libre sin connotación positiva/negativa.
export const neutroBadge = (texto?: string, fallback = ''): BadgeInfo => ({
  clase: 'badge badge-ghost badge-sm font-medium',
  texto: texto ?? fallback,
});
