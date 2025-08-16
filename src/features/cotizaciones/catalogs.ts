import type { SeguroKey } from "./types";

export const canales = ["", "Presencial", "Teléfono", "WhatsApp", "Instagram", "Facebook", "Web"];

export const categoriasRelacion = [
  "",
  "No me interesan",
  "Me gustan las motos",
  "Estoy cotizando",
  "Quiero comprar pronto",
];

export const marcas = ["", "HONDA", "YAMAHA", "SUZUKI", "BAJAJ"];

export const modelosPorMarca: Record<string, Array<{ value: string; label: string; precio: number }>> = {
  "": [{ value: "", label: "Seleccione...", precio: 0 }],
  HONDA: [
    { value: "", label: "Seleccione...", precio: 0 },
    { value: "DIO LED STD 2024", label: "DIO LED STD 2024 - 7.445.000 COP", precio: 7_445_000 },
    { value: "CB125F", label: "CB125F - 7.990.000 COP", precio: 7_990_000 },
  ],
  YAMAHA: [
    { value: "", label: "Seleccione...", precio: 0 },
    { value: "FZ 2.0", label: "FZ 2.0 - 8.600.000 COP", precio: 8_600_000 },
  ],
  SUZUKI: [{ value: "", label: "Seleccione...", precio: 0 }],
  BAJAJ: [{ value: "", label: "Seleccione...", precio: 0 }],
};

export const SEGUROS_CATALOGO: Record<SeguroKey, { label: string; valor: number }> = {
  vidaClasicoAnual: { label: "Seguro Vida - Combo clásico 1 año", valor: 67_200 },
  mascotasSemestral: { label: "Seguro Mascotas - Semestral", valor: 50_000 },
  mascotasAnual: { label: "Seguro Mascotas - Anual", valor: 85_000 },
};
