// src/pages/DetalleCambiarEstado.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCotizacionById } from '../../services/cotizacionesServices';
import { api } from '../../services/axiosInstance';
import Swal from 'sweetalert2';
import { UserRound, CalendarDays, Mail, Phone, BadgeInfo, Bike } from 'lucide-react';
import ButtonLink from '../../shared/components/ButtonLink';
import { useLoaderStore } from '../../store/loader.store';
import { useAuthStore } from '../../store/auth.store';

/* =======================
   Helpers
   ======================= */
const safeText = (v: any) => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  if (!s || s === '0') return undefined;
  return s;
};

const normalizeLower = (v: any) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const fullName = (r: any) =>
  [r?.name, r?.s_name, r?.last_name, r?.s_last_name]
    .map(safeText)
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || '—';

// "YYYY-MM-DD HH:mm:ss" → local es-CO
const fmtFecha = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const fmtCOP = (v: any) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
    Number(v || 0)
  );

const estadoBadgeClass = (estado?: string) => {
  switch (estado) {
    case 'Continúa interesado':
    case 'Alto interés':
      return 'badge-warning';
    case 'Solicitar facturación':
    case 'Solicitar crédito':
      return 'badge-success';
    case 'Solicitar crédito express':
      return 'badge-info';
    case 'Sin interés':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
};

const numOrUndef = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/* =======================
   Tipo de pago / estados
   ======================= */
const tipoPagoLabel = (row: any) =>
  (safeText(row?.tipo_pago) || safeText(row?.metodo_pago) || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

const esCreditoDirecto = (row: any) => tipoPagoLabel(row) === 'credito directo';

const opcionesEstados = (row: any): any[] => {
  const soloCreditoEnDirecto = esCreditoDirecto(row);
  return [
    { value: '3', label: 'Continúa interesado' },
    { value: '4', label: 'Alto interés' },
    soloCreditoEnDirecto ? { value: '5', label: 'Solicitar crédito' } : { value: '6', label: 'Solicitar facturación' },
    { value: '7', label: 'Solicitar crédito express' },
    { value: '2', label: 'Sin interés' },
  ];
};

/* =======================
   Motos helpers
   ======================= */
const hasMoto = (row: any, side: 'a' | 'b') => {
  return (
    safeText(row?.[`marca_${side}`]) ||
    safeText(row?.[`linea_${side}`]) ||
    Number(row?.[`precio_base_${side}`]) ||
    Number(row?.[`precio_total_${side}`])
  );
};

const modeloMoto = (row: any, side: 'a' | 'b') =>
  [safeText(row?.[`marca_${side}`]), safeText(row?.[`linea_${side}`])].filter(Boolean).join(' ').trim() || '—';

const marcaMoto = (row: any, side: 'a' | 'b') => safeText(row?.[`marca_${side}`]) || '—';
const lineaMoto = (row: any, side: 'a' | 'b') => safeText(row?.[`linea_${side}`]) || '—';
const anioModeloMoto = (row: any, side: 'a' | 'b') => safeText(row?.[`modelo_${side}`]) || '—';

const garantiaTexto = (row: any, side: 'a' | 'b') => {
  const base = String(row?.[`garantia_${side}`] ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const ext = String(row?.[`garantia_extendida_${side}`] ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  const baseSi = base === 'si' || base === 'sí' || base === 'true' || base === '1';
  const extSi = ext === 'si' || ext === 'sí' || ext === 'true' || ext === '1';

  if (baseSi && extSi) return 'Garantía de fábrica + extendida';
  if (baseSi) return 'Garantía de fábrica';
  if (extSi) return 'Garantía extendida';
  return 'Sin garantía adicional';
};

/* =======================
   ✅ Adicionales: lee TODOS los formatos sin perder datos
   - Formato A: valorRunt1/2, valorLicencia1/2, ...
   - Formato B: runt_1/_2, licencia_1/_2, ...
   ======================= */
type Adicionales = {
  runt: number;
  licencia: number;
  defensas: number;
  handSavers: number;
  otros: number;
  total: number;
};

const adicionalesMotoCompleto = (row: any, side: 'a' | 'b'): Adicionales => {
  const isA = side === 'a';
  const suf = isA ? '_1' : '_2';

  // Formato B (tu función original / backend viejo)
  const b_runt = Number(row?.[`runt${suf}`]) || 0;
  const b_licencia = Number(row?.[`licencia${suf}`]) || 0;
  const b_defensas = Number(row?.[`defensas${suf}`]) || 0;
  const b_handSavers = Number(row?.[`hand_savers${suf}`]) || 0;
  const b_otros = Number(row?.[`otros_adicionales${suf}`]) || 0;
  const b_total = Number(row?.[`total_adicionales${suf}`]) || 0;

  // Formato A (DetalleCotizacion / backend nuevo)
  const a_runt = Number(row?.[isA ? 'valorRunt1' : 'valorRunt2']) || 0;
  const a_licencia = Number(row?.[isA ? 'valorLicencia1' : 'valorLicencia2']) || 0;
  const a_defensas = Number(row?.[isA ? 'valorDefensas1' : 'valorDefensas2']) || 0;
  const a_handSavers = Number(row?.[isA ? 'valorHandSavers1' : 'valorHandSavers2']) || 0;
  const a_otros = Number(row?.[isA ? 'valorOtrosAdicionales1' : 'valorOtrosAdicionales2']) || 0;

  // Preferencia: si el formato A trae algo (>0), úsalo; si no, usa formato B
  const runt = a_runt > 0 ? a_runt : b_runt;
  const licencia = a_licencia > 0 ? a_licencia : b_licencia;
  const defensas = a_defensas > 0 ? a_defensas : b_defensas;
  const handSavers = a_handSavers > 0 ? a_handSavers : b_handSavers;
  const otros = a_otros > 0 ? a_otros : b_otros;

  // Total:
  // - si viene total del formato B úsalo (porque a veces backend lo manda ya sumado)
  // - si no, calcula suma segura
  const total = b_total > 0 ? b_total : runt + licencia + defensas + handSavers + otros;

  return { runt, licencia, defensas, handSavers, otros, total };
};

/* =======================
   Seguros JSON
   ======================= */
const sumSegurosFromJson = (raw: unknown): number | undefined => {
  try {
    if (Array.isArray(raw)) {
      return raw.reduce((acc, it: any) => acc + (Number(it?.valor) || 0), 0);
    }
    if (typeof raw === 'string') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.reduce((acc, it: any) => acc + (Number(it?.valor) || 0), 0);
      }
    }
  } catch {
    // ignore
  }
  return undefined;
};

type MotoCalc = {
  precioBase: number;
  precioDocumentos: number;
  accesoriosYMarcacion: number;
  descuentos: number;
  seguros: number;
  garantia: boolean;
  totalSinSeguros: number;
  total: number;
  cuotaInicial: number;
  saldoFinanciar: number;

  soat: number;
  matricula: number;
  impuestos: number;

  gpsMeses: string | null;
  gpsValor: number;

  bonoEnsambladora: number;
};

// ✅ buildMotoCalc intacto
const buildMotoCalc = (row: any, side: 'a' | 'b'): MotoCalc => {
  const sfx = `_${side}`;

  const precioBase = Number(row?.[`precio_base${sfx}`]) || 0;
  const precioDocumentos = Number(row?.[`precio_documentos${sfx}`]) || 0;

  const accesorios = Number(row?.[`accesorios${sfx}`]) || 0;
  const marcacion = Number(row?.[`marcacion${sfx}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;

  const descuentos = Number(row?.[`descuentos${sfx}`]) || 0;

  const segurosJson = row?.[`seguros${sfx}`];
  const segurosFromJson = sumSegurosFromJson(segurosJson);
  const seguros =
    typeof segurosFromJson === 'number'
      ? segurosFromJson
      : (Number(row?.[`seguro_vida${sfx}`]) || 0) +
        (Number(row?.[`seguro_mascota_s${sfx}`]) || 0) +
        (Number(row?.[`seguro_mascota_a${sfx}`]) || 0) +
        (Number(row?.[`otro_seguro${sfx}`]) || 0);

  const gStr = String(row?.[`garantia${sfx}`] ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const garantia = gStr === 'si' || gStr === 'sí' || gStr === 'true' || gStr === '1';

  const soat = Number(row?.[`soat${sfx}`]) || 0;
  const matricula = Number(row?.[`matricula${sfx}`]) || 0;
  const impuestos = Number(row?.[`impuestos${sfx}`]) || 0;

  const gpsMesesRaw = row?.[`gps_meses${sfx}`];
  const gpsMeses =
    gpsMesesRaw === null || gpsMesesRaw === undefined || String(gpsMesesRaw).trim() === ''
      ? null
      : String(gpsMesesRaw).trim().toLowerCase() === 'no'
      ? 'no'
      : String(gpsMesesRaw).trim();

  const gpsValor = Number(row?.[`valor_gps${sfx}`]) || 0;

  const bonoEnsambladora = Number(row?.[`bono_ensambladora${sfx}`]) || 0;

  const totalSinSeguros =
    Number(row?.[`total_sin_seguros${sfx}`]) ||
    (precioBase + precioDocumentos + accesoriosYMarcacion - descuentos - bonoEnsambladora);

  const total = Number(row?.[`precio_total${sfx}`]) || totalSinSeguros + seguros;

  const cuotaInicial = Number(row?.[`cuota_inicial${sfx}`]) || 0;

  const saldoFinanciarBase = Number(row?.[`saldo_financiar${sfx}`]) || 0;
  const saldoFinanciarCalculado = Math.max(total - (cuotaInicial || 0), 0);
  const saldoFinanciar = saldoFinanciarBase > 0 ? saldoFinanciarBase : saldoFinanciarCalculado;

  return {
    precioBase,
    precioDocumentos,
    accesoriosYMarcacion,
    descuentos,
    seguros,
    garantia,
    totalSinSeguros,
    total,
    cuotaInicial,
    saldoFinanciar,
    soat,
    matricula,
    impuestos,
    gpsMeses,
    gpsValor,
    bonoEnsambladora,
  };
};

/* =======================
   ✅ UI builder (solo para mostrar)
   ======================= */
type MotoUI = {
  modelo: string;

  // costos base
  precioBase: number;
  precioDocumentos: number;
  soat: number;
  matricula: number;
  impuestos: number;

  accesoriosYMarcacion: number;
  descuentos: number;

  // adicionales completos (sin omitir nada)
  adicionales: Adicionales;

  // póliza / garantía extendida (si existen)
  polizaCodigo: string | null;
  polizaValor: number;
  garantiaExtendidaMeses: number | null;
  garantiaExtendidaValor: number;

  // gps
  gpsMeses: any;
  gpsValor: number;

  // bono
  bonoEnsambladora: number;

  // seguros
  otrosSeguros: number;
  seguros: number;

  // totales
  totalSinSeguros: number;
  total: number;

  // cuotas
  cuotaInicial: number;
  saldoFinanciar: number;
  cuotas: {
    meses6?: number;
    meses12?: number;
    meses18?: number;
    meses24?: number;
    meses30?: number;
    meses36?: number;
  };
};

const buildMotoUI = (row: any, side: 'a' | 'b'): MotoUI => {
  const sfx = `_${side}`;

  const precioBase = Number(row?.[`precio_base${sfx}`]) || 0;

  const soat = Number(row?.[`soat${sfx}`]) || 0;
  const matricula = Number(row?.[`matricula${sfx}`]) || 0;
  const impuestos = Number(row?.[`impuestos${sfx}`]) || 0;

  const precioDocumentosRaw = Number(row?.[`precio_documentos${sfx}`]) || 0;
  const precioDocumentos = precioDocumentosRaw > 0 ? precioDocumentosRaw : soat + matricula + impuestos;

  const accesorios = Number(row?.[`accesorios${sfx}`]) || 0;
  const marcacion = Number(row?.[`marcacion${sfx}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;

  const descuentos = Number(row?.[`descuentos${sfx}`]) || 0;

  const adicionales = adicionalesMotoCompleto(row, side);

  const otrosSeguros = Number(row?.[`otro_seguro${sfx}`]) || 0;

  const segurosJson = row?.[`seguros${sfx}`];
  const segurosFromJson = sumSegurosFromJson(segurosJson);
  const seguros =
    typeof segurosFromJson === 'number'
      ? segurosFromJson
      : (Number(row?.[`seguro_vida${sfx}`]) || 0) +
        (Number(row?.[`seguro_mascota_s${sfx}`]) || 0) +
        (Number(row?.[`seguro_mascota_a${sfx}`]) || 0) +
        (Number(row?.[`otro_seguro${sfx}`]) || 0);

  const polizaCodigoRaw = row?.[`poliza${sfx}`] ?? null;
  const polizaCodigo = polizaCodigoRaw ? String(polizaCodigoRaw).trim() : null;
  const polizaValor = Number(row?.[`valor_poliza${sfx}`]) || 0;

  const geMesesRaw = row?.[`garantia_extendida${sfx}`];
  const geValorRaw = row?.[`valor_garantia_extendida${sfx}`];

  const geMesesNorm = normalizeLower(geMesesRaw);
  const garantiaExtendidaMeses = !geMesesNorm || geMesesNorm === 'no' ? null : Number(geMesesRaw) || null;
  const garantiaExtendidaValor = garantiaExtendidaMeses ? Number(geValorRaw) || 0 : 0;

  const gpsMeses = row?.[`gps_meses${sfx}`] ?? null;
  const gpsValor = Number(row?.[`valor_gps${sfx}`]) || 0;

  const bonoEnsambladora = Number(row?.[`bono_ensambladora${sfx}`]) || 0;

  const totalSinSeguros =
    Number(row?.[`total_sin_seguros${sfx}`]) ||
    (precioBase +
      precioDocumentos +
      accesoriosYMarcacion +
      (adicionales?.total || 0) -
      descuentos -
      bonoEnsambladora +
      (polizaValor || 0) +
      (garantiaExtendidaValor || 0) +
      (Number(gpsValor) || 0));

  const total = Number(row?.[`precio_total${sfx}`]) || totalSinSeguros + seguros;

  const cuotaInicial = Number(row?.[`cuota_inicial${sfx}`]) || 0;
  const saldoFinanciar = Math.max(total - (cuotaInicial || 0), 0);

  const cuotas = {
    meses6: numOrUndef(row?.[`cuota_6${sfx}`]),
    meses12: numOrUndef(row?.[`cuota_12${sfx}`]),
    meses18: numOrUndef(row?.[`cuota_18${sfx}`]),
    meses24: numOrUndef(row?.[`cuota_24${sfx}`]),
    meses30: numOrUndef(row?.[`cuota_30${sfx}`]),
    meses36: numOrUndef(row?.[`cuota_36${sfx}`]),
  };

  return {
    modelo: modeloMoto(row, side),
    precioBase,
    precioDocumentos,
    soat,
    matricula,
    impuestos,
    accesoriosYMarcacion,
    descuentos,
    adicionales,
    polizaCodigo,
    polizaValor,
    garantiaExtendidaMeses,
    garantiaExtendidaValor,
    gpsMeses,
    gpsValor,
    bonoEnsambladora,
    otrosSeguros,
    seguros,
    totalSinSeguros,
    total,
    cuotaInicial,
    saldoFinanciar,
    cuotas,
  };
};

/* =======================
   Payload para /solicitudes/:id
   ======================= */
const buildSolicitudState = (row: any) => {
  const safe = (v: any) => (v === null || v === undefined ? '' : String(v).trim());

  const clienteForForm = {
    primerNombre: safe(row?.name),
    segundoNombre: safe(row?.s_name),
    primerApellido: safe(row?.last_name),
    segundoApellido: safe(row?.s_last_name),
    numeroDocumento: safe(row?.cedula),
    numeroCelular: safe(row?.celular),
    fechaNacimiento: safe(row?.fecha_nacimiento).slice(0, 10),
    ciudadResidencia: safe(row?.ciudad),
    direccionResidencia: safe(row?.direccion),
  };

  const showA = hasMoto(row, 'a');
  const showB = hasMoto(row, 'b');

  const motoA = showA
    ? {
        modelo: modeloMoto(row, 'a'),
        ...buildMotoCalc(row, 'a'),
        foto: safe(row?.foto_a) || undefined,
        marca: safe(row?.marca_a) || undefined,
        linea: safe(row?.linea_a) || undefined,
        garantiaExtendidaMeses: Number(row?.garantia_extendida_a) || undefined,
      }
    : null;

  const motoB = showB
    ? {
        modelo: modeloMoto(row, 'b'),
        ...buildMotoCalc(row, 'b'),
        foto: safe(row?.foto_b) || undefined,
        marca: safe(row?.marca_b) || undefined,
        linea: safe(row?.linea_b) || undefined,
        garantiaExtendidaMeses: Number(row?.garantia_extendida_b) || undefined,
      }
    : null;

  const comercial = {
    asesor: safe(row?.asesor) || undefined,
    tipo_pago: safe(row?.tipo_pago) || safe(row?.metodo_pago) || undefined,
    financiera: safe(row?.financiera) || undefined,
    canal_contacto: safe(row?.canal_contacto) || undefined,
    pregunta: safe(row?.pregunta) || undefined,
    prospecto: safe(row?.prospecto) || undefined,
  };

  return {
    cotizacionId: Number(row?.id) || undefined,
    clienteForForm,
    motos: { A: motoA, B: motoB },
    comercial,
    raw: row,
  };
};

/* =======================
   Componente
   ======================= */
const DetalleCambiarEstado: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useCotizacionById(id);

  const row = (data as any)?.data ?? data;
  const opts = React.useMemo(() => opcionesEstados(row), [row]);

  const [estadoNombre, setEstadoNombre] = React.useState<string>('');
  const [comentario2, setComentario2] = React.useState<string>('');
  const [loading, setLoading] = useState(false);
  const [motoSeleccion, setMotoSeleccion] = React.useState<'' | 'A' | 'B'>('');

  React.useEffect(() => {
    if (isLoading) return;
    if (!row || !id) return;

    const isState = Number((row as any).is_state ?? 0);
    if (isState === 1) {
      Swal.fire({
        icon: 'info',
        title: 'Ya solicitada la facturación',
        text: 'Te llevaremos al detalle de la solicitud.',
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        navigate(`/solicitudes/${id}`, {
          state: buildSolicitudState(row),
        });
      });
    }
  }, [row, id, isLoading, navigate]);

  React.useEffect(() => {
    if (!row) return;
    const preEstado = typeof row?.estado === 'string' ? row.estado.trim() : '';
    const labelsValidos = new Set(opcionesEstados(row).map((o) => o.label));
    setEstadoNombre(preEstado && labelsValidos.has(preEstado) ? preEstado : '');
    setComentario2(safeText(row?.comentario2) || '');
  }, [row]);

  const user = useAuthStore((s) => s.user);

  const esSolicitarCredito = (s?: string) =>
    (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase() === 'solicitar credito';

  const esSolicitarCreditoExpress = (s?: string) =>
    (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase() === 'solicitar credito express';

  const esSolicitarFacturacion = (s?: string) =>
    (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase() === 'solicitar facturacion';

  const requiereSeleccionMoto = (s?: string) =>
    esSolicitarFacturacion(s) || esSolicitarCredito(s) || esSolicitarCreditoExpress(s);

  React.useEffect(() => {
    if (!row) return;
    if (requiereSeleccionMoto(estadoNombre)) {
      const tieneA = hasMoto(row, 'a');
      const tieneB = hasMoto(row, 'b');
      if (tieneA) setMotoSeleccion('A');
      else if (tieneB) setMotoSeleccion('B');
      else setMotoSeleccion('');
    } else {
      setMotoSeleccion('');
    }
  }, [estadoNombre, row]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    if (!estadoNombre) {
      Swal.fire({ icon: 'warning', title: 'Selecciona un estado' });
      return;
    }

    const tieneA = hasMoto(row, 'a');
    const tieneB = hasMoto(row, 'b');
    const hayMotos = tieneA || tieneB;

    if (requiereSeleccionMoto(estadoNombre) && hayMotos && !motoSeleccion) {
      Swal.fire({ icon: 'warning', title: 'Selecciona la motocicleta' });
      return;
    }

    const safe = (v: any) => (v === null || v === undefined ? '' : String(v).trim());
    const motoSel =
      motoSeleccion === 'A'
        ? {
            modelo: modeloMoto(row, 'a'),
            ...buildMotoCalc(row, 'a'),
            foto: safe(row?.foto_a) || undefined,
            marca: safe(row?.marca_a) || undefined,
            linea: safe(row?.linea_a) || undefined,
            garantiaExtendidaMeses: Number(row?.garantia_extendida_a) || undefined,
          }
        : motoSeleccion === 'B'
        ? {
            modelo: modeloMoto(row, 'b'),
            ...buildMotoCalc(row, 'b'),
            foto: safe(row?.foto_b) || undefined,
            marca: safe(row?.marca_b) || undefined,
            linea: safe(row?.linea_b) || undefined,
            garantiaExtendidaMeses: Number(row?.garantia_extendida_b) || undefined,
          }
        : null;

    if (esSolicitarFacturacion(estadoNombre)) {
      await Swal.fire({
        icon: 'info',
        title: 'Abrir solicitud de facturación',
        text: 'Te llevaremos al registro para facturar.',
        timer: 1200,
        showConfirmButton: false,
      });

      navigate(`/solicitudes/${id}`, {
        state: {
          ...buildSolicitudState(row),
          motoSeleccion,
          motos: { seleccionada: motoSel },
        },
      });
      return;
    }

    const requiereComentario = !requiereSeleccionMoto(estadoNombre);
    if (requiereComentario && !comentario2.trim()) {
      Swal.fire({ icon: 'warning', title: 'Escribe un comentario' });
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        id: Number(id),
        estado: estadoNombre,
        comentario2: requiereComentario ? comentario2.trim() : '',
        nombre_usuario: user?.name || 'Desconocido',
        rol_usuario: user?.rol || 'Usuario',
      };

      if (requiereSeleccionMoto(estadoNombre)) {
        payload.moto_seleccion = motoSeleccion || null;
        payload.moto_detalle = motoSel;
      }

      const resp = await api.put('/actualizar_cotizacion.php', payload);

      const codigoCredito: string | undefined = resp?.data?.codigo_credito ?? resp?.data?.data?.codigo_credito;

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `Nuevo estado: ${estadoNombre}`,
        timer: 1400,
        showConfirmButton: false,
      });

      if ((esSolicitarCredito(estadoNombre) || esSolicitarCreditoExpress(estadoNombre)) && codigoCredito) {
        navigate(`/creditos/registrar/${encodeURIComponent(codigoCredito)}`, {
          state: { motoSeleccion, motoDetalle: motoSel },
        });
      } else {
        navigate('/cotizaciones');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'No se pudo actualizar el estado.';
      Swal.fire({ icon: 'error', title: 'Error', text: String(msg) });
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <span>
            Falta el parámetro <code>id</code> en la URL. Debe ser <code>/cotizaciones/:id</code>
          </span>
        </div>
      </main>
    );
  }

  const { show, hide } = useLoaderStore();
  React.useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  if (error) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-lg">
          <span>Hubo un problema cargando la cotización #{id}.</span>
        </div>
      </main>
    );
  }

  if (!row) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-info max-w-lg">
          <span>No se encontró información para la cotización #{id}.</span>
        </div>
      </main>
    );
  }

  const nombres = fullName(row);
  const apellidos = [safeText(row?.last_name), safeText(row?.s_last_name)].filter(Boolean).join(' ') || '—';
  const email = safeText(row?.email) || '—';
  const telefono = safeText((row as any)?.celular) || '—';
  const estadoActual = safeText(row?.estado) || 'Sin estado';
  const creada = fmtFecha(row?.fecha_creacion);

  const showMotoA = hasMoto(row, 'a');
  const showMotoB = hasMoto(row, 'b');

  // ✅ UI (para mostrar) + buildMotoCalc (para submit)
  const motoA = showMotoA ? buildMotoUI(row, 'a') : undefined;
  const motoB = showMotoB ? buildMotoUI(row, 'b') : undefined;

  const motoOptions: Array<{ key: 'A' | 'B'; label: string }> = [];
  if (showMotoA) motoOptions.push({ key: 'A', label: modeloMoto(row, 'a') });
  if (showMotoB) motoOptions.push({ key: 'B', label: modeloMoto(row, 'b') });

  // Etiquetas GPS (igual que tu lógica)
  const gpsLabel = (gpsMeses: any) => {
    if (gpsMeses === null || gpsMeses === undefined || String(gpsMeses).trim() === '') return 'No aplica';
    const v = normalizeLower(gpsMeses);
    if (v === 'no' || v === '0') return 'No';
    if (v === 'si' || v === 'sí') return 'Sí';
    return `${gpsMeses} meses`;
  };

  const gpsValorLabel = (gpsMeses: any, gpsValor: any) => {
    if (gpsMeses === null || gpsMeses === undefined || String(gpsMeses).trim() === '') return '—';
    const v = normalizeLower(gpsMeses);
    if (v === 'no' || v === '0') return fmtCOP(0);
    return fmtCOP(Number(gpsValor ?? 0));
  };

  const renderCuotas = (m: MotoUI) => {
    const rows: Array<{ label: string; value?: number }> = [
      { label: '6 cuotas', value: m.cuotas.meses6 },
      { label: '12 cuotas', value: m.cuotas.meses12 },
      { label: '18 cuotas', value: m.cuotas.meses18 },
      { label: '24 cuotas', value: m.cuotas.meses24 },
      { label: '30 cuotas', value: m.cuotas.meses30 },
      { label: '36 cuotas', value: m.cuotas.meses36 },
    ].filter((r) => typeof r.value === 'number');

    if (!rows.length) return null;

    return (
      <div className="overflow-x-auto mt-3">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Plazo</th>
              <th className="text-right">Valor cuota</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td className="text-right">{fmtCOP(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="w-full min-h-screen px-4 md:px-6 pb-6">
      <section className="w-full mb-6">
        <div className="pt-4 mb-3">
          <ButtonLink to="/cotizaciones" direction="back" label="Volver a cotizaciones" />
        </div>
      </section>

      {/* Tarjeta: Información de la cotización */}
      <section className="card bg-white border border-base-300/60 shadow-sm rounded-2xl mb-6">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2 bg-[#3498DB]/70 text-white p-2 rounded-xl">
            <BadgeInfo className="w-5 h-5" />
            <h2 className="card-title text-lg">Información de la cotización</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">Estado:</span>
              <span className={`badge ${estadoBadgeClass(estadoActual)}`}>{estadoActual}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 opacity-70" />
              <span className="text-sm opacity-70">Creada:</span>
              <span className="font-medium">{creada}</span>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <UserRound className="w-5 h-5" />
              <h3 className="text-base font-semibold">Información del cliente</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <InfoRow label="Nombres" value={nombres} />
              <InfoRow label="Apellidos" value={apellidos} />
              <InfoRow
                label="Email"
                value={
                  email !== '—' ? (
                    <a className="link link-primary inline-flex items-center gap-1" href={`mailto:${email}`}>
                      <Mail className="w-4 h-4" />
                      {email}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />
              <InfoRow
                label="Teléfono"
                value={
                  telefono !== '—' ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {telefono}
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Motocicletas */}
      <section className="card bg-base-100 shadow-sm rounded-2xl mb-6">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2">
            <Bike className="w-5 h-5" />
            <h2 className="card-title text-lg">Motocicletas</h2>
          </div>

          {/* Moto A */}
          {showMotoA && motoA && (
            <article className="overflow-hidden rounded-xl shadow-sm mb-4">
              <header className="px-4 py-2 font-semibold bg-[#3498DB]/70 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <span>{motoA.modelo}</span>
                <span className="text-xs md:text-sm opacity-90">
                  {marcaMoto(row, 'a')} · {lineaMoto(row, 'a')} · Modelo {anioModeloMoto(row, 'a')}
                </span>
              </header>

              {/* Ficha básica de la moto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-base-300/60">
                <InfoKV label="Marca" value={marcaMoto(row, 'a')} />
                <InfoKV label="Línea" value={lineaMoto(row, 'a')} />
                <InfoKV label="Modelo (año)" value={anioModeloMoto(row, 'a')} />
                <InfoKV label="Garantía" value={garantiaTexto(row, 'a')} />
              </div>

              {/* Costos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-base-300/40">
                <InfoKV label="Precio base:" value={fmtCOP(motoA.precioBase)} />
                <InfoKV label="Precio documentos:" value={fmtCOP(motoA.precioDocumentos)} />

                {/* Documentos separados */}
                <InfoKV label="SOAT:" value={fmtCOP(motoA.soat)} />
                <InfoKV label="Matrícula:" value={fmtCOP(motoA.matricula)} />
                <InfoKV label="Impuestos:" value={fmtCOP(motoA.impuestos)} />

                <InfoKV label="Accesorios + Marcación:" value={fmtCOP(motoA.accesoriosYMarcacion)} />
                <InfoKV
                  label="Descuentos:"
                  value={motoA.descuentos > 0 ? `-${fmtCOP(motoA.descuentos)}` : fmtCOP(0)}
                />

                {motoA.bonoEnsambladora > 0 && (
                  <InfoKV label="Bono ensambladora:" value={`- ${fmtCOP(motoA.bonoEnsambladora)}`} />
                )}

                {/* Póliza / garantía extendida (si existen) */}
                {(motoA.polizaCodigo || motoA.polizaValor > 0) && (
                  <>
                    <InfoKV label="Póliza:" value={motoA.polizaCodigo || '—'} />
                    <InfoKV label="Valor póliza:" value={fmtCOP(motoA.polizaValor)} />
                  </>
                )}

                {motoA.garantiaExtendidaMeses ? (
                  <>
                    <InfoKV label="Garantía extendida (meses):" value={`${motoA.garantiaExtendidaMeses} meses`} />
                    <InfoKV label="Valor garantía extendida:" value={fmtCOP(motoA.garantiaExtendidaValor)} />
                  </>
                ) : null}

                <InfoKV label="Seguros:" value={fmtCOP(motoA.seguros)} />
                <InfoKV label="Total sin seguros:" value={fmtCOP(motoA.totalSinSeguros)} />
                <InfoKV label="Total:" value={fmtCOP(motoA.total)} />

                {/* GPS */}
                <InfoKV label="GPS (meses):" value={gpsLabel(motoA.gpsMeses)} />
                <InfoKV label="Valor GPS:" value={gpsValorLabel(motoA.gpsMeses, motoA.gpsValor)} />
              </div>

              {/* ✅ Adicionales / trámites (COMPLETOS, sin omitir nada) */}
              {(() => {
                const ad = motoA.adicionales;
                const hay = (ad?.total || 0) > 0;
                if (!hay) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-base-300/40">
                    <InfoKV label="RUNT:" value={fmtCOP(ad.runt)} />
                    <InfoKV label="Licencia:" value={fmtCOP(ad.licencia)} />
                    <InfoKV label="Defensas:" value={fmtCOP(ad.defensas)} />
                    <InfoKV label="Hand savers:" value={fmtCOP(ad.handSavers)} />
                    <InfoKV label="Otros adicionales:" value={fmtCOP(ad.otros)} />
                    <InfoKV label="Total adicionales:" value={fmtCOP(ad.total)} />
                  </div>
                );
              })()}

              {/* Forma de pago / cuotas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <InfoKV label="Tipo de pago" value={safeText(row?.tipo_pago) || safeText(row?.metodo_pago) || '—'} />
                <InfoKV label="Cuota inicial:" value={fmtCOP(motoA.cuotaInicial)} />
                <InfoKV label="Saldo a financiar:" value={fmtCOP(motoA.saldoFinanciar)} />
              </div>

              {/* Cuotas si existen */}
              {renderCuotas(motoA)}
            </article>
          )}

          {/* Moto B */}
          {showMotoB && motoB && (
            <article className="overflow-hidden rounded-xl shadow-sm">
              <header className="px-4 py-2 font-semibold bg-[#3498DB]/70 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <span>{motoB.modelo}</span>
                <span className="text-xs md:text-sm opacity-90">
                  {marcaMoto(row, 'b')} · {lineaMoto(row, 'b')} · Modelo {anioModeloMoto(row, 'b')}
                </span>
              </header>

              {/* Ficha básica de la moto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-base-300/60">
                <InfoKV label="Marca" value={marcaMoto(row, 'b')} />
                <InfoKV label="Línea" value={lineaMoto(row, 'b')} />
                <InfoKV label="Modelo (año)" value={anioModeloMoto(row, 'b')} />
                <InfoKV label="Garantía" value={garantiaTexto(row, 'b')} />
              </div>

              {/* Costos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-base-300/40">
                <InfoKV label="Precio base:" value={fmtCOP(motoB.precioBase)} />
                <InfoKV label="Precio documentos:" value={fmtCOP(motoB.precioDocumentos)} />

                <InfoKV label="SOAT:" value={fmtCOP(motoB.soat)} />
                <InfoKV label="Matrícula:" value={fmtCOP(motoB.matricula)} />
                <InfoKV label="Impuestos:" value={fmtCOP(motoB.impuestos)} />

                <InfoKV label="Accesorios + Marcación:" value={fmtCOP(motoB.accesoriosYMarcacion)} />
                <InfoKV
                  label="Descuentos:"
                  value={motoB.descuentos > 0 ? `-${fmtCOP(motoB.descuentos)}` : fmtCOP(0)}
                />

                {motoB.bonoEnsambladora > 0 && (
                  <InfoKV label="Bono ensambladora:" value={`- ${fmtCOP(motoB.bonoEnsambladora)}`} />
                )}

                {(motoB.polizaCodigo || motoB.polizaValor > 0) && (
                  <>
                    <InfoKV label="Póliza:" value={motoB.polizaCodigo || '—'} />
                    <InfoKV label="Valor póliza:" value={fmtCOP(motoB.polizaValor)} />
                  </>
                )}

                {motoB.garantiaExtendidaMeses ? (
                  <>
                    <InfoKV label="Garantía extendida (meses):" value={`${motoB.garantiaExtendidaMeses} meses`} />
                    <InfoKV label="Valor garantía extendida:" value={fmtCOP(motoB.garantiaExtendidaValor)} />
                  </>
                ) : null}

                <InfoKV label="Seguros:" value={fmtCOP(motoB.seguros)} />
                <InfoKV label="Total sin seguros:" value={fmtCOP(motoB.totalSinSeguros)} />
                <InfoKV label="Total:" value={fmtCOP(motoB.total)} />

                <InfoKV label="GPS (meses):" value={gpsLabel(motoB.gpsMeses)} />
                <InfoKV label="Valor GPS:" value={gpsValorLabel(motoB.gpsMeses, motoB.gpsValor)} />
              </div>

              {/* ✅ Adicionales / trámites (COMPLETOS, sin omitir nada) */}
              {(() => {
                const ad = motoB.adicionales;
                const hay = (ad?.total || 0) > 0;
                if (!hay) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-base-300/40">
                    <InfoKV label="RUNT:" value={fmtCOP(ad.runt)} />
                    <InfoKV label="Licencia:" value={fmtCOP(ad.licencia)} />
                    <InfoKV label="Defensas:" value={fmtCOP(ad.defensas)} />
                    <InfoKV label="Hand savers:" value={fmtCOP(ad.handSavers)} />
                    <InfoKV label="Otros adicionales:" value={fmtCOP(ad.otros)} />
                    <InfoKV label="Total adicionales:" value={fmtCOP(ad.total)} />
                  </div>
                );
              })()}

              {/* Forma de pago / cuotas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <InfoKV label="Tipo de pago" value={safeText(row?.tipo_pago) || safeText(row?.metodo_pago) || '—'} />
                <InfoKV label="Cuota inicial:" value={fmtCOP(motoB.cuotaInicial)} />
                <InfoKV label="Saldo a financiar:" value={fmtCOP(motoB.saldoFinanciar)} />
              </div>

              {renderCuotas(motoB)}
            </article>
          )}

          {!showMotoA && !showMotoB && <div className="text-sm opacity-70">Sin información de motocicletas.</div>}
        </div>
      </section>

      {/* Formulario cambiar estado */}
      {useAuthStore.getState().user?.rol === 'Asesor' && (safeText(row?.estado) || 'Sin estado') !== 'Sin interés' && (
        <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body">
            <h2 className="card-title text-lg mb-2">Actualizar estado</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label w-28">
                  <span className="label-text">
                    Estado <span className="text-error">*</span>
                  </span>
                </label>
                <select className="select select-bordered" value={estadoNombre} onChange={(e) => setEstadoNombre(e.target.value)}>
                  {estadoNombre === '' && (
                    <option value="" disabled>
                      Seleccionar estado
                    </option>
                  )}

                  {opts.map(({ value, label }) => (
                    <option key={value} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {requiereSeleccionMoto(estadoNombre) ? (
                <div className="form-control">
                  <label className="label w-28">
                    <span className="label-text">
                      Selecciona la motocicleta <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    className="select select-bordered ml-20"
                    value={motoSeleccion}
                    onChange={(e) => setMotoSeleccion(e.target.value as 'A' | 'B' | '')}
                  >
                    {motoSeleccion === '' && <option value="" disabled>Seleccionar motocicleta</option>}
                    {motoOptions.map((op) => (
                      <option key={op.key} value={op.key}>
                        {op.label || (op.key === 'A' ? 'Moto A' : 'Moto B')}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-control">
                  <label className="label w-28">
                    <span className="label-text">
                      Comentario <span className="text-error">*</span>
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered min-h-28"
                    placeholder="Escribe un comentario"
                    value={comentario2}
                    onChange={(e) => setComentario2(e.target.value)}
                    maxLength={500}
                  />
                  <div className="text-xs opacity-60 text-right mt-1">{comentario2.length} / 500</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button type="button" className="btn btn-error btn-sm" onClick={() => navigate(-1)}>
                  ← Volver
                </button>

                <button type="submit" className="btn btn-success btn-sm" disabled={loading} aria-busy={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    <>✓ Aceptar</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </main>
  );
};

/* =======================
   Subcomponentes UI
   ======================= */
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-sm opacity-70">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

const InfoKV: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="opacity-70">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default DetalleCambiarEstado;
