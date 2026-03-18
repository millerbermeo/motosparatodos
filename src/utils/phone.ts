// src/utils/phone.ts

/**
 * Limpia un teléfono y deja solo números.
 * Retorna undefined si no es válido.
 */
export const sanitizePhone = (value: unknown): string | undefined => {
  const str = String(value ?? "").trim();

  // valores inválidos comunes
  if (!str || str === "0" || str === "-") return undefined;

  // deja solo números
  const digits = str.replace(/\D+/g, "");

  return digits || undefined;
};