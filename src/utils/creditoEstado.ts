// Estados de crédito en los que el wizard de registro pasa a solo lectura:
// se puede navegar y consultar toda la información, pero no editar/enviar nada.
// Aprobado NO entra aquí: en ese estado sí se puede seguir editando (ver
// ESTADOS_WIZARD_SIN_REVISION más abajo). Un crédito cerrado tampoco se
// puede editar, sin importar el estado.
export const ESTADOS_WIZARD_SOLO_LECTURA = ["Facturado", "En Facturación"] as const;

export const esWizardSoloLectura = (
  estado?: string | null,
  creditoCerrado?: number | string | boolean | null
): boolean =>
  (!!estado && (ESTADOS_WIZARD_SOLO_LECTURA as readonly string[]).includes(estado)) ||
  Number(creditoCerrado) === 1;

// Estados en los que sí se puede seguir editando el crédito, pero ya no debe
// poder enviarse de nuevo a "Revision" desde el último paso (Soportes).
export const ESTADOS_WIZARD_SIN_REVISION = ["Facturado", "Aprobado", "En Facturación"] as const;

export const esWizardSinRevision = (estado?: string | null): boolean =>
  !!estado && (ESTADOS_WIZARD_SIN_REVISION as readonly string[]).includes(estado);
