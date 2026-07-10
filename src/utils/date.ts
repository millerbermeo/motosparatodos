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

type TimeAgoOptions = {
  // Muestra "hace N semanas" antes de caer a días. Por defecto no.
  includeWeeks?: boolean;
  // Texto cuando no se recibe fecha.
  emptyFallback?: string;
  // Texto (o función sobre el string crudo) cuando la fecha no se puede parsear.
  invalidFallback?: string | ((raw: string) => string);
};

// Relativo: "hace X minutos/horas/días[/semanas]". Backend envía "YYYY-MM-DD HH:mm:ss".
export const timeAgo = (
  dateStr?: string | null,
  options?: TimeAgoOptions
): string => {
  const {
    includeWeeks = false,
    emptyFallback = '—',
    invalidFallback = '—',
  } = options ?? {};

  if (!dateStr) return emptyFallback;

  const d = new Date(String(dateStr).replace(' ', 'T'));
  if (isNaN(d.getTime())) {
    return typeof invalidFallback === 'function' ? invalidFallback(dateStr) : invalidFallback;
  }

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return 'justo ahora';

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  const weeks = Math.floor(days / 7);

  if (includeWeeks && weeks > 0) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hrs > 0) return `hace ${hrs} hora${hrs > 1 ? 's' : ''}`;
  if (min > 0) return `hace ${min} minuto${min > 1 ? 's' : ''}`;
  return 'justo ahora';
};
