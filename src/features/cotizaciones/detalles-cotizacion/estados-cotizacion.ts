export const estadoBadgeClass = (estado?: string) => {
  switch (estado) {
    case 'Continúa interesado':
    case 'Alto interés':
      return 'badge-warning';
    case 'Solicitar facturación':
    case 'Solicitar crédito':
      return 'badge-success';
    case 'Solicitar crédito express':
      return 'badge-info';
    case 'Sin interés':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
};