import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCredito, useDeudor } from '../../../services/creditosServices';
import { CalendarDays, User2 } from 'lucide-react';
import { useRegistrarSolicitudFacturacion, useSolicitudesPorCodigoCredito } from '../../../services/solicitudServices';
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
    : (v === 0 ? '0 COP' : ''); // si no existe, vacío; si es 0, muestra 0 COP

const safeStr = (v?: unknown) => (typeof v === 'string' ? v : '');

const FacturarCredito: React.FC = () => {
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? '');

  const { data: datos, isLoading, error } = useCredito({ codigo_credito }, !!codigo_credito);
  const { data: deudor } = useDeudor(codigo_credito);


  // ➕ NUEVO: consultar si ya hay solicitud para este crédito
  const { data: solicitudesCredito, isLoading: loadingSolic } =
    useSolicitudesPorCodigoCredito(codigo_credito);
  const solicitud = solicitudesCredito?.[0] ?? null;


  console.log("ss", solicitud)

  // si hay solicitud -> ocultar formulario
  const [yaRegistrada, setYaRegistrada] = useState(false);
  useEffect(() => { setYaRegistrada(!!solicitud); }, [solicitud]);

  // -------------------- NUEVO: estado del formulario --------------------
  const [distribuidora, setDistribuidora] = useState<string>("");
  const [numeroRecibo, setNumeroRecibo] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [manifiestoFile, setManifiestoFile] = useState<File | null>(null);

  // Para el nombre del usuario logueado (ajusta según tu auth)
  const loggedUserName =
    (window as any)?.auth?.user?.name ||
    (window as any)?.user?.name ||
    'Usuario';

  const { mutate: registrarSolicitud, isPending } = useRegistrarSolicitudFacturacion();


  // Hook/función para enviar al backend (reemplaza por tu hook real .mutate(fd))
  const submitFormData = (fd: FormData) => {
    // 👉 Reemplaza esto por tu hook ya hecho, por ejemplo:
    // enviarFactura.mutate(fd)
    registrarSolicitud(fd);
  };
  // ----------------------------------------------------------------------

  // Fuente de verdad (mismo criterio que usas en otras vistas)
  const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};
  const credito = datos?.creditos?.[0];

  // --- Cliente ---
  const clienteNombre =
    [deudorData?.informacion_personal?.primer_nombre, deudorData?.informacion_personal?.segundo_nombre, deudorData?.informacion_personal?.primer_apellido, deudorData?.informacion_personal?.segundo_apellido]
      .filter(Boolean)
      .join(' ');
  const clienteDoc = `${safeStr(deudorData?.informacion_personal?.tipo_documento) ?? ''} ${safeStr(deudorData?.informacion_personal?.numero_documento) ?? ''}`.trim();
  const clienteDireccion = [safeStr(deudorData?.informacion_personal?.ciudad_residencia), safeStr(deudorData?.informacion_personal?.direccion_residencia)]
    .filter(Boolean)
    .join(', ');
  const clienteTelefono = safeStr(deudorData?.informacion_personal?.celular) || safeStr(deudorData?.informacion_personal?.telefono_fijo);
  const clienteCorreo = safeStr(deudorData?.informacion_personal?.email);

  // --- Moto ---
  const motoNombre = safeStr(credito?.producto); // p.ej. "Kymco Agility Fusion"
  const numMotor = safeStr(credito?.numero_motor);
  const numChasis = safeStr(credito?.numero_chasis);
  const color = safeStr((credito as any)?.color);

  // --- Costos base ---
  const valorMoto: number | undefined =
    typeof credito?.valor_producto === 'number' ? credito?.valor_producto : undefined;

  // Si hay valorMoto, calculamos bruto + IVA para la primera tabla "Condiciones del negocio".
  // Tomamos el bruto como valorMoto / 1.19 (redondeo a entero) y el IVA como diferencia.
  const { valorBruto, ivaCalc } = useMemo(() => {
    if (typeof valorMoto === 'number' && Number.isFinite(valorMoto) && valorMoto > 0) {
      const bruto = Math.round(valorMoto / 1.19);
      const iva = Math.max(valorMoto - bruto, 0);
      return { valorBruto: bruto, ivaCalc: iva };
    }
    return { valorBruto: undefined, ivaCalc: undefined };
  }, [valorMoto]);

  // Extras opcionales (si no existen, se dejan vacíos)
  const soat: MaybeNum = (credito as any)?.soat;
  const matricula: MaybeNum = (credito as any)?.matricula;
  const impuestos: MaybeNum = (credito as any)?.impuestos;
  const accesoriosYSeguros: MaybeNum = (credito as any)?.accesorios || (credito as any)?.seguros_accesorios;

  // TOTAL general (si alguno no existe, no rompe; suma solo los numéricos)
  const totalGeneral: number | undefined = useMemo(() => {
    const parts = [valorMoto, soat, matricula, impuestos, accesoriosYSeguros].filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n)
    );
    return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
  }, [valorMoto, soat, matricula, impuestos, accesoriosYSeguros]);

  const fechaCreacion = safeStr(credito?.fecha_creacion);
  const asesor = safeStr(credito?.asesor);
  const numeroSolicitud = credito?.id ?? credito?.codigo_credito ?? credito?.codigo_credito ?? codigo_credito;

  // Observaciones (cuota inicial y saldo)
  const cuotaInicial: MaybeNum = typeof (credito as any)?.cuota_inicial === 'number' ? (credito as any)?.cuota_inicial : undefined;
  const saldoFinanciar: number | undefined =
    typeof valorMoto === 'number'
      ? Math.max(valorMoto - (typeof cuotaInicial === 'number' ? cuotaInicial : 0), 0)
      : undefined;

  // Garantía extendida (si existe)
  const garantiaExtendida: MaybeNum = (credito as any)?.garantia_extendida_valor;

  // -------------------- Listas pedidas --------------------
  const AGENCIAS = ["Sucursal Norte", "Sucursal Centro", "Sucursal Sur"];

  // Encima del componente (o fuera del return)
  const DISTRIBUIDORAS = [
    { value: "", label: "Seleccione…" },
    { value: "gente-motos", label: "Gente Motos" },
    { value: "supermotos-mym", label: "Supermotos MyM" },
    { value: "unymotos-sas", label: "Unymotos SAS" },
    { value: "distrimotos-yamaha", label: "Distrimotos Yamaha" },
    { value: "dismerca", label: "Dismerca" },
    { value: "supermotos-honda", label: "Supermotos Honda" },
    { value: "motored-hero", label: "Motored Hero" },
    { value: "los-coches", label: "Los Coches" },
    { value: "potenza", label: "Potenza" },
    { value: "garcia-y-montoya", label: "Garcia y Montoya" },
    { value: "motox-1-yamaha", label: "Motox 1 Yamaha" },
    { value: "yamaha-del-cafe", label: "Yamaha del Cafe" },
    { value: "ibiza-motos", label: "Ibiza Motos" },
    { value: "sukipartes", label: "Sukipartes" },
    { value: "tiendas-uma", label: "Tiendas UMA" },
    { value: "zagamotos", label: "Zagamotos" },
    { value: "simotos", label: "Simotos" },
    { value: "megamotos-akt", label: "Megamotos AKT" },
  ];

  // -------------------- Submit: armar FormData como en Postman --------------------
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Agencia aleatoria
    const agenciaRandom = AGENCIAS[Math.floor(Math.random() * AGENCIAS.length)];

    // Distribuidora: mandamos el label (texto visible)
    const distLabel = DISTRIBUIDORAS.find(d => d.value === distribuidora)?.label ?? "";

    // Código de solicitud: 4 cifras
    const codigo4 = String(Math.floor(1000 + Math.random() * 9000)); // 1000..9999

    const fd = new FormData();
    fd.append('agencia', agenciaRandom);
    fd.append('distribuidora', distLabel);
    fd.append('distribuidora_id', '1');
    fd.append('codigo_solicitud', codigo4);
    fd.append('codigo_credito', codigo_credito);
    fd.append('nombre_cliente', clienteNombre);
    fd.append('tipo_solicitud', 'Crédito directo');
    fd.append('numero_recibo', numeroRecibo);
    fd.append('resibo_pago', ''); // null en multipart: cadena vacía
    fd.append('facturador', loggedUserName);
    fd.append('autorizado', 'Si');
    fd.append('facturado', 'No');
    fd.append('entrega_autorizada', 'No');
    fd.append('observaciones', observaciones);

    if (cedulaFile) fd.append('cedula', cedulaFile);
    if (manifiestoFile) fd.append('manifiesto', manifiestoFile);

    submitFormData(fd);
  }, [AGENCIAS, DISTRIBUIDORAS, distribuidora, numeroRecibo, observaciones, cedulaFile, manifiestoFile, codigo_credito, clienteNombre, loggedUserName]);
  // -------------------------------------------------------------------------------

  const BaseUrl = import.meta.env.VITE_API_URL ?? "http://tuclick.vozipcolombia.net.co/motos/back";


  return (
    <main className="min-h-screen w-full bg-slate-50">
      {/* Header / Migas */}
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
            

        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-start gap-5">
           <div className='pt-4 mb-3'>
                    <ButtonLink to="/creditos" label="Volver a creditos" direction="back" />
                </div>
          <h1 className="text-xl font-semibold tracking-tight badge badge-soft badge-success">Solicitar facturación</h1>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-8 space-y-6">
        {(isLoading) && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">Cargando información…</div>
        )}

        {(loadingSolic) && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">Cargando información…</div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            Ocurrió un error al cargar el crédito.
          </div>
        )}

        {/* Encabezado: Información del cliente + caja lateral con solicitud */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-base font-semibold text-emerald-700 mb-3">Información del cliente</h2>
              <div className="text-sm leading-6 text-slate-700 space-y-1.5">
                <div className="font-medium text-slate-900">{clienteNombre}</div>
                <div className="text-slate-600">{clienteDoc}</div>
                <div className="text-slate-600">{clienteDireccion}</div>
                <div><span className="font-semibold text-slate-700">Teléfono:</span> <span className="text-slate-600">{clienteTelefono || ''}</span></div>
                <div><span className="font-semibold text-slate-700">Correo:</span> <span className="text-slate-600">{clienteCorreo}</span></div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="h-full rounded-lg bg-[#F1FCF6] border border-success p-4 flex flex-col justify-center md:justify-end md:items-end">
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">Solicitud #{numeroSolicitud ?? ''}</div>
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
            <RowRight label="Valor Moto:" value={fmtCOP(valorMoto)} />
            <RowRight label="Valor bruto:" value={fmtCOP(valorBruto)} />
            <RowRight label="IVA:" value={fmtCOP(ivaCalc)} />
            <RowRight label="Total:" value={fmtCOP(valorMoto)} bold badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5" />
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
              <RowRight label="Valor bruto:" value={fmtCOP(accesoriosYSeguros ? Math.round((accesoriosYSeguros as number) / 1.19) : undefined)} />
              <RowRight label="IVA:" value={fmtCOP(accesoriosYSeguros ? (accesoriosYSeguros as number) - Math.round((accesoriosYSeguros as number) / 1.19) : undefined)} />
              <RowRight label="Total:" value={fmtCOP(accesoriosYSeguros)} />
            </div>
          </div>

          {/* TOTAL */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
              TOTAL
            </div>
            <div className="divide-y divide-slate-200">
              <RowRight label="Valor Moto:" value={fmtCOP(valorMoto)} />
              <RowRight label="SOAT:" value={fmtCOP(soat)} />
              <RowRight label="Matrícula:" value={fmtCOP(matricula)} />
              <RowRight label="Impuestos:" value={fmtCOP(impuestos)} />
              <RowRight label="Seguros y accesorios:" value={fmtCOP(accesoriosYSeguros)} />
              <RowRight label="TOTAL:" value={fmtCOP(totalGeneral)} bold badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5" />
            </div>
          </div>
        </section>

        {/* Observaciones */}
        <section className="rounded-xl border border-success bg-[#F1FCF6] p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Observaciones</h3>
          <ul className="list-disc pl-6 text-sm leading-7 text-slate-700 space-y-1">
            <li>
              Crédito aprobado por <span className="font-semibold text-slate-900">Crédito directo</span>
            </li>
            <li>
              El crédito tiene una cuota inicial de <span className="font-semibold text-slate-900">{fmtCOP(cuotaInicial)}</span>
            </li>
            <li>
              El saldo a financiar del producto es <span className="font-semibold text-slate-900">{fmtCOP(saldoFinanciar)}</span>
            </li>
            <li>
              La garantía extendida tiene un valor de <span className="font-semibold text-slate-900">{fmtCOP(garantiaExtendida)}</span>
            </li>
            <li>
              Incluye los siguientes seguros:
            </li>
          </ul>
        </section>

        {/* Formulario inferior */}

        {!yaRegistrada ? (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-center text-slate-900 font-semibold mb-6">Complete la siguiente información</h3>

            {/* 🔽 Envolvemos en <form> para manejar submit sin romper estilos */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-600">Distribuidora</label>
                <select
                  className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  value={distribuidora}
                  onChange={(e) => setDistribuidora(e.target.value)}
                  required
                >
                  {DISTRIBUIDORAS.map((opt) => (
                    <option key={opt.value || "default"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-600">Recibo de pago N° <span className="text-rose-600">*</span></label>
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
                <label className="text-sm text-slate-600">Copia de la cédula <span className="text-rose-600">*</span></label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setCedulaFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-600">Manifiesto <span className="text-rose-600">*</span></label>
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
                  <button type="button" className="btn border-slate-300 bg-white hover:bg-slate-50 text-slate-700">⟵ Volver</button>
                </Link>
                <button type="submit" disabled={isPending} className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600">
                  {isPending ? 'Enviando…' : '✓ Aceptar'}
                </button>            </div>
            </form>
          </section>
        ) : (
          /* Si NO hay solicitud registrada, mostramos el formulario */
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Encabezado */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Solicitud registrada</h3>

              {/* Badges de estado (DaisyUI) */}
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
              {/* Datos de la solicitud */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Datos de la solicitud</h4>

                <dl className="text-sm text-slate-700 grid grid-cols-1 gap-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Agencia</dt>
                    <dd className="font-medium text-right">{solicitud?.agencia ?? '—'}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Distribuidora</dt>
                    <dd className="font-medium text-right">{solicitud?.distribuidora ?? '—'}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Código</dt>
                    <dd className="font-medium text-right">{solicitud?.codigo ?? '—'}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Código crédito</dt>
                    <dd className="font-medium text-right">{solicitud?.codigoCredito ?? '—'}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Cliente</dt>
                    <dd className="font-medium text-right">{solicitud?.cliente ?? '—'}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Tipo</dt>
                    <dd className="text-right">
                      <span className="badge badge-info badge-sm font-medium">
                        {solicitud?.tipo ?? '—'}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Recibo pago</dt>
                    <dd className="font-medium text-right">{solicitud?.numeroRecibo ?? '—'}</dd>
                  </div>

                  {/* Badges en detalle también */}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Autorizado</dt>
                    <dd className="text-right">
                      <span className={estadoBadge(solicitud?.autorizado).clase}>
                        {estadoBadge(solicitud?.autorizado).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Facturado</dt>
                    <dd className="text-right">
                      <span className={estadoBadge(solicitud?.facturado).clase}>
                        {estadoBadge(solicitud?.facturado).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Entrega autorizada</dt>
                    <dd className="text-right">
                      <span className={estadoBadge(solicitud?.entregaAutorizada).clase}>
                        {estadoBadge(solicitud?.entregaAutorizada).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Creado</dt>
                    <dd className="font-medium text-right">{solicitud?.fechaCreacion ?? '—'}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Actualizado</dt>
                    <dd className="font-medium text-right">{solicitud?.actualizado ?? '—'}</dd>
                  </div>
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

const RowRight: React.FC<{ label: string; value?: string; bold?: boolean, badge?: string }> = ({ label, value = '', bold, badge = '' }) => (
  <div className="px-5 py-3 grid grid-cols-12 items-center text-sm">
    <div className="col-span-8 sm:col-span-10 text-slate-700">{label}</div>
    <div className={`col-span-4 sm:col-span-2 text-right ${bold ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
      {badge ? <span className={badge}>{value}</span> : value}
    </div>
  </div>
);

export default FacturarCredito;



// Helper para badges DaisyUI
const estadoBadge = (ok?: boolean) => ({
  clase: `badge ${ok ? 'badge-success' : 'badge-error'} badge-sm font-medium`,
  texto: ok ? 'Sí' : 'No',
});

const badgeNeutro = (texto?: string) => ({
  clase: `badge badge-ghost badge-sm font-medium`,
  texto: texto ?? '—',
});
