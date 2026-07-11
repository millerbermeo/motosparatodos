



import React from 'react';
import {
    CalendarDays, CheckCircle2,
    Info, LibraryBig,
    User2, Wrench,

} from 'lucide-react';
import { useCredito, useDeudor } from '../../services/creditosServices';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import CerrarCreditoFormulario from './forms/CerrarCreditoFormulario';
import { useLoaderStore } from '../../store/loader.store';
import ButtonLink from '../../shared/components/ButtonLink';
import { fmtCOP } from '../../utils/money';


const BadgeEstado: React.FC<{ value?: string }> = ({ value }) => {
    const safe = value ?? '—';
    const color =
        safe.toLowerCase().includes('apro')
            ? 'bg-success/10 text-success ring-1 ring-success/30'
            : safe.toLowerCase().includes('rech')
                ? 'bg-error/10 text-error ring-1 ring-error/30'
                : 'bg-warning text-black';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {safe}
        </span>
    );
};

const Row: React.FC<{ label: string; value?: React.ReactNode, color?: string, val?: string }> = ({ label, value, color = 'text-base-content/70', val = 'text-base-content' }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className={`text-sm ${color}`}>{label}</span>
        <span className={`text-sm font-medium  text-right ${val}`}>{value ?? 'Crédito no facturado actualmente'}</span>
    </div>
);


const CreditoDetalleAsesor: React.FC = () => {
    // Tomar el código desde la URL
    const { id: codigoFromUrl, cot: cotizacionFromUrl } = useParams<{ id: string; cot: string }>();
    const codigo_credito = String(codigoFromUrl ?? '');
    const id_cotizacion = String(cotizacionFromUrl ?? '');

    // Si tu hook soporta "enabled", genial; si no, quítalo
    const { data: datos, isLoading, error } = useCredito({ codigo_credito }, !!codigo_credito);

    const { data: deudor } = useDeudor(codigo_credito);


    const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};

    // Evita crasheos al desestructurar
    const {
        informacion_personal,
    } = deudorData as {
        informacion_personal?: any;
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





    const { show, hide } = useLoaderStore();

    React.useEffect(() => {
        if (isLoading) {
            show();   // 🔵 activa overlay global
        } else {
            hide();   // 🔵 lo oculta
        }
    }, [isLoading, show, hide]);


    return (
        <main className="min-h-screen w-full bg-linear-to-b from-base-100 to-base-100">
            {/* Header */}
            <header className="z-10 backdrop-blur px-3 bg-sky-600 rounded-2xl">
                <div className='pt-4 mb-3'>
                    <ButtonLink to="/creditos" label="Volver a creditos" direction="back" />
                </div>


                <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LibraryBig className="w-6 h-6 text-success" />
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
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
                    <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-error">
                        Ocurrió un error al cargar el crédito.
                    </div>
                )}

                {/* Información de la solicitud */}
                <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 text-base-content">
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
                <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4 text-base-content">
                            <Wrench className="w-5 h-5" />
                            <h2 className="text-base sm:text-lg font-semibold">Información de la motocicleta</h2>
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-xl p-4 ring-1 ring-slate-200 bg-base-200">
                                <Row label="Motocicleta" value={moto?.modelo} />
                                <Row label="Número de cuotas" value={moto?.numeroCuotas} />
                                <Row label="Fecha de pago" value={moto?.fechaPago} /> {/* estático si no hay */}
                                <Row label="Número de chasis" value={moto?.numeroChasis} />
                                <Row label="Placa" value={moto?.placa} />

                            </div>


                            <div className="rounded-xl p-4 ring-1 ring-slate-200 bg-base-200">
                                <Row label="Valor de motocicleta" value={moto?.valorMotocicleta != null ? fmtCOP(moto.valorMotocicleta) : '—'} />
                                <Row label="Cuota inicial" value={moto?.cuotaInicial != null ? fmtCOP(moto.cuotaInicial) : '—'} />
                                <Row label="Valor cuota" value={moto?.valorCuota != null ? fmtCOP(moto.valorCuota) : '—'} /> {/* estático si no hay */}
                                <Row label="Número de motor" value={moto?.numeroMotor} />
                                <Row label="Fecha de entrega" value={moto?.fechaEntrega} />
                            </div>

                        </div>
                    </div>
                </section>







                {/* Información personal */}
                <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-base-content">
                            <User2 className="w-5 h-5" /> Información personal del deudor
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-base-200 p-4 rounded-xl ring-1 ring-slate-200">
                                <Row label="Tipo de documento" value={informacion_personal?.tipo_documento} />
                                <Row label="Número de documento" value={informacion_personal?.numero_documento} />
                                <Row label="Fecha de expedición" value={informacion_personal?.fecha_expedicion} />
                                <Row label="Lugar de expedición" value={informacion_personal?.lugar_expedicion} />
                                <Row label="Nombres" value={`${informacion_personal?.primer_nombre} ${informacion_personal?.segundo_nombre}`} />
                                <Row label="Apellidos" value={`${informacion_personal?.primer_apellido} ${informacion_personal?.segundo_apellido}`} />
                                <Row label="Fecha de nacimiento" value={informacion_personal?.fecha_nacimiento} />
                                <Row label="Nivel de estudios" value={informacion_personal?.nivel_estudios} />
                            </div>
                            <div className="bg-base-200 p-4 rounded-xl ring-1 ring-slate-200">
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
                    </div>
                </section>




                {(useAuthStore.getState().user?.rol === "Asesor" ||
                    useAuthStore.getState().user?.rol === "Lider_credito_cartera" ||
                    useAuthStore.getState().user?.rol === "Aux_cartera") && estado === 'Aprobado' && (

                        <>
                            {/* CERRAR CREDITO */}

                            <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
                                <CerrarCreditoFormulario initialValues={{
                                    color: credito?.color ?? "",
                                    capacidad: credito?.capacidad ?? "",
                                    numero_motor: credito?.numero_motor ?? "",
                                    numero_chasis: credito?.numero_chasis ?? "",
                                    placa: credito?.placa ?? "",
                                }} codigo_credito={codigo_credito} id_cotizacion={id_cotizacion} yaCerrado={Number(credito?.credito_cerrado) === 1} />
                            </section>

                        </>
                    )}
            </div>
        </main>
    );
};

export default CreditoDetalleAsesor;
