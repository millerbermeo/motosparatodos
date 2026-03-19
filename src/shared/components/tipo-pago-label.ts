import type { MetodoPago } from "../../features/cotizaciones/types";

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
    contado: "Contado",
    credibike: "Credito directo",
    terceros: "Credito de terceros",
};
