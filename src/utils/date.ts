// Formato global de fechas para toda la UI.
// Estándar: año-mes-día y, si aplica, hora en formato 12h con a. m./p. m.
// Ejemplo: 2026-06-14, 9:33 p. m.

const parseDate = (isoLike?: string | number | Date | null): Date | null => {
  if (isoLike === undefined || isoLike === null || isoLike === '') return null;
  const d =
    isoLike instanceof Date
      ? isoLike
      : new Date(typeof isoLike === 'string' ? isoLike.replace(' ', 'T') : isoLike);
  return isNaN(d.getTime()) ? null : d;
};

// Solo fecha: 2026-06-14
export const fmtFechaSolo = (isoLike?: string | number | Date | null): string => {
  const d = parseDate(isoLike);
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Solo hora 12h: 9:33 p. m.
export const fmtHora = (isoLike?: string | number | Date | null): string => {
  const d = parseDate(isoLike);
  if (!d) return '';
  return d.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Fecha + hora: 2026-06-14, 9:33 p. m.
export const fmtFecha = (isoLike?: string | number | Date | null): string => {
  const d = parseDate(isoLike);
  if (!d) return '';
  return `${fmtFechaSolo(d)}, ${fmtHora(d)}`;
};
