import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCredito, useDeudor } from '../../../services/creditosServices';
import {
  CalendarDays,
  User2,
  Bike,
  FileText,
  Receipt,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Wallet,
  ClipboardList,
  ClipboardCheck,
  Building2,
  Landmark,
  Hash,
  IdCard,
  Download,
  CheckCircle2,
  XCircle,
  Tag,
} from 'lucide-react';
import {
  useSolicitudesPorCodigoCredito,
} from '../../../services/solicitudServices';
import FacturaFinalDownload from '../pdf/FacturaFinal';
import ButtonLink from '../../../shared/components/ButtonLink';
import { useDistribuidoras } from '../../../services/distribuidoraServices';

// 🔹 NUEVOS: endpoint full + IVA
import { useCotizacionFullById } from '../../../services/fullServices';
import { useIvaDecimal } from '../../../services/ivaServices';
import FacturarCreditoForm from '../../../shared/components/credito/FacturarCreditoForm';
import { fmtFecha } from '../../../utils/date';
import { toAbsoluteUrl } from '../../../utils/files';
import { neutroBadge } from '../../../utils/badges';

type MaybeNum = number | undefined | null;

// -------------------- Constantes --------------------

// --- Helpers de formato / casting ---
const toNum = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

const fmtCOP = (v?: MaybeNum | string) => {
  const num = typeof v === 'string' ? parseFloat(v) : v;
  if (num === undefined || num === null || isNaN(Number(num)) || Number(num) === 0)
    return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(num));
};

const safeStr = (v?: unknown) => (typeof v === 'string' ? v : '');

const SolictudFacturarCredito: React.FC = () => {
  const { id: codigoFromUrl, cot } = useParams<{ id: string; cot: string }>();
  const codigo_credito = String(codigoFromUrl ?? '');
  const id_cotizacion = String(cot ?? '');

  const { data: datos, isLoading, error } = useCredito(
    { codigo_credito },
    !!codigo_credito
  );
  const { data: deudor } = useDeudor(codigo_credito);

  // 🔹 FULL (cotización + crédito + solicitud)
  const {
    data: fullData,
    isLoading: loadingFull,
    error: errorFull,
  } = useCotizacionFullById(id_cotizacion);

  const cotizacion: any = fullData?.data?.cotizacion ?? null;

  // 🔹 IVA dinámico
  const {
    ivaDecimal,
    isLoading: ivaLoading,
    error: ivaError,
  } = useIvaDecimal();
  const IVA_DEC = ivaLoading || ivaError ? 0.19 : ivaDecimal ?? 0.19;

  // ➕ Consultar si ya hay solicitud para este crédito
  const { data: solicitudesCredito, isLoading: loadingSolic } =
    useSolicitudesPorCodigoCredito(id_cotizacion);
  const solicitud = solicitudesCredito?.[0] ?? null;

  // ocultar formulario si ya existe solicitud (y carga terminó)
  const yaRegistrada = !loadingSolic && !!solicitud;

  // -------------------- Distribuidoras (HOOK DINÁMICO) --------------------
  const {
    data: distribuidorasResponse,
    isLoading: loadingDistribuidoras,
    error: errorDistribuidoras,
  } = useDistribuidoras({ page: 1, limit: 200 });

  const distribuidorasActivas = useMemo(
    () =>
      distribuidorasResponse?.data?.filter(
        (d: any) => d.estado === 1 // solo activas
      ) ?? [],
    [distribuidorasResponse]
  );



  // Fuente de verdad (mismo criterio que usas en otras vistas)
  const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};
  const credito = datos?.creditos?.[0];

  // --- Cliente ---
  const clienteNombre = [
    deudorData?.informacion_personal?.primer_nombre,
    deudorData?.informacion_personal?.segundo_nombre,
    deudorData?.informacion_personal?.primer_apellido,
    deudorData?.informacion_personal?.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ');
  const clienteDoc = `${safeStr(
    deudorData?.informacion_personal?.tipo_documento
  )} ${safeStr(deudorData?.informacion_personal?.numero_documento)}`.trim();
  const clienteDireccion = [
    safeStr(deudorData?.informacion_personal?.ciudad_residencia),
    safeStr(deudorData?.informacion_personal?.direccion_residencia),
  ]
    .filter(Boolean)
    .join(', ');
  const clienteTelefono =
    safeStr(deudorData?.informacion_personal?.celular) ||
    safeStr(deudorData?.informacion_personal?.telefono_fijo);
  const clienteCorreo = safeStr(deudorData?.informacion_personal?.email);
  const clienteIniciales =
    clienteNombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '—';

  // -------------------- SELECCIÓN MOTO A / B (usando full) --------------------
  let motoSeleccionada: 'a' | 'b' | undefined;
  if (cotizacion) {
    const prod = safeStr(credito?.producto).toLowerCase();

    const descA = `${safeStr(cotizacion.marca_a)} ${safeStr(
      cotizacion.linea_a
    )}`.toLowerCase();
    const descB = `${safeStr(cotizacion.marca_b)} ${safeStr(
      cotizacion.linea_b
    )}`.toLowerCase();

    const lineaA = safeStr(cotizacion.linea_a).toLowerCase();
    const lineaB = safeStr(cotizacion.linea_b).toLowerCase();

    if (prod && descA && prod.includes(descA)) motoSeleccionada = 'a';
    else if (prod && descB && prod.includes(descB)) motoSeleccionada = 'b';
    else if (prod && lineaA && prod.includes(lineaA)) motoSeleccionada = 'a';
    else if (prod && lineaB && prod.includes(lineaB)) motoSeleccionada = 'b';
  }

  // helper para campos *_a / *_b
  const pickMotoField = (base: string): any => {
    if (!cotizacion) return undefined;
    const anyCot: any = cotizacion;
    const a = anyCot[`${base}_a`];
    const b = anyCot[`${base}_b`];

    if (motoSeleccionada === 'a') return a ?? b ?? anyCot[base];
    if (motoSeleccionada === 'b') return b ?? a ?? anyCot[base];

    // fallback si no se pudo detectar
    if (a && !b) return a;
    if (b && !a) return b;
    return anyCot[base] ?? a ?? b;
  };

  // --- Moto (nombre, motor, chasis, color) ---
  const motoNombre = safeStr(credito?.producto); // texto del crédito (ej: "YAMAHA 18 – 2024")
  const numMotor = safeStr(credito?.numero_motor);
  const numChasis = safeStr(credito?.numero_chasis);
  const color = safeStr((credito as any)?.color);

  // ===================== COSTOS / IVA / TOTALES =====================

  // 1) Total general del crédito (valor del producto)
  const valorProducto: number | undefined =
    toNum(credito?.valor_producto) ?? toNum(pickMotoField('precio_total'));

  // 2) Documentos: preferimos la descomposición de la cotización (soat_b, matricula_b, impuestos_b)
  const soat: MaybeNum =
    toNum(pickMotoField('soat')) ?? toNum((credito as any)?.soat);
  const matricula: MaybeNum =
    toNum(pickMotoField('matricula')) ??
    toNum(pickMotoField('precio_documentos')) ??
    toNum((credito as any)?.matricula);
  const impuestos: MaybeNum =
    toNum(pickMotoField('impuestos')) ?? toNum((credito as any)?.impuestos);

  // 3) Seguros y accesorios (desde el crédito)
  const accesoriosTotal: MaybeNum = toNum((credito as any)?.accesorios_total); // ej: 70000
  const precioSeguros: MaybeNum = toNum((credito as any)?.precio_seguros); // ej: 120000

  const accesoriosYSeguros: MaybeNum = useMemo(() => {
    const a = typeof accesoriosTotal === 'number' ? accesoriosTotal : 0;
    const s = typeof precioSeguros === 'number' ? precioSeguros : 0;
    const sum = a + s;
    return sum > 0 ? sum : undefined;
  }, [accesoriosTotal, precioSeguros]);

  // 4) Subtotal documentos
  const subtotalDocumentos: MaybeNum = useMemo(() => {
    const parts = [soat, matricula, impuestos].filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0
    );
    return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
  }, [soat, matricula, impuestos]);

  // 5) Valor de la moto (sin documentos ni seguros ni accesorios)
  let valorMoto: number | undefined;
  if (typeof valorProducto === 'number' && Number.isFinite(valorProducto)) {
    const docs =
      (typeof soat === 'number' ? soat : 0) +
      (typeof matricula === 'number' ? matricula : 0) +
      (typeof impuestos === 'number' ? impuestos : 0);
    const extras =
      (typeof accesoriosTotal === 'number' ? accesoriosTotal : 0) +
      (typeof precioSeguros === 'number' ? precioSeguros : 0);

    const base = valorProducto - docs - extras;
    valorMoto = base > 0 ? base : valorProducto;
  } else {
    // fallback: usa precio_base de la moto
    valorMoto =
      toNum(pickMotoField('precio_base')) ?? toNum(credito?.valor_producto);
  }

  // 6) Desglose de IVA de la moto (bruto + IVA)
  let valorBruto: number | undefined;
  let ivaCalc: number | undefined;
  if (
    typeof valorMoto === 'number' &&
    Number.isFinite(valorMoto) &&
    valorMoto > 0
  ) {
    const bruto = Math.round(valorMoto / (1 + IVA_DEC));
    const iva = Math.max(valorMoto - bruto, 0);
    valorBruto = bruto;
    ivaCalc = iva;
  }

  // 7) TOTAL general (coherente con el crédito)
  const totalGeneral: number | undefined =
    typeof valorProducto === 'number' && Number.isFinite(valorProducto)
      ? valorProducto
      : (() => {
        const parts = [
          valorMoto,
          soat,
          matricula,
          impuestos,
          accesoriosYSeguros,
        ].filter(
          (n): n is number =>
            typeof n === 'number' && Number.isFinite(n) && n > 0
        );
        return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
      })();

  const fechaCreacion = fmtFecha(credito?.fecha_creacion);
  const asesor = safeStr(credito?.asesor);
  const numeroSolicitud = credito?.cotizacion_id ?? codigo_credito;

  // Observaciones (cuota inicial y saldo)
  const cuotaInicial: MaybeNum = toNum((credito as any)?.cuota_inicial);
  const saldoFinanciar: number | undefined =
    typeof totalGeneral === 'number' && typeof cuotaInicial === 'number'
      ? Math.max(totalGeneral - cuotaInicial, 0)
      : undefined;

  // Garantía y seguros (si existe)
  const garantiaExtendida: MaybeNum = toNum(
    (credito as any)?.garantia_extendida_valor
  );


  return (
    <main className="min-h-screen w-full bg-base-200">


      {/* Header / Migas */}
      <div className='p-4 md:p-8 pb-0 md:pb-0'>
        <div className="border border-success/30 bg-linear-to-r from-success/10 to-success/10/50 backdrop-blur rounded-2xl shadow-sm">
          <div className="w-full px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* IZQUIERDA: botón volver */}
            <div className="flex items-center gap-3">
              <ButtonLink
                to={`/creditos/detalle/${codigo_credito}`}
                label="Volver al crédito"
                direction="back"
              />
            </div>

            {/* DERECHA: título */}
            <div className="flex items-center gap-3 justify-center sm:justify-end">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-success">
                <Receipt className="h-5 w-5" />
              </div>
              <h1 className="text-base md:text-xl font-bold text-base-content tracking-tight flex flex-wrap items-center gap-2">
                Solicitud de facturación del crédito
                <span className="badge badge-success text-white font-semibold">{codigo_credito}</span>
              </h1>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-8 space-y-6">
        {(isLoading ||
          loadingSolic ||
          loadingDistribuidoras ||
          loadingFull ||
          ivaLoading) && (
            <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
              Cargando información…
            </div>
          )}

        {(error || errorDistribuidoras || errorFull || ivaError) && (
          <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-error shadow-sm">
            Ocurrió un error al cargar la información del crédito o la cotización.
          </div>
        )}

        <section className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
          <div className="bg-linear-to-r from-sky-600 to-emerald-600 px-5 md:px-6 py-4 flex items-center gap-2">
            <User2 className="h-5 w-5 text-white" />
            <h2 className="text-white font-semibold text-base md:text-lg">
              Información del cliente
            </h2>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* IZQUIERDA: Info cliente */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-info/10 text-info text-lg font-semibold ring-1 ring-info/30">
                  {clienteIniciales}
                </div>
                <div className="min-w-0">
                  <div className="text-base md:text-lg font-semibold text-base-content truncate">
                    {clienteNombre || "—"}
                  </div>
                  <div className="text-sm text-base-content/70">{clienteDoc || "—"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ContactRow icon={MapPin} label="Dirección" value={clienteDireccion} />
                <ContactRow icon={Phone} label="Teléfono" value={clienteTelefono} />
                <ContactRow icon={Mail} label="Correo" value={clienteCorreo} />
              </div>
            </div>

            {/* DERECHA: info solicitud */}
            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 flex flex-col justify-center gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                Solicitud
              </div>
              <div className="text-xl font-bold text-base-content">
                #{numeroSolicitud ?? "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <CalendarDays className="h-4 w-4 text-info shrink-0" />
                {fechaCreacion || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <User2 className="h-4 w-4 text-info shrink-0" />
                Asesor {asesor || "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Tabla: Motocicleta */}
        <section className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
          <div className="bg-linear-to-r from-sky-600 to-emerald-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center gap-2">
            <Bike className="h-4 w-4" />
            Motocicleta
          </div>

          {/* Desktop */}
          <div className="hidden md:block">
            <div className="grid grid-cols-12 items-center px-5 py-2 text-xs font-semibold uppercase tracking-wide text-base-content/60 bg-base-200 border-b border-base-200">
              <div className="col-span-5">Motocicleta</div>
              <div className="col-span-2"># Motor</div>
              <div className="col-span-3"># Chasis</div>
              <div className="col-span-2 text-right pr-2">Color</div>
            </div>
            <div className="px-5 py-3 text-sm text-base-content">
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 truncate font-medium">{motoNombre}</div>
                <div className="col-span-2 truncate">{numMotor || "—"}</div>
                <div className="col-span-3 truncate">{numChasis || "—"}</div>
                <div className="col-span-2 text-right pr-2">{color || "—"}</div>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-base-200">
            {[
              ["Motocicleta", motoNombre],
              ["# Motor", numMotor || "—"],
              ["# Chasis", numChasis || "—"],
              ["Color", color || "—"],
            ].map(([label, value], i) => (
              <div key={i} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="text-xs font-semibold text-base-content/60">{label}</span>
                <span className="text-base-content text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Condiciones del negocio */}
        <section className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
          <div className="bg-emerald-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center justify-between">
            <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" />Condiciones del negocio</span>
            <span>Costos</span>
          </div>
          <div className="divide-y divide-base-300">
            <RowRight label="Valor Moto:" value={fmtCOP(valorMoto)} />
            <RowRight label="Valor bruto:" value={fmtCOP(valorBruto)} />
            <RowRight label="IVA:" value={fmtCOP(ivaCalc)} />
            <RowRight
              label="Total:"
              value={fmtCOP(valorMoto)}
              bold
              badge="inline-block rounded-full bg-success/10 border border-success/30 text-success px-2 py-0.5"
            />
          </div>
        </section>

        {/* Precio de documentos */}
        <section className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
          <div className="bg-sky-700 text-white font-semibold px-5 py-2.5 text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Precio de documentos
          </div>
          <div className="divide-y divide-base-300">
            <RowRight label="SOAT:" value={fmtCOP(soat)} />
            <RowRight label="Matrícula:" value={fmtCOP(matricula)} />
            <RowRight label="Impuestos:" value={fmtCOP(impuestos)} />
            <RowRight
              label="Subtotal documentos:"
              value={fmtCOP(subtotalDocumentos)}
              bold
            />
          </div>
        </section>

        {/* Dos columnas: Seguros y accesorios / TOTAL */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seguros y accesorios */}
          <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
            <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Seguros y accesorios
            </div>
            <div className="divide-y divide-base-300">
              <RowRight label="Accesorios:" value={fmtCOP(accesoriosTotal)} />
              <RowRight label="Seguros:" value={fmtCOP(precioSeguros)} />
              <RowRight
                label="Valor bruto:"
                value={fmtCOP(
                  accesoriosYSeguros
                    ? Math.round((accesoriosYSeguros as number) / (1 + IVA_DEC))
                    : undefined
                )}
              />
              <RowRight
                label="IVA:"
                value={fmtCOP(
                  accesoriosYSeguros
                    ? (accesoriosYSeguros as number) -
                    Math.round(
                      (accesoriosYSeguros as number) / (1 + IVA_DEC)
                    )
                    : undefined
                )}
              />
              <RowRight label="Total:" value={fmtCOP(accesoriosYSeguros)} />
            </div>
          </div>

          {/* TOTAL */}
          <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
            <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              TOTAL
            </div>
            <div className="divide-y divide-base-300">
              <RowRight label="Valor Moto:" value={fmtCOP(valorMoto)} />
              <RowRight label="SOAT:" value={fmtCOP(soat)} />
              <RowRight label="Matrícula:" value={fmtCOP(matricula)} />
              <RowRight label="Impuestos:" value={fmtCOP(impuestos)} />
              <RowRight
                label="Seguros y accesorios:"
                value={fmtCOP(accesoriosYSeguros)}
              />
              <RowRight
                label="TOTAL:"
                value={fmtCOP(totalGeneral)}
                bold
                badge="inline-block rounded-full bg-success/10 border border-success/30 text-success px-2 py-0.5"
              />
            </div>
          </div>
        </section>

        {/* Observaciones */}
        <section className="rounded-xl border border-success bg-success/10 p-6 shadow-sm">
          <h3 className="inline-flex items-center gap-2 font-semibold text-base-content mb-4">
            <ClipboardList className="h-4 w-4 text-success" />
            Observaciones
          </h3>
          <ul className="list-disc pl-6 text-sm leading-7 text-base-content space-y-1">
            <li>
              Crédito aprobado por{' '}
              <span className="font-semibold text-base-content">
                Crédito directo
              </span>
            </li>
            <li>
              El crédito tiene una cuota inicial de{' '}
              <span className="font-semibold text-base-content">
                {fmtCOP(cuotaInicial)}
              </span>
            </li>
            <li>
              El saldo a financiar del producto es{' '}
              <span className="font-semibold text-base-content">
                {fmtCOP(saldoFinanciar)}
              </span>
            </li>
            <li>
              La garantía y seguros tiene un valor de{' '}
              <span className="font-semibold text-base-content">
                {fmtCOP(garantiaExtendida)}
              </span>
            </li>
          </ul>
        </section>

        {/* Formulario inferior */}
        {!yaRegistrada ? (
          <FacturarCreditoForm
            codigoCredito={codigo_credito}
            idCotizacion={id_cotizacion}
            clienteNombre={clienteNombre}
            distribuidorasActivas={distribuidorasActivas}
            loadingDistribuidoras={loadingDistribuidoras}
            errorDistribuidoras={errorDistribuidoras}
          />
        ) : (
          <>
          {/* Aviso: ya existe solicitud para este crédito */}
          <div className="rounded-2xl border border-success/30 bg-base-100 shadow-sm p-4 md:p-6">
            <h3 className="font-semibold text-success">
              Ya existe una solicitud de facturación para este crédito
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              Para evitar duplicados, el formulario no se mostrará.
            </p>
          </div>

          {/* Si hay solicitud registrada, mostramos el detalle */}
          <section className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
            {/* Encabezado */}
            <div className="bg-linear-to-r from-sky-600 to-emerald-600 px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-white font-semibold text-base md:text-lg">
                <ClipboardCheck className="h-5 w-5" />
                Solicitud registrada
              </h3>

              {/* Badges de estado */}
              <div className="flex flex-wrap items-center gap-2">
                <EstadoPill onDark label="Autorizado" ok={solicitud?.autorizado} />
                <EstadoPill onDark label="Facturado" ok={solicitud?.facturado} />
                <EstadoPill onDark label="Entrega" ok={solicitud?.entregaAutorizada} />
              </div>
            </div>

            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Datos de la solicitud */}
              <div className="rounded-xl border border-base-300 overflow-hidden">
                <div className="bg-base-200 px-4 py-2.5 text-sm font-semibold text-base-content flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-base-content/60" />
                  Datos de la solicitud
                </div>

                <dl className="divide-y divide-base-200 text-sm">
                  <InfoRow icon={Building2} label="Agencia" value={solicitud?.agencia} />
                  <InfoRow icon={Landmark} label="Distribuidora" value={solicitud?.distribuidora} />
                  <InfoRow icon={Hash} label="Código" value={solicitud?.codigo} />
                  <InfoRow icon={Hash} label="Código crédito" value={solicitud?.codigoCredito} />
                  <InfoRow icon={User2} label="Cliente" value={solicitud?.cliente} />
                  <InfoRow
                    icon={Tag}
                    label="Tipo"
                    value={
                      <span className="badge badge-info badge-sm font-medium">
                        {solicitud?.tipo ?? '—'}
                      </span>
                    }
                  />
                  <InfoRow icon={Receipt} label="Recibo pago" value={solicitud?.numeroRecibo} />
                  <InfoRow label="Autorizado" value={<EstadoPill ok={solicitud?.autorizado} />} />
                  <InfoRow label="Facturado" value={<EstadoPill ok={solicitud?.facturado} />} />
                  <InfoRow label="Entrega autorizada" value={<EstadoPill ok={solicitud?.entregaAutorizada} />} />
                  <InfoRow
                    icon={CalendarDays}
                    label="Creado"
                    value={fmtFecha(solicitud?.fechaCreacion) || solicitud?.fechaCreacion}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Actualizado"
                    value={fmtFecha(solicitud?.actualizado) || solicitud?.actualizado}
                  />
                </dl>
              </div>

              {/* Documentos */}
              <div className="rounded-xl border border-base-300 overflow-hidden h-fit">
                <div className="bg-base-200 px-4 py-2.5 text-sm font-semibold text-base-content flex items-center gap-2">
                  <FileText className="h-4 w-4 text-base-content/60" />
                  Documentos
                </div>

                <ul className="divide-y divide-base-200 text-sm">
                  <DocumentoRow
                    icon={IdCard}
                    titulo="Cédula"
                    subtitulo="Documento de identidad"
                    path={solicitud?.cedulaPath}
                    faltaTexto="No adjunta"
                  />
                  <DocumentoRow
                    icon={FileText}
                    titulo="Manifiesto"
                    subtitulo="Soporte de manifiesto"
                    path={solicitud?.manifiestoPath}
                    faltaTexto="No adjunto"
                  />

                  <li className="items-center justify-between gap-4 px-4 py-3 hidden">
                    <div className="min-w-0">
                      <span className="font-medium block">Factura</span>
                      <span className="text-xs text-base-content/60">
                        Factura electrónica (demo)
                      </span>
                    </div>
                    <FacturaFinalDownload />
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 md:px-6 pb-5 md:pb-6 flex items-center justify-end">
              <ButtonLink
                to={`/creditos/detalle/${codigo_credito}`}
                label="Volver al detalle del crédito"
                direction="back"
                variant="outline"
              />
            </div>
          </section>


          
          </>
        )}
      </div>
    </main>
  );
};

const ContactRow: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 min-w-0">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <div className="text-xs text-base-content/60">{label}</div>
      <div className="text-sm font-medium text-base-content truncate">{value || '—'}</div>
    </div>
  </div>
);

const EstadoPill: React.FC<{ ok?: boolean; label?: string; onDark?: boolean }> = ({
  ok,
  label,
  onDark,
}) => {
  const Icon = ok ? CheckCircle2 : XCircle;
  const tono = ok
    ? onDark
      ? 'bg-white/15 text-white ring-1 ring-white/30'
      : 'bg-success/10 text-success ring-1 ring-success/30'
    : onDark
      ? 'bg-white/10 text-white/80 ring-1 ring-white/20'
      : 'bg-error/10 text-error ring-1 ring-error/30';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-1 ${tono}`}>
      <Icon className="h-3 w-3" />
      {label ? `${label}: ${ok ? 'Sí' : 'No'}` : ok ? 'Sí' : 'No'}
    </span>
  );
};

const InfoRow: React.FC<{
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
    <dt className="inline-flex items-center gap-1.5 text-base-content/60">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {label}
    </dt>
    <dd className="font-medium text-right text-base-content">
      {value === undefined || value === null || value === '' ? '—' : value}
    </dd>
  </div>
);

const DocumentoRow: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  titulo: string;
  subtitulo: string;
  path?: string | null;
  faltaTexto: string;
}> = ({ icon: Icon, titulo, subtitulo, path, faltaTexto }) => (
  <li className="flex items-center justify-between gap-4 px-4 py-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/60">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <span className="font-medium block text-base-content">{titulo}</span>
        <span className="text-xs text-base-content/60">{subtitulo}</span>
      </div>
    </div>

    {path ? (
      <a
        className="btn btn-sm btn-outline gap-1.5"
        href={toAbsoluteUrl(path) ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ver o descargar ${titulo.toLowerCase()}`}
      >
        <Download className="h-3.5 w-3.5" />
        Ver / descargar
      </a>
    ) : (
      <span className={neutroBadge(faltaTexto).clase}>{neutroBadge(faltaTexto).texto}</span>
    )}
  </li>
);

const RowRight: React.FC<{
  label: string;
  value?: string;
  bold?: boolean;
  badge?: string;
}> = ({ label, value = '', bold, badge = '' }) => (
  <div className="px-5 py-3 grid grid-cols-12 items-center text-sm">
    <div className="col-span-8 sm:col-span-10 text-base-content">{label}</div>
    <div
      className={`col-span-4 sm:col-span-2 text-right ${bold ? 'font-semibold text-base-content' : 'font-medium text-base-content'
        }`}
    >
      {badge ? <span className={badge}>{value}</span> : value}
    </div>
  </div>
);

export default SolictudFacturarCredito;