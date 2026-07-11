// Estados de crédito en los que el wizard de registro pasa a solo lectura:
// se puede navegar y consultar toda la información, pero no editar/enviar nada.
export const ESTADOS_WIZARD_SOLO_LECTURA = ["Facturado", "Aprobado", "En Facturación"] as const;

export const esWizardSoloLectura = (estado?: string | null): boolean =>
  !!estado && (ESTADOS_WIZARD_SOLO_LECTURA as readonly string[]).includes(estado);
