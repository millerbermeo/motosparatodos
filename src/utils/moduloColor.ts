// Colores de badge por módulo. Paleta fija para módulos conocidos y
// asignación estable por hash para cualquier otro, así el mismo módulo
// siempre conserva el mismo color en el panel y en el historial.

const PALETTE = [
  "bg-blue-50 text-blue-600 border border-blue-100",
  "bg-emerald-50 text-emerald-600 border border-emerald-100",
  "bg-violet-50 text-violet-600 border border-violet-100",
  "bg-amber-50 text-amber-600 border border-amber-100",
  "bg-rose-50 text-rose-600 border border-rose-100",
  "bg-cyan-50 text-cyan-600 border border-cyan-100",
  "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100",
  "bg-teal-50 text-teal-600 border border-teal-100",
  "bg-indigo-50 text-indigo-600 border border-indigo-100",
  "bg-orange-50 text-orange-600 border border-orange-100",
];

const FIJOS: Record<string, string> = {
  cotizaciones: "bg-blue-50 text-blue-600 border border-blue-100",
  creditos: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  solicitudes: "bg-violet-50 text-violet-600 border border-violet-100",
  clientes: "bg-amber-50 text-amber-600 border border-amber-100",
};

export const moduloBadgeClass = (modulo?: string): string => {
  const key = (modulo ?? "").trim().toLowerCase();
  if (!key) return "bg-slate-100 text-slate-500 border border-slate-200";
  if (FIJOS[key]) return FIJOS[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};
