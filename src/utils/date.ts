export const fmtFecha = (isoLike?: string) => {
  if (!isoLike) return '';
  const d = new Date(isoLike.replace(' ', 'T'));
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};