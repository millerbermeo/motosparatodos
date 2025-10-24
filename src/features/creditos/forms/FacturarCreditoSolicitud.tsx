// export default FacturarCreditoSolicitud;
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, User2 } from 'lucide-react';
import {
  useRegistrarSolicitudFacturacion,
  useUltimaSolicitudYCotizacion,
} from '../../../services/solicitudServices';
import FacturaFinalDownload from '../pdf/FacturaFinal';
import ButtonLink from '../../../shared/components/ButtonLink';

type MaybeNum = number | undefined | null;

const fmtCOP = (v?: MaybeNum) =>
  typeof v === 'number' && Number.isFinite(v)
    ? new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(v)
    : v === 0
    ? '0 COP'
    : '';

// 👇 NUEVOS helpers para mostrar “—” si no hay dato y para convertir a número seguro
const fmtOptCOP = (v?: string | number | null) => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return fmtCOP(n);
};
const pickNum = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const safeStr = (v?: unknown) => (typeof v === 'string' ? v : '');

const parseJSON = <T,>(raw: unknown, fallback: T): T => {
  if (typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const AGENCIAS = ['Sucursal Norte', 'Sucursal Centro', 'Sucursal Sur'];

const DISTRIBUIDORAS = [
  { value: '', label: 'Seleccione…' },
  { value: 'gente-motos', label: 'Gente Motos' },
  { value: 'supermotos-mym', label: 'Supermotos MyM' },
  { value: 'unymotos-sas', label: 'Unymotos SAS' },
  { value: 'distrimotos-yamaha', label: 'Distrimotos Yamaha' },
  { value: 'dismerca', label: 'Dismerca' },
  { value: 'supermotos-honda', label: 'Supermotos Honda' },
  { value: 'motored-hero', label: 'Motored Hero' },
  { value: 'los-coches', label: 'Los Coches' },
  { value: 'potenza', label: 'Potenza' },
  { value: 'garcia-y-montoya', label: 'Garcia y Montoya' },
  { value: 'motox-1-yamaha', label: 'Motox 1 Yamaha' },
  { value: 'yamaha-del-cafe', label: 'Yamaha del Cafe' },
  { value: 'ibiza-motos', label: 'Ibiza Motos' },
  { value: 'sukipartes', label: 'Sukipartes' },
  { value: 'tiendas-uma', label: 'Tiendas UMA' },
  { value: 'zagamotos', label: 'Zagamotos' },
  { value: 'simotos', label: 'Simotos' },
  { value: 'megamotos-akt', label: 'Megamotos AKT' },
];

const FacturarCreditoSolicitud: React.FC = () => {
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? '');

  // NUEVO ENDPOINT: Única fuente de verdad
  const {
    data: SolicitudFacturacion,
    isLoading,
    error,
  } = useUltimaSolicitudYCotizacion(codigo_credito);

  // Atajo a objetos
  const solicitud = (SolicitudFacturacion as any)?.solicitud ?? null;
  const cotizacion = (SolicitudFacturacion as any)?.cotizacion ?? null;

  console.log('222', solicitud);

  // Estado para decidir formulario vs detalle: si ya hay solicitud => detalle
  const [yaRegistrada, setYaRegistrada] = useState<boolean>(false);
  useEffect(() => {
    setYaRegistrada(!!solicitud);
  }, [solicitud]);

  // Datos de cliente desde COTIZACIÓN
  const clienteNombre = useMemo(() => {
    if (!cotizacion) return '';
    return [
      cotizacion.name,
      cotizacion.s_name,
      cotizacion.last_name,
      cotizacion.s_last_name,
    ]
      .filter(Boolean)
      .join(' ');
  }, [cotizacion]);

  const clienteDoc = safeStr(cotizacion?.cedula);
  const clienteTelefono = safeStr(cotizacion?.celular);
  const clienteCorreo = safeStr(cotizacion?.email);

  // Moto (desde COTIZACIÓN)
  const motoNombre = [safeStr(cotizacion?.marca_a), safeStr(cotizacion?.linea_a)]
    .filter(Boolean)
    .join(' ');
  const numMotor = ''; // No viene en el nuevo endpoint
  const numChasis = ''; // No viene en el nuevo endpoint
  const color = ''; // No viene en el nuevo endpoint

  // Precios desde COTIZACIÓN A
  const precioBaseA: MaybeNum =
    typeof cotizacion?.precio_base_a === 'number'
      ? cotizacion?.precio_base_a
      : undefined;
  const precioDocsA: MaybeNum =
    typeof cotizacion?.precio_documentos_a === 'number'
      ? cotizacion?.precio_documentos_a
      : undefined;
  const accesoriosA: MaybeNum =
    typeof cotizacion?.accesorios_a === 'number'
      ? cotizacion?.accesorios_a
      : undefined;

  // Seguros individuales (cuando vengan como números sueltos)
  const seguroVidaA: MaybeNum =
    typeof cotizacion?.seguro_vida_a === 'number'
      ? cotizacion?.seguro_vida_a
      : undefined;
  const otroSeguroA: MaybeNum =
    typeof cotizacion?.otro_seguro_a === 'number'
      ? cotizacion?.otro_seguro_a
      : undefined;

  // Lista de seguros (viene como string JSON)
  type SeguroItem = { id: number; nombre: string; tipo: string | null; valor: number };
  const segurosLista: SeguroItem[] = parseJSON<SeguroItem[]>(
    cotizacion?.seguros_a,
    []
  );

  // Tomamos como "Valor Moto" el precio base + documentos (si aplican)
  const valorMoto: MaybeNum = useMemo(() => {
    const parts = [precioBaseA, precioDocsA].filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n)
    );
    return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
  }, [precioBaseA, precioDocsA]);

  // Bruto + IVA de la moto (asumiendo 19%)
  const { valorBruto, ivaCalc } = useMemo(() => {
    if (typeof valorMoto === 'number' && Number.isFinite(valorMoto) && valorMoto > 0) {
      const bruto = Math.round(valorMoto / 1.19);
      const iva = Math.max(valorMoto - bruto, 0);
      return { valorBruto: bruto, ivaCalc: iva };
    }
    return { valorBruto: undefined, ivaCalc: undefined };
  }, [valorMoto]);

  // Seguros y accesorios (suma de accesorios + seguros sueltos + items de la lista)
  const totalSegurosLista = useMemo(
    () =>
      segurosLista
        .filter((s) => typeof s?.valor === 'number')
        .reduce((acc, s) => acc + (s.valor || 0), 0),
    [regKey(segurosLista)]
  );

  const accesoriosYSeguros: MaybeNum = useMemo(() => {
    const parts = [accesoriosA, seguroVidaA, otroSeguroA, totalSegurosLista].filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n)
    );
    return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
  }, [accesoriosA, seguroVidaA, otroSeguroA, totalSegurosLista]);

  // 👇 NUEVO: Otros rubros con fallback (solicitud -> cotización B -> cotización A -> “—”)
  const soat: MaybeNum = useMemo(
    () =>
      pickNum((SolicitudFacturacion as any)?.solicitud?.tot_soat) ??
      pickNum(cotizacion?.soat_b) ??
      pickNum(cotizacion?.soat_a),
    [SolicitudFacturacion, cotizacion]
  );

  const matricula: MaybeNum = useMemo(
    () =>
      pickNum((SolicitudFacturacion as any)?.solicitud?.tot_matricula) ??
      pickNum(cotizacion?.matricula_b) ??
      pickNum(cotizacion?.matricula_a) ??
      // último recurso: precio_documentos si no hay matrícula
      pickNum(cotizacion?.precio_documentos_b) ??
      pickNum(cotizacion?.precio_documentos_a),
    [SolicitudFacturacion, cotizacion]
  );

  const impuestos: MaybeNum = useMemo(
    () =>
      pickNum((SolicitudFacturacion as any)?.solicitud?.tot_impuestos) ??
      pickNum(cotizacion?.impuestos_b) ??
      pickNum(cotizacion?.impuestos_a),
    [SolicitudFacturacion, cotizacion]
  );

  // Total general
  const totalGeneral: MaybeNum = useMemo(() => {
    const parts = [valorMoto, soat, matricula, impuestos, accesoriosYSeguros].filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n)
    );
    return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
  }, [valorMoto, soat, matricula, impuestos, accesoriosYSeguros]);

  // Metadatos
  const fechaCreacion = safeStr(cotizacion?.fecha_creacion) || safeStr(solicitud?.fechaCreacion);
  const asesor = safeStr(cotizacion?.asesor) || '—';
  const numeroSolicitud = cotizacion?.id || codigo_credito;

  // Observaciones (cuota inicial y saldo)
  const cuotaInicial: MaybeNum =
    typeof cotizacion?.cuota_inicial_a === 'number' ? cotizacion?.cuota_inicial_a : 0;
  const saldoFinanciar: MaybeNum =
    typeof valorMoto === 'number'
      ? Math.max(valorMoto - (typeof cuotaInicial === 'number' ? cuotaInicial : 0), 0)
      : undefined;

  // Formulario: estado
  const [distribuidora, setDistribuidora] = useState<string>('');
  const [numeroRecibo, setNumeroRecibo] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [manifiestoFile, setManifiestoFile] = useState<File | null>(null);

  // Nombre del usuario logueado (ajusta a tu auth real)
  const loggedUserName =
    (window as any)?.auth?.user?.name ||
    (window as any)?.user?.name ||
    'Usuario';

  const { mutate: registrarSolicitud, isPending } = useRegistrarSolicitudFacturacion();

  const submitFormData = (fd: FormData) => {
    registrarSolicitud(fd);
  };

  // Submit usando SOLO datos del nuevo endpoint
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const agenciaRandom = AGENCIAS[Math.floor(Math.random() * AGENCIAS.length)];
      const distLabel =
        DISTRIBUIDORAS.find((d) => d.value === distribuidora)?.label ?? '';
      const codigo4 = String(Math.floor(1000 + Math.random() * 9000)); // 1000..9999

      const fd = new FormData();
      fd.append('agencia', agenciaRandom);
      fd.append('distribuidora', distLabel);
      fd.append('distribuidora_id', '1');
      fd.append('codigo_solicitud', codigo4);
      fd.append('codigo_credito', codigo_credito);
      fd.append('nombre_cliente', clienteNombre);
      fd.append('tipo_solicitud', safeStr(cotizacion?.tipo_pago) || 'Contado');
      fd.append('numero_recibo', numeroRecibo);
      fd.append('resibo_pago', '');
      fd.append('facturador', loggedUserName);
      fd.append('autorizado', 'Si');
      fd.append('facturado', 'No');
      fd.append('entrega_autorizada', 'No');
      fd.append('observaciones', observaciones);

      if (cedulaFile) fd.append('cedula', cedulaFile);
      if (manifiestoFile) fd.append('manifiesto', manifiestoFile);

      submitFormData(fd);
    },
    [
      distribuidora,
      numeroRecibo,
      observaciones,
      cedulaFile,
      manifiestoFile,
      codigo_credito,
      clienteNombre,
      loggedUserName,
      cotizacion?.tipo_pago,
    ]
  );

  const BaseUrl =
    import.meta.env.VITE_API_URL ??
    'http://tuclick.vozipcolombia.net.co/motos/back';

  return (
    <main className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-start gap-5">
          <div className="pt-4 mb-3">
            <ButtonLink to="/solicitudes" label="Volver a facturación" direction="back" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight badge badge-soft badge-success">
            Solicitudes de facturación
          </h1>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-8 space-y-6">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            Cargando información…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            Ocurrió un error al cargar la solicitud/cotización.
          </div>
        )}

        {/* Encabezado: Información del cliente + lateral */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-base font-semibold text-emerald-700 mb-3">
                Información del cliente
              </h2>
              <div className="text-sm leading-6 text-slate-700 space-y-1.5">
                <div className="font-medium text-slate-900">{clienteNombre}</div>
                <div className="text-slate-600">{clienteDoc}</div>
                {/* No tenemos dirección/ciudad en el nuevo endpoint */}
                <div>
                  <span className="font-semibold text-slate-700">Teléfono:</span>{' '}
                  <span className="text-slate-600">{clienteTelefono || ''}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Correo:</span>{' '}
                  <span className="text-slate-600">{clienteCorreo}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="h-full rounded-lg bg-[#F1FCF6] border border-success p-4 flex flex-col justify-center md:justify-end md:items-end">
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">
                    Solicitud #{numeroSolicitud ?? ''}
                  </div>
                  <div className="text-sm text-slate-600 inline-flex items-center gap-1 mt-1">
                    <CalendarDays className="w-4 h-4" />
                    <span>{fechaCreacion}</span>
                  </div>
                  <div className="text-sm text-slate-600 inline-flex items-center gap-1 mt-1">
                    <User2 className="w-4 h-4" />
                    <span>Asesor {asesor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabla: Motocicleta */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-semibold px-5 py-2.5 text-sm">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-5">Motocicleta</div>
              <div className="col-span-2"># Motor</div>
              <div className="col-span-3"># Chasis</div>
              <div className="col-span-2 text-right pr-2">Color</div>
            </div>
          </div>
          <div className="px-5 py-3 text-sm text-slate-800">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-5 truncate">{motoNombre}</div>
              <div className="col-span-2 truncate">{numMotor}</div>
              <div className="col-span-3 truncate">{numChasis}</div>
              <div className="col-span-2 text-right pr-2">{color}</div>
            </div>
          </div>
        </section>

        {/* Condiciones del negocio */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-emerald-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center justify-between">
            <span>Condiciones del negocio</span>
            <span>Costos</span>
          </div>
          <div className="divide-y divide-slate-200">
            <RowRight label="Valor Moto:" value={fmtOptCOP(valorMoto)} />
            <RowRight label="Valor bruto:" value={fmtOptCOP(valorBruto)} />
            <RowRight label="IVA:" value={fmtOptCOP(ivaCalc)} />
            <RowRight
              label="Total:"
              value={fmtOptCOP(valorMoto)}
              bold
              badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5"
            />
          </div>
        </section>

        {/* Dos columnas: Seguros y accesorios / TOTAL */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seguros y accesorios */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
              Seguros y accesorios
            </div>
            <div className="divide-y divide-slate-200">
              <RowRight
                label="Valor bruto:"
                value={fmtOptCOP(
                  accesoriosYSeguros ? Math.round((accesoriosYSeguros as number) / 1.19) : undefined
                )}
              />
              <RowRight
                label="IVA:"
                value={fmtOptCOP(
                  accesoriosYSeguros
                    ? (accesoriosYSeguros as number) -
                        Math.round((accesoriosYSeguros as number) / 1.19)
                    : undefined
                )}
              />
              <RowRight label="Total:" value={fmtOptCOP(accesoriosYSeguros)} />
            </div>

            {/* Lista de seguros (cuando existan) */}
            {Array.isArray(segurosLista) && segurosLista.length > 0 && (
              <div className="px-5 py-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900 mb-2">Incluye:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {segurosLista.map((s) => (
                    <li key={`${s.id}-${s.nombre}-${s.tipo}`}>
                      {s.nombre}
                      {s.tipo ? ` — ${s.tipo}` : ''}: <span className="font-medium">{fmtCOP(s.valor)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* TOTAL */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
              TOTAL
            </div>
            <div className="divide-y divide-slate-200">
              <RowRight label="Valor Moto:" value={fmtOptCOP(valorMoto)} />
              <RowRight label="SOAT:" value={fmtOptCOP(soat)} />
              <RowRight label="Matrícula:" value={fmtOptCOP(matricula)} />
              <RowRight label="Impuestos:" value={fmtOptCOP(impuestos)} />
              <RowRight label="Seguros y accesorios:" value={fmtOptCOP(accesoriosYSeguros)} />
              <RowRight
                label="TOTAL:"
                value={fmtOptCOP(totalGeneral)}
                bold
                badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5"
              />
            </div>
          </div>
        </section>

        {/* Observaciones */}
        <section className="rounded-xl border border-success bg-[#F1FCF6] p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Observaciones</h3>
          <ul className="list-disc pl-6 text-sm leading-7 text-slate-700 space-y-1">
            <li>
              Tipo de pago: <span className="font-semibold text-slate-900">{safeStr(cotizacion?.tipo_pago) || 'Contado'}</span>
            </li>
            <li>
              Saldo a financiar: <span className="font-semibold text-slate-900">{fmtOptCOP(saldoFinanciar)}</span>
            </li>
            <li>
              Estado cotización: <span className="font-semibold text-slate-900">{safeStr(cotizacion?.estado)}</span>
            </li>
          </ul>
        </section>

        {/* Formulario inferior / Detalle existente */}
        {!yaRegistrada ? (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-center text-slate-900 font-semibold mb-6">
              Complete la siguiente información
            </h3>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-600">
                  Distribuidora
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  value={distribuidora}
                  onChange={(e) => setDistribuidora(e.target.value)}
                  required
                >
                  {DISTRIBUIDORAS.map((opt) => (
                    <option key={opt.value || 'default'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-600">
                  Recibo de pago N° <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  placeholder="Digite el número de recibo de pago"
                  value={numeroRecibo}
                  onChange={(e) => setNumeroRecibo(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-600">
                  Copia de la cédula <span className="text-rose-600">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setCedulaFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-600">
                  Manifiesto <span className="text-rose-600">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setManifiestoFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-sm text-slate-600">Observaciones</label>
                <textarea
                  className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  rows={4}
                  placeholder="Observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="md:col-span-2 mt-2 flex items-center justify-between">
                <Link to={`/creditos/detalle/${codigo_credito}`}>
                  <button
                    type="button"
                    className="btn border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    ⟵ Volver
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                >
                  {isPending ? 'Enviando…' : '✓ Aceptar'}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Solicitud registrada</h3>

              <div className="hidden md:flex flex-wrap items-center gap-2">
                <span className={estadoBadge(solicitud?.autorizado).clase}>
                  Autorizado: {estadoBadge(solicitud?.autorizado).texto}
                </span>
                <span className={estadoBadge(solicitud?.facturado).clase}>
                  Facturado: {estadoBadge(solicitud?.facturado).texto}
                </span>
                <span className={estadoBadge(solicitud?.entregaAutorizada).clase}>
                  Entrega: {estadoBadge(solicitud?.entregaAutorizada).texto}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Datos de la solicitud</h4>

                <dl className="text-sm text-slate-700 grid grid-cols-1 gap-2">
                  <KV k="Agencia" v={solicitud?.agencia} />
                  <KV k="Distribuidora" v={solicitud?.distribuidora} />
                  <KV k="Código" v={solicitud?.codigo} />
                  <KV k="Cliente" v={solicitud?.cliente} />
                  <KV
                    k="Tipo"
                    v={
                      <span className="badge badge-info badge-sm font-medium">
                        {solicitud?.tipo ?? '—'}
                      </span>
                    }
                  />
                  <KV k="Recibo pago" v={solicitud?.numeroRecibo} />
                  <KV
                    k="Autorizado"
                    v={<span className={estadoBadge(solicitud?.autorizado).clase}>
                      {estadoBadge(solicitud?.autorizado).texto}
                    </span>}
                  />
                  <KV
                    k="Facturado"
                    v={<span className={estadoBadge(solicitud?.facturado).clase}>
                      {estadoBadge(solicitud?.facturado).texto}
                    </span>}
                  />
                  <KV
                    k="Entrega autorizada"
                    v={<span className={estadoBadge(solicitud?.entregaAutorizada).clase}>
                      {estadoBadge(solicitud?.entregaAutorizada).texto}
                    </span>}
                  />
                  <KV k="Creado" v={solicitud?.fechaCreacion} />
                  <KV k="Actualizado" v={solicitud?.actualizado} />
                </dl>
              </div>

              {/* Documentos */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Documentos</h4>

                <ul className="text-sm text-slate-700 space-y-3">
                  {/* Cédula */}
                  <li className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium block">Cédula</span>
                      <span className="text-xs text-slate-500">Documento de identidad</span>
                    </div>

                    {solicitud?.cedulaPath ? (
                      <a
                        className="btn btn-sm btn-outline"
                        href={`${BaseUrl}/${solicitud.cedulaPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver o descargar cédula"
                      >
                        Ver / descargar
                      </a>
                    ) : (
                      <span className={badgeNeutro('No adjunta').clase}>
                        {badgeNeutro('No adjunta').texto}
                      </span>
                    )}
                  </li>

                  {/* Manifiesto */}
                  <li className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium block">Manifiesto</span>
                      <span className="text-xs text-slate-500">Soporte de manifiesto</span>
                    </div>

                    {solicitud?.manifiestoPath ? (
                      <a
                        className="btn btn-sm btn-outline"
                        href={`${BaseUrl}/${solicitud.manifiestoPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver o descargar manifiesto"
                      >
                        Ver / descargar
                      </a>
                    ) : (
                      <span className={badgeNeutro('No adjunto').clase}>
                        {badgeNeutro('No adjunto').texto}
                      </span>
                    )}
                  </li>

                  <li className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium block">Factura</span>
                      <span className="text-xs text-slate-500">Factura electrónica (demo)</span>
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
                  className="btn border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  aria-label="Volver al detalle del crédito"
                  title="Volver al detalle del crédito"
                >
                  ⟵ Volver
                </button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

/** Helpers visuales */
const RowRight: React.FC<{ label: string; value?: string; bold?: boolean; badge?: string }> = ({
  label,
  value = '',
  bold,
  badge = '',
}) => (
  <div className="px-5 py-3 grid grid-cols-12 items-center text-sm">
    <div className="col-span-8 sm:col-span-10 text-slate-700">{label}</div>
    <div
      className={`col-span-4 sm:col-span-2 text-right ${
        bold ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'
      }`}
    >
      {badge ? <span className={badge}>{value}</span> : value}
    </div>
  </div>
);

const KV: React.FC<{ k: string; v?: React.ReactNode }> = ({ k, v }) => (
  <div className="flex justify-between gap-4">
    <dt className="text-slate-500">{k}</dt>
    <dd className="font-medium text-right">{v ?? '—'}</dd>
  </div>
);

const estadoBadge = (ok?: boolean) => ({
  clase: `badge ${ok ? 'badge-success' : 'badge-error'} badge-sm font-medium`,
  texto: ok ? 'Sí' : 'No',
});

const badgeNeutro = (texto?: string) => ({
  clase: `badge badge-ghost badge-sm font-medium`,
  texto: texto ?? '',
});

/** Evita recalcular useMemo de lista de seguros con objetos iguales */
function regKey(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '';
  }
}

export default FacturarCreditoSolicitud;
