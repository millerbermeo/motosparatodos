// src/utils/text.ts

type NormalizeOptions = {
  lower?: boolean;
  trim?: boolean;
  removeAccents?: boolean;
};

export const normalizarTexto = (
  valor: unknown,
  options: NormalizeOptions = {}
): string => {
  const {
    lower = true,
    trim = true,
    removeAccents = true,
  } = options;

  let result = String(valor ?? "");

  if (trim) result = result.trim();
  if (lower) result = result.toLowerCase();

  if (removeAccents) {
    result = result
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  return result;
};

// Comparar textos sin errores
export const sonIguales = (a: unknown, b: unknown): boolean => {
  return normalizarTexto(a) === normalizarTexto(b);
};

// Buscar texto sin importar tildes/mayúsculas
export const incluyeTexto = (texto: unknown, busqueda: string): boolean => {
  return normalizarTexto(texto).includes(normalizarTexto(busqueda));
};

// Validación tipo "sí"
export const esSi = (v: unknown): boolean => {
  const t = normalizarTexto(v);
  return t === "si" || t === "true" || t === "1";
};