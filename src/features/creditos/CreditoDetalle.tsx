import React from 'react';
import {
    BadgeCheck, Building2, CalendarDays, Check, CheckCircle2, CheckSquare, ClipboardCheck, Download,
    FileDown, FileMinusIcon, FileSignature, Fingerprint, History, Info, LibraryBig, Mail,
    MessageCircle,
    MessageSquarePlus,
    Pencil,
    ShieldCheck, User2, Wrench,
    X,
} from 'lucide-react';
import { useCredito, useDeudor } from '../../services/creditosServices';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ChipButton from '../../shared/components/ChipButton';
import ChatThread from './ChatThread';
import { useModalStore } from '../../store/modalStore';
import ComentarioFormulario from './ComentarioFormulario';
import { useAuthStore } from '../../store/auth.store';
import Swal from 'sweetalert2';
import { useLoaderStore } from '../../store/loader.store';
import { Image, FileText } from 'lucide-react';
import ButtonLink from '../../shared/components/ButtonLink';


const fmtCOP = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);


const BadgeEstado: React.FC<{ value?: string }> = ({ value }) => {
    const safe = value ?? '—';
    const color =
        safe.toLowerCase().includes('apro')
            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
            : safe.toLowerCase().includes('rech')
                ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                : 'bg-warning text-black';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {safe}
        </span>
    );
};

const Row: React.FC<{ label: string; value?: React.ReactNode, color?: string, val?: string }> = ({ label, value, color = 'text-slate-600', val = 'text-slate-900' }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className={`text-sm ${color}`}>{label}</span>
        <span className={`text-sm font-medium  text-right ${val}`}>{value ?? '—'}</span>
    </div>
);


const CreditoDetalle: React.FC = () => {
    // Tomar el código desde la URL
    const { id: codigoFromUrl } = useParams<{ id: string }>();
    const codigo_credito = String(codigoFromUrl ?? '');
    const navigate = useNavigate();

    // Si tu hook soporta "enabled", genial; si no, quítalo
    const { data: datos, isLoading, error } = useCredito({ codigo_credito }, !!codigo_credito);

    const {
        data: deudor,
        isLoading: loadingDeudor,
        error: errorDeudor,
    } = useDeudor(codigo_credito);


    const warnedMissingDeudor = React.useRef(false);

React.useEffect(() => {
  if (warnedMissingDeudor.current) return;          // no repetir
  if (!codigo_credito) return;                      // sin código, nada que hacer
  if (loadingDeudor) return;                        // espera a que termine

  // ¿404 desde el hook o data vacía?
  const status =
    (errorDeudor as any)?.response?.status ??
    (errorDeudor as any)?.status ??
    null;

  const notFound = status === 404;
  const missing = !deudor || (deudor as any)?.data == null;

  if (notFound || missing) {
    warnedMissingDeudor.current = true;

    Swal.fire({
      icon: 'warning',
      title: 'Falta información del crédito',
      text: 'Debes completar la información del deudor para continuar.',
      confirmButtonText: 'Completar ahora',
    }).then(() => {
      // redirige a la vista de registro con el mismo código
      navigate(`/creditos/registrar/${encodeURIComponent(codigo_credito)}`, {
        replace: true,
      });
    });
  }
}, [codigo_credito, loadingDeudor, errorDeudor, deudor, navigate]);


    console.log("este el deusdor", deudor)
    const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};

    // Evita crasheos al desestructurar
    const {
        informacion_personal,
        informacion_laboral,
        referencias = [],
    } = deudorData as {
        informacion_personal?: any;
        informacion_laboral?: any;
        referencias?: any[];
    };

    // Dato principal (puede ser undefined mientras carga)
    const credito = datos?.creditos?.[0];

    // Fallbacks seguros para evitar crasheos
    // Asignación directa sin fallbacks
    const estado = credito?.estado;
    const agencia = 'Agencia';
    const creada = credito?.fecha_creacion;
    const registradaPor = credito?.asesor;

    // Sección "motocicleta": solo mapear lo que venga en el crédito
    const moto = {
        modelo: credito?.producto,
        numeroCuotas: credito?.plazo_meses,
        fechaPago: undefined, // no hay campo equivalente en crédito
        numeroChasis: credito?.numero_chasis,
        placa: credito?.placa,
        valorMotocicleta: (typeof credito?.valor_producto === 'number') ? credito?.valor_producto : undefined,
        cuotaInicial: (typeof credito?.cuota_inicial === 'number') ? credito?.cuota_inicial : undefined,
        valorCuota: undefined, // no viene en el crédito
        numeroMotor: credito?.numero_motor,
        fechaEntrega: credito?.fecha_entrega,
    };


    // Descargas: si hay "firmas" o "soportes", habilitar enlaces; de lo contrario, botones simulados
    const firmasHref: string | undefined = typeof credito?.firmas === 'string' && credito.firmas.length > 0 ? `/${credito.firmas}` : undefined;



    const fakeDownload = (what: string) => () => alert(`Descargando: ${what} (simulado)`);


    const open = useModalStore((s) => s.open);

    // ...

    const abrirFormularioComentario = () => {
        if (!codigo_credito) return;
        open(
            <ComentarioFormulario key={`cmt-${codigo_credito}`} codigo_credito={codigo_credito} />,
            "Nuevo comentario",
            { size: "sm", position: "center" }
        );
    };



    const handleEliminar = async () => {
        const result = await Swal.fire({
            title: "¿Eliminar garantía extendida?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280", // gris Tailwind
        });

        if (result.isConfirmed) {
            await Swal.fire({
                title: "Eliminada",
                text: "La garantía extendida fue eliminada correctamente ✅",
                icon: "success",
                confirmButtonText: "OK",
            });
            navigate("/creditos");
        }
    };

    const handleIncompleto = async () => {
        const result = await Swal.fire({
            title: "¿Pasar a incompleto?",
            text: "El crédito será marcado como incompleto",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#0284c7", // azul Tailwind
            cancelButtonColor: "#6b7280",
        });

        if (result.isConfirmed) {
            await Swal.fire({
                title: "Actualizado",
                text: "El crédito se pasó a estado 'Incompleto' ✅",
                icon: "success",
                confirmButtonText: "OK",
            });
            navigate("/creditos");
        }
    };



    const tieneDatosMoto = Boolean(
        moto?.numeroMotor || moto?.numeroChasis || moto?.placa
    );


    const soportes: string[] = [
        ...(credito?.soportes ? JSON.parse(credito.soportes) : []),
        ...(credito?.firmas ? [credito.firmas] : []),
        ...(credito?.formato_referencia ? [`docs_creditos/${credito.formato_referencia}`] : []),
        ...(credito?.formato_datacredito ? [`docs_creditos/${credito.formato_datacredito}`] : []),
    ];

    const BaseUrl = import.meta.env.VITE_API_URL ?? "http://tuclick.vozipcolombia.net.co/motos/back";

    const { show, hide } = useLoaderStore();

    React.useEffect(() => {
        if (isLoading) {
            show();   // 🔵 activa overlay global
        } else {
            hide();   // 🔵 lo oculta
        }
    }, [isLoading, show, hide]);



    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur px-3 bg-slate-100 border border-white">

                <div className='pt-4 mb-3'>
                    <ButtonLink to="/creditos" label="Volver a creditos" direction="back" />
                </div>

                <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LibraryBig className="w-6 h-6 text-success" />
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-success">
                            Visualizar crédito
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <BadgeEstado value={estado} />
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-full px-4 py-6 space-y-6">
                {/* Mensajes de estado */}

                {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                        Ocurrió un error al cargar el crédito.
                    </div>
                )}

                {/* Información de la solicitud */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 text-slate-800">
                                <Info className="w-5 h-5" />
                                <h2 className="text-base sm:text-lg font-semibold">
                                    Información de la solicitud de crédito
                                </h2>
                            </div>
                            <div className="md:hidden"><BadgeEstado value={estado} /></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-xl bg-[#3498DB] p-4 ring-1 ring-slate-200">
                                <Row color='text-white' label="Estado" value={<BadgeEstado value={estado} />} />
                                <Row color='text-white' label="Agencia" val='text-white' value={agencia} />
                            </div>

                            <div className="rounded-xl bg-[#3498DB] p-4 ring-1 ring-slate-200">
                                <Row color='text-white' label="Creada" value={<span className="inline-flex items-center gap-2 text-white"><CalendarDays className="w-4 h-4" />{creada}</span>} />
                                <Row color='text-white' label="Registrada por" value={<span className="inline-flex items-center gap-2 text-white"><User2 className="w-4 h-4" />{registradaPor}</span>} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Información de la motocicleta */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-800">
                            <Wrench className="w-5 h-5" />
                            <h2 className="text-base sm:text-lg font-semibold">Información de la motocicleta</h2>
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-xl p-4 ring-1 ring-slate-200 bg-slate-50">
                                <Row label="Motocicleta" value={moto?.modelo} />
                                <Row label="Número de cuotas" value={moto?.numeroCuotas} />
                                <Row label="Fecha de pago" value={moto?.fechaPago} /> {/* estático si no hay */}
                                <Row label="Número de chasis" value={moto?.numeroChasis} />
                                <Row label="Placa" value={moto?.placa} />


                                {estado === 'Aprobado' && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <ChipButton
                                            label="Descargar solicitud"
                                            icon={<ClipboardCheck className="w-4 h-4" />}
                                            onClick={fakeDownload('Solicitud de crédito')}
                                            color="bg-blue-500 hover:bg-blue-600"
                                        />
                                        <ChipButton
                                            label="Descargar formato"
                                            icon={<FileSignature className="w-4 h-4" />}
                                            onClick={fakeDownload('Formato de referenciación')}
                                            color="bg-green-500 hover:bg-green-600"
                                        />
                                        <ChipButton
                                            label="Descargar carta"
                                            icon={<Mail className="w-4 h-4" />}
                                            onClick={fakeDownload('Carta de aprobación')}
                                            color="bg-purple-500 hover:bg-purple-600"
                                        />
                                        <ChipButton
                                            label="Descargar RUNT"
                                            icon={<Fingerprint className="w-4 h-4" />}
                                            onClick={fakeDownload('RUNT')}
                                            color="bg-orange-500 hover:bg-orange-600"
                                        />
                                    </div>
                                )}
                            </div>


                            <div className="rounded-xl p-4 ring-1 ring-slate-200 bg-slate-50">
                                <Row label="Valor de motocicleta" value={moto?.valorMotocicleta != null ? fmtCOP(moto.valorMotocicleta) : '—'} />
                                <Row label="Cuota inicial" value={moto?.cuotaInicial != null ? fmtCOP(moto.cuotaInicial) : '—'} />
                                <Row label="Valor cuota" value={moto?.valorCuota != null ? fmtCOP(moto.valorCuota) : '—'} /> {/* estático si no hay */}
                                <Row label="Número de motor" value={moto?.numeroMotor} />
                                <Row label="Fecha de entrega" value={moto?.fechaEntrega} />


                                {estado === 'Aprobado' && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <ChipButton
                                            label="Descargar firmas de solicitud"
                                            icon={<FileDown className="w-4 h-4" />}
                                            onClick={!firmasHref ? fakeDownload('Firmas de solicitud') : undefined}
                                            color="bg-pink-500 hover:bg-pink-600"
                                        />
                                        <ChipButton
                                            label="Descargar tabla"
                                            icon={<History className="w-4 h-4" />}
                                            onClick={fakeDownload('Tabla de amortización')}
                                            color="bg-indigo-500 hover:bg-indigo-600"
                                        />
                                        <ChipButton
                                            label="Descargar paquete"
                                            icon={<ShieldCheck className="w-4 h-4" />}
                                            onClick={fakeDownload('Paquete de crédito')}
                                            color="bg-teal-500 hover:bg-teal-600"
                                        />
                                        <ChipButton
                                            label="Descargar Garantía"
                                            icon={<BadgeCheck className="w-4 h-4" />}
                                            onClick={fakeDownload('Garantía extendida')}
                                            color="bg-red-500 hover:bg-red-600"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>




                {/* Información personal */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                            <User2 className="w-5 h-5" /> Información personal del deudor
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#F1FCF6] p-4 rounded-xl ring-1 ring-success">
                                <Row label="Tipo de documento" value={informacion_personal?.tipo_documento} />
                                <Row label="Número de documento" value={informacion_personal?.numero_documento} />
                                <Row label="Fecha de expedición" value={informacion_personal?.fecha_expedicion} />
                                <Row label="Lugar de expedición" value={informacion_personal?.lugar_expedicion} />
                                <Row label="Nombres" value={`${informacion_personal?.primer_nombre} ${informacion_personal?.segundo_nombre}`} />
                                <Row label="Apellidos" value={`${informacion_personal?.primer_apellido} ${informacion_personal?.segundo_apellido}`} />
                                <Row label="Fecha de nacimiento" value={informacion_personal?.fecha_nacimiento} />
                                <Row label="Nivel de estudios" value={informacion_personal?.nivel_estudios} />
                            </div>
                            <div className="bg-[#F1FCF6] p-4 rounded-xl ring-1 ring-success">
                                <Row label="Ciudad de residencia" value={informacion_personal?.ciudad_residencia} />
                                <Row label="Barrio de residencia" value={informacion_personal?.barrio_residencia || '—'} />
                                <Row label="Dirección de residencia" value={informacion_personal?.direccion_residencia} />
                                <Row label="Teléfono fijo" value={informacion_personal?.telefono_fijo} />
                                <Row label="Número de celular" value={informacion_personal?.celular} />
                                <Row label="Email" value={informacion_personal?.email} />
                                <Row label="Estado civil" value={informacion_personal?.estado_civil} />
                                <Row label="Personas a cargo" value={informacion_personal?.personas_a_cargo} />
                                <Row label="Tipo de vivienda" value={informacion_personal?.tipo_vivienda} />
                                <Row label="Costo del arriendo" value={fmtCOP(Number(informacion_personal?.costo_arriendo))} />
                                <Row label="Finca raíz" value={informacion_personal?.finca_raiz} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <ChipButton label="Descargar Datacrédito" icon={<Download className="w-4 h-4" />} onClick={fakeDownload('Datacrédito')} />
                        </div>
                    </div>
                </section>


                {/* Información laboral */}
                {/* Información laboral */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                            <Building2 className="w-5 h-5" /> Información laboral
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl ring-1 ring-slate-200">
                                <Row label="Empresa donde labora" value={informacion_laboral?.empresa} />
                                <Row label="Dirección empleador" value={informacion_laboral?.direccion_empleador} />
                                <Row label="Teléfono del empleador" value={informacion_laboral?.telefono_empleador} />
                                <Row label="Cargo" value={informacion_laboral?.cargo} />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl ring-1 ring-slate-200">
                                <Row label="Tipo de contrato" value={informacion_laboral?.tipo_contrato} />
                                <Row label="Tiempo de servicio" value={informacion_laboral?.tiempo_servicio} />
                                <Row label="Salario" value={fmtCOP(Number(informacion_laboral?.salario))} />
                            </div>
                        </div>
                    </div>
                </section>




                {/* Referencias */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                            <User2 className="w-5 h-5" /> Referencias del deudor
                        </h2>
                        {(!referencias || referencias.length === 0) ? (
                            <p className="text-slate-500">No hay referencias registradas.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {referencias.map((ref: any, idx: number) => (
                                    <div key={idx} className="bg-[#F0FAFF] p-4 rounded-xl ring-1 ring-info">
                                        <Row label="Nombres y apellidos" value={ref.nombre_completo} />
                                        <Row label="Dirección" value={ref.direccion} />
                                        <Row label="Tipo de referencia" value={ref.tipo_referencia} />
                                        <Row label="Número telefónico" value={ref.telefono} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>


                <section>
                    <details className="collapse bg-base-100 border-base-300 border">
                        <summary className="collapse-title font-semibold">
                            <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                                <FileSignature className="w-5 h-5" /> Soportes
                            </h2>
                        </summary>

                        <div className="collapse-content text-sm">
                            {soportes.length === 0 ? (
                                <p className="text-slate-500">No hay soportes disponibles.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {soportes.map((s, idx) => {
                                        const href = `${BaseUrl}/${s}`;
                                        const fileName = s.split('/').pop() ?? `Soporte ${idx + 1}`;
                                        const isImg = /\.(png|jpe?g|gif|webp)$/i.test(s);
                                        const isPdf = /\.pdf$/i.test(s);
                                        const isDoc = /\.(docx?|odt)$/i.test(s);

                                        return (
                                            <article
                                                key={idx}
                                                className="group rounded-xl ring-1 ring-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <div className="aspect-video bg-slate-50 flex items-center justify-center">
                                                    {isImg ? (
                                                        <img
                                                            src={href}
                                                            alt={fileName}
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : isPdf ? (
                                                        <embed
                                                            src={href}
                                                            type="application/pdf"
                                                            className="h-full w-full"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                                            <FileDown className="w-10 h-10" />
                                                            <span className="text-xs mt-1">Vista no disponible</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4 space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        {isImg ? (
                                                            <Image className="w-4 h-4 text-slate-500 shrink-0" />
                                                        ) : isPdf ? (
                                                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                                        ) : isDoc ? (
                                                            <FileSignature className="w-4 h-4 text-slate-500 shrink-0" />
                                                        ) : (
                                                            <FileDown className="w-4 h-4 text-slate-500 shrink-0" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p
                                                                className="text-sm font-medium text-slate-800 truncate"
                                                                title={fileName}
                                                            >
                                                                {fileName}
                                                            </p>
                                                            <p className="text-xs text-slate-500 break-words">{s}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-1">
                                                        <a
                                                            href={href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline"
                                                        >
                                                            Abrir
                                                        </a>
                                                        <a
                                                            href={href}
                                                            download
                                                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            Descargar
                                                        </a>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </details>
                </section>





                <section >
                    <details className="collapse bg-base-100 border-base-300 border">
                        <summary className="collapse-title font-semibold">
                            <h2 className="text-base sm:text-lg font-semibold  flex items-center gap-2 text-slate-800">
                                <MessageCircle className="w-5 h-5" /> Comentarios Realizados
                            </h2>
                        </summary>
                        <div className="collapse-content text-sm">

                            <div className="sticky mb-5 top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 ">
                                <div className="px-6 mt-2">
                                    <div className="grid grid-cols-2 text-center text-xs sm:text-sm font-medium text-neutral-600">
                                        <div className="py-1 rounded-lg bg-neutral-100">Asesor</div>
                                        <div className="py-1 rounded-lg bg-neutral-100">Administrador</div>
                                    </div>
                                </div>
                            </div>
                            <ChatThread />
                        </div>
                    </details>

                </section>





                <section className="rounded-2xl flex gap-5 p-6 border border-slate-200 bg-white shadow-sm">
                    <button
                        className="btn bg-success hover:bg-green-500 text-white flex items-center gap-2"
                        onClick={abrirFormularioComentario}
                        title="Agregar comentario"
                    >
                        <MessageSquarePlus className="w-4 h-4" />
                        Agregar comentario
                    </button>

                    {useAuthStore.getState().user?.rol === "Asesor" && estado === 'Aprobado' && !tieneDatosMoto && (
                        <>
                            <Link to={`/creditos/detalle/cerrar-credito/${codigo_credito}`}>
                                <button className="btn flex btn-warning items-center gap-2">
                                    <FileMinusIcon className="w-4 h-4" />
                                    Cerrar Crédito
                                </button>
                            </Link>
                        </>
                    )}



                    {useAuthStore.getState().user?.rol === "Administrador" && (

                        <>
                            <button
                                type='button'
                                className="btn flex items-center gap-2"
                                onClick={handleEliminar}
                            >
                                <X className="w-4 h-4" />
                                Eliminar garantía extendida
                            </button>


                            <button
                                type='button'
                                className="btn bg-sky-400 hover:bg-sky-500 text-white flex items-center gap-2"
                                onClick={handleIncompleto}
                            >
                                <CheckSquare className="w-4 h-4" />
                                Pasar a incompleto
                            </button>



                            {useAuthStore.getState().user?.rol === "Administrador" && estado != 'Aprobado' && (
                                <Link to={`/creditos/detalle/cambiar-estado/${codigo_credito}`}>


                                    <button
                                        className="btn btn-warning text-white flex items-center gap-2"
                                    >
                                        <Pencil className="w-4 h-4" />

                                        Cambiar Estado
                                    </button>
                                </Link>
                            )}
                        </>
                    )}


                    {useAuthStore.getState().user?.rol === "Asesor" && estado === 'Aprobado' && tieneDatosMoto && (

                        <>


                            <Link to={`/creditos/detalle/facturar-credito/${codigo_credito}`}>

                                <button
                                    className="btn bg-sky-400 hover:bg-sky-500 text-white flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Facturar Credito
                                </button>
                            </Link>
                        </>
                    )}
                </section>

            </div>
        </main>
    );
};

export default CreditoDetalle;
