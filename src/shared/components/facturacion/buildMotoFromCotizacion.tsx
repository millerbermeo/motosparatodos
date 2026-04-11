export type MotoCot = {
  precioBase: number;
  precioDocumentos: number;
  descuentos: number;
  accesoriosYMarcacion: number;
  seguros: number;
  soat: number;
  matricula: number;
  impuestos: number;
  adicionalesTotal: number;
  totalSinSeguros: number;
  total: number;
  gpsValor?: number;
};

export const buildMotoFromCotizacion = (
  cot: any,
  lado: "A" | "B"
): MotoCot | undefined => {
  const suffix = lado === "A" ? "_a" : "_b";

  const marca = cot?.[`marca${suffix}`];
  const linea = cot?.[`linea${suffix}`];

  const hasCore =
    marca || linea || cot?.[`precio_base${suffix}`] || cot?.[`precio_total${suffix}`];

  if (!hasCore) return undefined;

  const precioBase = Number(cot?.[`precio_base${suffix}`]) || 0;
  const precioDocumentos = Number(cot?.[`precio_documentos${suffix}`]) || 0;

  const descuentos = Math.abs(Number(cot?.[`descuentos${suffix}`]) || 0);

  const accesorios = Number(cot?.[`accesorios${suffix}`]) || 0;
  const marcacion = Number(cot?.[`marcacion${suffix}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;
  const gpsValor = Number(cot?.[`valor_gps${suffix}`]) || 0;

  let seguros = 0;

  const segurosRaw = cot?.[`seguros${suffix}`];
  let jsonIncluyeOtros = false;

  if (typeof segurosRaw === "number") {
    seguros += segurosRaw;
  } else if (typeof segurosRaw === "string" && segurosRaw.trim()) {
    try {
      const arr = JSON.parse(segurosRaw);
      if (Array.isArray(arr)) {
        seguros += arr.reduce((acc, item) => {
          const nombre = String(item?.nombre ?? "").toLowerCase();
          if (nombre.includes("otros seguros")) jsonIncluyeOtros = true;
          const v = Number(item?.valor ?? 0);
          return acc + (Number.isFinite(v) ? v : 0);
        }, 0);
      }
    } catch {
      // ignore
    }
  }

  const otroSeguro = Number(cot?.[`otro_seguro${suffix}`]) || 0;
  if (!jsonIncluyeOtros) seguros += otroSeguro;

  const soat = Number(cot?.[`soat${suffix}`]) || 0;
  const matricula = Number(cot?.[`matricula${suffix}`]) || 0;
  const impuestos = Number(cot?.[`impuestos${suffix}`]) || 0;

  const isA = lado === "A";
  const adicionalesRunt = Number(cot?.[isA ? "runt_1" : "runt_2"]) || 0;
  const adicionalesLicencia = Number(cot?.[isA ? "licencia_1" : "licencia_2"]) || 0;
  const adicionalesDefensas = Number(cot?.[isA ? "defensas_1" : "defensas_2"]) || 0;
  const adicionalesHandSavers = Number(cot?.[isA ? "hand_savers_1" : "hand_savers_2"]) || 0;
  const adicionalesOtros = Number(cot?.[isA ? "otros_adicionales_1" : "otros_adicionales_2"]) || 0;

  const adicionalesTotal =
    Number(cot?.[isA ? "total_adicionales_1" : "total_adicionales_2"]) ||
    adicionalesRunt + adicionalesLicencia + adicionalesDefensas + adicionalesHandSavers + adicionalesOtros;

  const totalSinSeguros =
    Number(cot?.[`total_sin_seguros${suffix}`]) ||
    precioBase + precioDocumentos + accesoriosYMarcacion + adicionalesTotal - descuentos;

  const total =
    Number(cot?.[`precio_total${suffix}`]) || totalSinSeguros + seguros;

  return {
    precioBase,
    precioDocumentos,
    descuentos,
    accesoriosYMarcacion,
    seguros,
    soat,
    matricula,
    impuestos,
    adicionalesTotal,
    totalSinSeguros,
    total,
    gpsValor,
  };
};
