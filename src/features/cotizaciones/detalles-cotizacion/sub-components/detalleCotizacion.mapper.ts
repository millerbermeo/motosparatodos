// src/pages/cotizaciones/utils/detalleCotizacion.mapper.ts
import { fmtFecha } from '../../../../utils/date';
import { BASE_URL } from '../../../../utils/url';
import { aNumeroOUndefined } from '../../../../utils/number';
import type { Cotizacion, Cuotas, Motocicleta } from '../detallesCotizacion.type';
import { sanitizePhone } from '../../../../utils/phone';
import { normalizarTexto } from '../../../../utils/text';

export const buildImageUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const root = (BASE_URL || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};



export const buildFileUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const root = (BASE_URL || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};






export const buildMoto = (data: any, lado: 'A' | 'B'): Motocicleta | undefined => {
  const suffix = lado === 'A' ? '_a' : '_b';

  const marca = data?.[`marca${suffix}`];
  const linea = data?.[`linea${suffix}`];

  const hasCore =
    marca || linea || data?.[`precio_base${suffix}`] || data?.[`precio_total${suffix}`];

  if (!hasCore) return undefined;

  const modeloLabel = [marca, linea].filter(Boolean).join(' ').trim() || '—';
  const precioBase = Number(data?.[`precio_base${suffix}`]) || 0;
  const descuentos = Math.abs(Number(data?.[`descuentos${suffix}`]) || 0);
  const accesorios = Number(data?.[`accesorios${suffix}`]) || 0;
  const marcacion = Number(data?.[`marcacion${suffix}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;
  const otrosSeguros = Number(data?.[`otro_seguro${suffix}`]) || 0;
  const seguros = otrosSeguros;
  const soat = Number(data?.[`soat${suffix}`]) || 0;
  const matricula = Number(data?.[`matricula${suffix}`]) || 0;
  const impuestos = Number(data?.[`impuestos${suffix}`]) || 0;
  const precioDocumentos = soat + matricula + impuestos;

  const isA = lado === 'A';

  const adicionalesRunt = Number(data?.[isA ? "runt_1" : "runt_2"]) || 0;
  const adicionalesLicencia = Number(data?.[isA ? "licencia_1" : "licencia_2"]) || 0;
  const adicionalesDefensas = Number(data?.[isA ? "defensas_1" : "defensas_2"]) || 0;
  const adicionalesHandSavers = Number(data?.[isA ? "hand_savers_1" : "hand_savers_2"]) || 0;
  const adicionalesOtros = Number(data?.[isA ? "otros_adicionales_1" : "otros_adicionales_2"]) || 0;

  const adicionalesSum =
    adicionalesRunt +
    adicionalesLicencia +
    adicionalesDefensas +
    adicionalesHandSavers +
    adicionalesOtros;

  const adicionalesFromTotal = aNumeroOUndefined(
    data?.[isA ? "total_adicionales_1" : "total_adicionales_2"]
  );
  const adicionalesTotal = adicionalesFromTotal ?? adicionalesSum;

  const gpsMeses = data?.[`gps_meses${suffix}`] ?? null;
  const gpsValor = data?.[`valor_gps${suffix}`] ?? null;

  const garantiaStr = normalizarTexto(data?.[`garantia${suffix}`]);
  const garantia =
    garantiaStr === 'si' ||
    garantiaStr === 'sí' ||
    garantiaStr === 'true' ||
    garantiaStr === '1';

  const geMesesRaw = data?.[`garantia_extendida${suffix}`];
  const geValorRaw = data?.[`valor_garantia_extendida${suffix}`];

  const geMesesNorm = normalizarTexto(geMesesRaw);
  const garantiaExtendidaMeses =
    !geMesesNorm || geMesesNorm === 'no' ? null : (Number(geMesesRaw) || null);

  const garantiaExtendidaValor =
    garantiaExtendidaMeses ? (Number(geValorRaw) || 0) : 0;

  const polizaCodigo = data?.[`poliza${suffix}`] ?? null;
  const polizaValor = data?.[`valor_poliza${suffix}`] ?? null;
  const polizaValorNum = Number(polizaValor) || 0;

  const totalSinSeguros =
    (aNumeroOUndefined(data?.[`total_sin_seguros${suffix}`]) ??
      (precioBase +
        precioDocumentos +
        accesoriosYMarcacion +
        adicionalesTotal -
        descuentos +
        polizaValorNum +
        (garantiaExtendidaValor || 0) +
        (Number(gpsValor) || 0)));

  const total =
    (aNumeroOUndefined(data?.[`precio_total${suffix}`]) ?? (totalSinSeguros + seguros));

  const cuotas: Cuotas = {
    inicial: Number(data?.[`cuota_inicial${suffix}`]) || 0,
    meses6: aNumeroOUndefined(data?.[`cuota_6${suffix}`]),
    meses12: aNumeroOUndefined(data?.[`cuota_12${suffix}`]),
    meses18: aNumeroOUndefined(data?.[`cuota_18${suffix}`]),
    meses24: aNumeroOUndefined(data?.[`cuota_24${suffix}`]),
    meses30: aNumeroOUndefined(data?.[`cuota_30${suffix}`]),
    meses36: aNumeroOUndefined(data?.[`cuota_36${suffix}`]),
  };

  const saldoFinanciar = Math.max(total - (cuotas.inicial || 0), 0);

  return {
    modelo: modeloLabel,
    precioBase,
    precioDocumentos,
    descuentos,
    accesoriosYMarcacion,
    seguros,
    garantia,
    garantiaExtendidaMeses,
    garantiaExtendidaValor,
    totalSinSeguros,
    total,
    cuotas,
    lado,
    soat,
    matricula,
    impuestos,
    adicionalesRunt,
    adicionalesLicencia,
    adicionalesDefensas,
    adicionalesHandSavers,
    adicionalesOtros,
    adicionalesTotal,
    saldoFinanciar,
    otrosSeguros,
    gpsMeses,
    gpsValor,
    polizaCodigo: polizaCodigo ? String(polizaCodigo) : null,
    polizaValor: polizaValor !== null && polizaValor !== undefined ? Number(polizaValor) : null,
  };
};

export const mapApiToCotizacion = (data: any): Cotizacion => {
  const nombres = [data?.name, data?.s_name].filter(Boolean).join(' ').trim() || '—';
  const apellidos = [data?.last_name, data?.s_last_name].filter(Boolean).join(' ').trim() || undefined;
  const email = data?.email && data.email !== '0' ? String(data.email) : undefined;
  const celular = sanitizePhone(data?.celular ?? data?.cel ?? data?.telefono ?? data?.phone);
  const comentario = data?.comentario && data.comentario !== '' ? String(data.comentario) : undefined;
  const comentario2 = data?.comentario2 && data.comentario2 !== '' ? String(data.comentario2) : undefined;
  const cedula = data?.cedula || undefined;

  const telAsesor = sanitizePhone(data?.telefono_asesor);

  const comercial = {
    asesor: data?.asesor || undefined,
    canal_contacto: data?.canal_contacto || undefined,
    financiera: data?.financiera ?? null,
    tipo_pago: data?.tipo_pago ?? data?.metodo_pago ?? null,
    prospecto: data?.prospecto ?? null,
    pregunta: data?.pregunta ?? null,
    telefono_asesor: telAsesor,
  };

  const motoA = buildMoto(data, 'A');
  const motoB = buildMoto(data, 'B');

  const estadoNombre =
    typeof data?.estado === 'string' && data.estado.trim()
      ? String(data.estado).trim()
      : 'Sin estado';

  const creada = fmtFecha(data?.fecha_creacion);

  const actividad = [
    {
      fecha: fmtFecha(data?.fecha_actualizacion),
      titulo: 'Actualización de cotización',
      etiqueta: data?.estado || 'Sin estado',
      color: 'info',
    },
    {
      fecha: fmtFecha(data?.fecha_creacion),
      titulo: 'Se crea la cotización',
      etiqueta: data?.estado || 'Sin estado',
      color: 'warning',
    },
  ];

  return {
    id: String(data?.id ?? ''),
    estado: estadoNombre,
    creada,
    cliente: { nombres, apellidos, email, celular, comentario, comentario2, cedula },
    comercial,
    motoA,
    motoB,
    actividad,
  };
};