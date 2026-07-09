import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import { siNoBadge, neutroBadge } from '../../../utils/badges';

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
                to="/solicitudes"
                label="Volver a facturación"
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

        <section className="rounded-2xl border border-info/30 bg-info/10 shadow-sm p-4 md:p-6">

          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">

            {/* IZQUIERDA: Info cliente */}
            <div className="flex-1 space-y-2 text-center lg:text-left">

              <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-info uppercase tracking-wide">
                <User2 className="h-4 w-4" />
                Información del cliente
              </h2>

              <div className="text-base md:text-lg font-semibold text-base-content">
                {clienteNombre}
              </div>

              <div className="text-sm text-base-content/70">
                {clienteDoc}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-base-content/70 justify-center lg:justify-start">
                <MapPin className="h-4 w-4 text-info shrink-0" />
                {clienteDireccion || "—"}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-base-content/70 justify-center lg:justify-start">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-info shrink-0" />
                  <span className="font-semibold text-base-content">Tel:</span>{" "}
                  {clienteTelefono || "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-info shrink-0" />
                  <span className="font-semibold text-base-content">Correo:</span>{" "}
                  {clienteCorreo || "—"}
                </div>
              </div>

            </div>

            {/* DERECHA: info solicitud */}
            <div className="w-full lg:w-auto">
              <div className="h-full rounded-xl bg-base-100 border border-info/30 p-4 flex flex-col items-center lg:items-end text-center lg:text-right shadow-sm">

                <div className="text-base md:text-lg font-semibold text-base-content">
                  Solicitud #{numeroSolicitud ?? "—"}
                </div>

                <div className="text-xs md:text-sm text-base-content/70 flex items-center gap-1 mt-1">
                  <CalendarDays className="w-4 h-4 text-info" />
                  <span>{fechaCreacion}</span>
                </div>

                <div className="text-xs md:text-sm text-base-content/70 flex items-center gap-1 mt-1">
                  <User2 className="w-4 h-4 text-info" />
                  <span>Asesor {asesor}</span>
                </div>

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
          <section className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
            {/* Encabezado */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-lg font-semibold text-base-content">
                Solicitud registrada
              </h3>

              {/* Badges de estado (DaisyUI) */}
              <div className="hidden md:flex flex-wrap items-center gap-2">
                <span className={siNoBadge(solicitud?.autorizado).clase}>
                  Autorizado: {siNoBadge(solicitud?.autorizado).texto}
                </span>
                <span className={siNoBadge(solicitud?.facturado).clase}>
                  Facturado: {siNoBadge(solicitud?.facturado).texto}
                </span>
                <span className={siNoBadge(solicitud?.entregaAutorizada).clase}>
                  Entrega: {siNoBadge(solicitud?.entregaAutorizada).texto}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Datos de la solicitud */}
              <div className="rounded-xl border border-base-300 p-4">
                <h4 className="font-semibold text-base-content mb-3">
                  Datos de la solicitud
                </h4>

                <dl className="text-sm text-base-content grid grid-cols-1 gap-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Agencia</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.agencia ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Distribuidora</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.distribuidora ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Código</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.codigo ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Código crédito</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.codigoCredito ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Cliente</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.cliente ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Tipo</dt>
                    <dd className="text-right">
                      <span className="badge badge-info badge-sm font-medium">
                        {solicitud?.tipo ?? '—'}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Recibo pago</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.numeroRecibo ?? '—'}
                    </dd>
                  </div>

                  {/* Badges en detalle también */}
                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Autorizado</dt>
                    <dd className="text-right">
                      <span className={siNoBadge(solicitud?.autorizado).clase}>
                        {siNoBadge(solicitud?.autorizado).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Facturado</dt>
                    <dd className="text-right">
                      <span className={siNoBadge(solicitud?.facturado).clase}>
                        {siNoBadge(solicitud?.facturado).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Entrega autorizada</dt>
                    <dd className="text-right">
                      <span
                        className={siNoBadge(
                          solicitud?.entregaAutorizada
                        ).clase}
                      >
                        {siNoBadge(solicitud?.entregaAutorizada).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Creado</dt>
                    <dd className="font-medium text-right">
                      {fmtFecha(solicitud?.fechaCreacion) || (solicitud?.fechaCreacion ?? '—')}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-base-content/60">Actualizado</dt>
                    <dd className="font-medium text-right">
                      {fmtFecha(solicitud?.actualizado) || (solicitud?.actualizado ?? '—')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Documentos */}
              <div className="rounded-xl border border-base-300 p-4">
                <h4 className="font-semibold text-base-content mb-3">Documentos</h4>

                <ul className="text-sm text-base-content space-y-3">
                  {/* Cédula */}
                  <li className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium block">Cédula</span>
                      <span className="text-xs text-base-content/60">
                        Documento de identidad
                      </span>
                    </div>

                    {solicitud?.cedulaPath ? (
                      <a
                        className="btn btn-sm btn-outline"
                        href={toAbsoluteUrl(solicitud.cedulaPath) ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver o descargar cédula"
                      >
                        Ver / descargar
                      </a>
                    ) : (
                      <span className={neutroBadge('No adjunta').clase}>
                        {neutroBadge('No adjunta').texto}
                      </span>
                    )}
                  </li>

                  {/* Manifiesto */}
                  <li className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium block">Manifiesto</span>
                      <span className="text-xs text-base-content/60">
                        Soporte de manifiesto
                      </span>
                    </div>

                    {solicitud?.manifiestoPath ? (
                      <a
                        className="btn btn-sm btn-outline"
                        href={toAbsoluteUrl(solicitud.manifiestoPath) ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver o descargar manifiesto"
                      >
                        Ver / descargar
                      </a>
                    ) : (
                      <span className={neutroBadge('No adjunto').clase}>
                        {neutroBadge('No adjunto').texto}
                      </span>
                    )}
                  </li>

                  <li className=" items-center justify-between gap-4 hidden">
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
            <div className="mt-6 flex items-center justify-end">
              <Link to={`/creditos/detalle/${codigo_credito}`}>
                <button
                  type="button"
                  className="btn border-base-300 bg-base-100 hover:bg-base-200 text-base-content"
                  aria-label="Volver al detalle del crédito"
                  title="Volver al detalle del crédito"
                >
                  ⟵ Volver
                </button>
              </Link>
            </div>
          </section>
          </>
        )}
      </div>
    </main>
  );
};

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