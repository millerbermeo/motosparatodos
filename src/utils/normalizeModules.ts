// utils/normalizeModules.ts
export function normalizeModules(mods: string[] | string | null | undefined): string[] {
  const clean = (s: string) =>
    s
      .trim()
      // quita comillas sobrantes
      .replace(/^['"]+|['"]+$/g, "")
      // colapsa espacios internos
      .replace(/\s+/g, " ")
      // normaliza tildes unicode por si acaso
      .normalize("NFC");

  if (Array.isArray(mods)) {
    return Array.from(new Set(mods.map(clean).filter(Boolean)));
  }

  if (typeof mods !== "string" || !mods.trim()) return [];

  const raw = mods.trim();

  // 1) Intento JSON.parse directo
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.map(clean).filter(Boolean)));
    }
  } catch {
    // seguimos al plan B
  }

  // 2) Arreglo rápido de errores comunes:
  // - Falta una comilla antes de una palabra al interior de un array-string
  // - Corchetes de apertura/cierre
  // - Comillas desbalanceadas
  let repaired = raw;

  // quita corchetes exteriores si existen
  repaired = repaired.replace(/^\s*\[|\]\s*$/g, "");

  // añade comillas faltantes en segmentos que empiezan sin comilla y terminan con comilla
  // ej:  ..., Parametrizaciones", ...
  repaired = repaired.replace(/(^|,)\s*([^",][^,]*?)"\s*(?=,|$)/g, (_m, pre, word) => {
    return `${pre} "${word.trim()}"`;
  });

  // ahora split por comas y limpia cada item
  const parts = repaired
    .split(",")
    .map(clean)
    .filter(Boolean);

  // dedup
  return Array.from(new Set(parts));
}
