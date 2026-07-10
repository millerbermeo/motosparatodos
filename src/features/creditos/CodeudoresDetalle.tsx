import React from 'react';
import { Users, Car, Briefcase, UserCheck, User2 } from 'lucide-react';
import { fmtCOP } from '../../utils/money';

const isNonEmpty = (v?: string | number | null) =>
    v !== undefined && v !== null && String(v).trim().length > 0;

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-3 py-1.5">
        <span className="text-xs sm:text-sm text-base-content/70">{label}</span>
        <span className="text-xs sm:text-sm font-medium text-right text-base-content wrap-break-words">{value}</span>
    </div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-base-content">
        {icon} {children}
    </h3>
);

interface Props {
    codeudores: any[];
}

const META_KEYS = ['id', 'codeudor_id', 'created_at', 'updated_at'];

// Campos que se muestran y cuentan como información real
const PERSONAL_FIELDS = [
    'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
    'tipo_documento', 'numero_documento', 'fecha_expedicion', 'lugar_expedicion',
    'fecha_nacimiento', 'nivel_estudios', 'estado_civil',
    'celular', 'telefono_fijo', 'email',
    'ciudad_residencia', 'barrio_residencia', 'direccion_residencia',
    'tipo_vivienda', 'finca_raiz',
];
const LABORAL_FIELDS = [
    'empresa', 'direccion_empleador', 'telefono_empleador', 'cargo',
    'tipo_contrato', 'tiempo_servicio',
];
const NUM_FIELDS = ['personas_a_cargo', 'costo_arriendo', 'salario'];

// ¿El codeudor tiene información real? (ignora defaults numéricos en 0 y campos no mostrados)
const tieneDatos = (co: any): boolean => {
    const p = co?.informacion_personal ?? {};
    const lab = co?.informacion_laboral ?? {};
    const vehiculos: any[] = Array.isArray(co?.vehiculos) ? co.vehiculos : [];
    const refs: any[] = Array.isArray(co?.referencias) ? co.referencias : [];

    const personalConDatos = PERSONAL_FIELDS.some((k) => isNonEmpty(p[k]));
    const laboralConDatos = LABORAL_FIELDS.some((k) => isNonEmpty(lab[k]));
    const numConDatos =
        NUM_FIELDS.some((k) => Number(p[k] ?? lab[k]) > 0);

    return personalConDatos || laboralConDatos || numConDatos || vehiculos.length > 0 || refs.length > 0;
};

const CodeudoresDetalle: React.FC<Props> = ({ codeudores }) => {
    const conDatos = Array.isArray(codeudores) ? codeudores.filter(tieneDatos) : [];
    if (conDatos.length === 0) return null;

    return (
        <section>
            <details className="collapse bg-base-100 border-base-300 border">
                <summary className="collapse-title font-semibold">
                    <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-base-content">
                        <Users className="w-5 h-5 text-primary" /> Codeudores
                        <span className="ml-1 inline-flex items-center justify-center text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                            {conDatos.length}
                        </span>
                    </h2>
                </summary>

                <div className="collapse-content text-sm">
                    <div className="space-y-5 sm:space-y-6">
                        {conDatos.map((co: any, ci: number) => {
                            const p = co?.informacion_personal ?? {};
                            const lab = co?.informacion_laboral ?? {};
                            const vehiculos: any[] = Array.isArray(co?.vehiculos) ? co.vehiculos : [];
                            const refs: any[] = Array.isArray(co?.referencias) ? co.referencias : [];

                            const nombre = [p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido]
                                .filter(isNonEmpty)
                                .join(' ')
                                .trim();

                            const tieneLaboral = Object.entries(lab).some(([k, v]) => {
                                if (META_KEYS.includes(k)) return false;
                                if (k === 'salario') return Number(v) > 0;
                                return isNonEmpty(v as any);
                            });

                            return (
                                <div
                                    key={p.id ?? ci}
                                    className="rounded-2xl ring-1 ring-primary/30 bg-base-100 shadow-sm overflow-hidden"
                                >
                                    {/* Encabezado del codeudor */}
                                    <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-l-to-r from-primary/10 to-info/10 border-b border-primary/30">
                                        <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                                            <UserCheck className="w-5 h-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-base-content truncate">
                                                {nombre || `Codeudor ${ci + 1}`}
                                            </p>
                                            {(isNonEmpty(p.tipo_documento) || isNonEmpty(p.numero_documento)) && (
                                                <p className="text-xs text-base-content/60 truncate">
                                                    {[p.tipo_documento, p.numero_documento].filter(isNonEmpty).join(' · ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-5 space-y-5">
                                        {/* Información personal */}
                                        <div>
                                            <SectionTitle icon={<User2 className="w-4 h-4 text-primary" />}>
                                                Información personal
                                            </SectionTitle>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-x-6">
                                                <div className="bg-base-200 p-3 sm:p-4 rounded-xl ring-1 ring-slate-200">
                                                    {isNonEmpty(p.tipo_documento) && <Row label="Tipo de documento" value={p.tipo_documento} />}
                                                    {isNonEmpty(p.numero_documento) && <Row label="Número de documento" value={p.numero_documento} />}
                                                    {isNonEmpty(p.fecha_expedicion) && <Row label="Fecha de expedición" value={p.fecha_expedicion} />}
                                                    {isNonEmpty(p.lugar_expedicion) && <Row label="Lugar de expedición" value={p.lugar_expedicion} />}
                                                    {isNonEmpty(p.fecha_nacimiento) && <Row label="Fecha de nacimiento" value={p.fecha_nacimiento} />}
                                                    {isNonEmpty(p.nivel_estudios) && <Row label="Nivel de estudios" value={p.nivel_estudios} />}
                                                    {isNonEmpty(p.estado_civil) && <Row label="Estado civil" value={p.estado_civil} />}
                                                    {isNonEmpty(p.personas_a_cargo) && Number(p.personas_a_cargo) > 0 && <Row label="Personas a cargo" value={p.personas_a_cargo} />}
                                                </div>
                                                <div className="bg-base-200 p-3 sm:p-4 rounded-xl ring-1 ring-slate-200">
                                                    {isNonEmpty(p.celular) && <Row label="Celular" value={p.celular} />}
                                                    {isNonEmpty(p.telefono_fijo) && <Row label="Teléfono fijo" value={p.telefono_fijo} />}
                                                    {isNonEmpty(p.email) && <Row label="Email" value={p.email} />}
                                                    {isNonEmpty(p.ciudad_residencia) && <Row label="Ciudad de residencia" value={p.ciudad_residencia} />}
                                                    {isNonEmpty(p.barrio_residencia) && <Row label="Barrio" value={p.barrio_residencia} />}
                                                    {isNonEmpty(p.direccion_residencia) && <Row label="Dirección" value={p.direccion_residencia} />}
                                                    {isNonEmpty(p.tipo_vivienda) && <Row label="Tipo de vivienda" value={p.tipo_vivienda} />}
                                                    {isNonEmpty(p.costo_arriendo) && Number(p.costo_arriendo) > 0 && <Row label="Costo arriendo" value={fmtCOP(Number(p.costo_arriendo))} />}
                                                    {isNonEmpty(p.finca_raiz) && <Row label="Finca raíz" value={p.finca_raiz} />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información laboral */}
                                        {tieneLaboral && (
                                            <div>
                                                <SectionTitle icon={<Briefcase className="w-4 h-4 text-success" />}>
                                                    Información laboral
                                                </SectionTitle>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-x-6">
                                                    <div className="bg-success/10/60 p-3 sm:p-4 rounded-xl ring-1 ring-success/30">
                                                        {isNonEmpty(lab.empresa) && <Row label="Empresa" value={lab.empresa} />}
                                                        {isNonEmpty(lab.direccion_empleador) && <Row label="Dirección empleador" value={lab.direccion_empleador} />}
                                                        {isNonEmpty(lab.telefono_empleador) && <Row label="Teléfono empleador" value={lab.telefono_empleador} />}
                                                        {isNonEmpty(lab.cargo) && <Row label="Cargo" value={lab.cargo} />}
                                                    </div>
                                                    <div className="bg-success/10/60 p-3 sm:p-4 rounded-xl ring-1 ring-success/30">
                                                        {isNonEmpty(lab.tipo_contrato) && <Row label="Tipo de contrato" value={lab.tipo_contrato} />}
                                                        {isNonEmpty(lab.tiempo_servicio) && <Row label="Tiempo de servicio" value={lab.tiempo_servicio} />}
                                                        {isNonEmpty(lab.salario) && Number(lab.salario) > 0 && <Row label="Salario" value={fmtCOP(Number(lab.salario))} />}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Vehículos */}
                                        {vehiculos.length > 0 && (
                                            <div>
                                                <SectionTitle icon={<Car className="w-4 h-4 text-warning" />}>
                                                    Vehículos
                                                </SectionTitle>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                    {vehiculos.map((v: any, vi: number) => (
                                                        <div key={v.id ?? vi} className="bg-warning/10/60 p-3 sm:p-4 rounded-xl ring-1 ring-warning/30">
                                                            {isNonEmpty(v.placa) && <Row label="Placa" value={v.placa} />}
                                                            {isNonEmpty(v.marca) && <Row label="Marca" value={v.marca} />}
                                                            {isNonEmpty(v.modelo) && <Row label="Modelo" value={v.modelo} />}
                                                            {isNonEmpty(v.tipo) && <Row label="Tipo" value={v.tipo} />}
                                                            {isNonEmpty(v.numero_motor) && <Row label="Número de motor" value={v.numero_motor} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Referencias */}
                                        {refs.length > 0 && (
                                            <div>
                                                <SectionTitle icon={<User2 className="w-4 h-4 text-info" />}>
                                                    Referencias
                                                </SectionTitle>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                    {refs.map((r: any, ri: number) => (
                                                        <div key={r.id ?? ri} className="bg-info/10 p-3 sm:p-4 rounded-xl ring-1 ring-info/30">
                                                            {isNonEmpty(r.nombre_completo) && <Row label="Nombres y apellidos" value={r.nombre_completo} />}
                                                            {isNonEmpty(r.direccion) && <Row label="Dirección" value={r.direccion} />}
                                                            {isNonEmpty(r.tipo_referencia) && <Row label="Tipo de referencia" value={r.tipo_referencia} />}
                                                            {isNonEmpty(r.telefono) && <Row label="Número telefónico" value={r.telefono} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </details>
        </section>
    );
};

export default CodeudoresDetalle;
