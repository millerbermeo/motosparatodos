// src/features/solicitudes/DescuentosContraentregaPanel.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    useDescuentosContraentrega,
    useActualizarDescuentosContraentrega,
} from "../../services/solicitudServices";

type Props = {
    /** id de la fila en solicitudes_facturacion (PRIMARY KEY) */
    idSolicitud: number | string;
};

type Num = number | null | undefined;

const fmtCOP = (v?: Num) =>
    typeof v === "number" && Number.isFinite(v)
        ? new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(v)
        : "—";

/** Convierte "500.000 COP" o "500000" -> 500000 */
const parseMoney = (raw: string): number | null => {
    if (!raw) return null;
    const cleaned = raw.replace(/[^\d.-]/g, "");
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
};

const DescuentosContraentregaPanel: React.FC<Props> = ({ idSolicitud }) => {
    // GET
    const {
        data,
        isLoading,
        isError,
        error,
        refetch: refetchDescuentos,
    } = useDescuentosContraentrega(idSolicitud);

    // POST
    const {
        mutate: actualizarDescuentos,
        isPending: isGuardando,
    } = useActualizarDescuentosContraentrega();

    // Estados locales (en string para que el usuario pueda escribir con puntos, etc.)
    const [descuentoStr, setDescuentoStr] = useState("");
    const [saldoStr, setSaldoStr] = useState("");
    const [observacion2, setObservacion2] = useState("");
    const [touched, setTouched] = useState(false);

    const isFinal = !!data?.isFinal;

    // Cuando llegan datos del back, prellenamos
    useEffect(() => {
        if (!data) return;

        // Prefiere B; si no hay, usa A como sugerencia
        const dB = data.descuentoAutorizadoB ?? data.descuentoSolicitadoA ?? null;
        const sB = data.saldoContraentregaB ?? data.saldoContraentregaA ?? null;

        setDescuentoStr(dB != null ? String(dB) : "");
        setSaldoStr(sB != null ? String(sB) : "");
        setObservacion2(data.observacion2 ?? "");
    }, [data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);

        if (!data) {
            Swal.fire(
                "Sin información",
                "No se pudieron cargar los datos de la solicitud.",
                "warning"
            );
            return;
        }

        if (isFinal) {
            Swal.fire(
                "No editable",
                "Esta solicitud ya fue marcada como final y no se puede modificar.",
                "info"
            );
            return;
        }

        const descuento = parseMoney(descuentoStr);
        const saldo = parseMoney(saldoStr);
        const obs = observacion2.trim();

        if (descuento === null || saldo === null || !obs) {
            Swal.fire(
                "Campos requeridos",
                "Debes ingresar el descuento a autorizar, el saldo contraentrega y la observación.",
                "warning"
            );
            return;
        }

        actualizarDescuentos(
            {
                id: idSolicitud,
                descuento_autorizado_b: descuento,
                saldo_contraentrega_b: saldo,
                observacion2: obs,
                is_final: 1, // si aquí quieres dejarlo en 0, cambia este valor
            },
            {
                onSuccess: () => {
                    refetchDescuentos();
                    window.location.reload();
                },

            }
        );
    };

    const hasErrorDescuento =
        touched && (descuentoStr.trim() === "" || parseMoney(descuentoStr) === null);
    const hasErrorSaldo =
        touched && (saldoStr.trim() === "" || parseMoney(saldoStr) === null);
    const hasErrorObs = touched && observacion2.trim() === "";

    return (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-sky-700 text-white font-semibold px-5 py-2.5 text-sm">
                Autorización de descuento y saldo contraentrega
            </div>

            <div className="p-5 space-y-4 text-sm text-slate-800">
                {isLoading && (
                    <div className="text-slate-500 text-sm">Cargando información…</div>
                )}

                {isError && (
                    <div className="text-rose-700 text-sm">
                        Error al cargar descuentos: {String((error as any)?.message ?? "")}
                    </div>
                )}

                {!isLoading && !isError && data && (
                    <>
                        {/* Avisos azules con los valores solicitados (A) */}
                        <div className="space-y-2">
                            <div className="rounded-md bg-sky-50 border border-sky-100 px-4 py-2 text-xs sm:text-sm text-sky-800">
                                La solicitud de facturación tiene una solicitud de descuento de{" "}
                                <span className="font-semibold">
                                    {fmtCOP(data.descuentoSolicitadoA)}
                                </span>
                            </div>
                            <div className="rounded-md bg-sky-50 border border-sky-100 px-4 py-2 text-xs sm:text-sm text-sky-800">
                                La solicitud de facturación tiene una solicitud de saldo
                                contraentrega de{" "}
                                <span className="font-semibold">
                                    {fmtCOP(data.saldoContraentregaA)}
                                </span>
                            </div>
                        </div>

                        {/* Formulario de autorización (B) */}
                        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Descuento a autorizar */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                                        Descuento a autorizar
                                    </label>
                                    <input
                                        type="text"
                                        value={descuentoStr}
                                        disabled={isGuardando || isFinal}
                                        onChange={(e) => setDescuentoStr(e.target.value)}
                                        onBlur={() => setTouched(true)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none
                      ${hasErrorDescuento
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                                                : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
                                            }`}
                                        placeholder="Ej: 500000"
                                    />
                                    {hasErrorDescuento && (
                                        <p className="mt-1 text-xs text-rose-600">
                                            Ingresa un valor numérico válido.
                                        </p>
                                    )}
                                </div>

                                {/* Saldo contraentrega a autorizar */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                                        Saldo contraentrega a autorizar
                                    </label>
                                    <input
                                        type="text"
                                        value={saldoStr}
                                        disabled={isGuardando || isFinal}
                                        onChange={(e) => setSaldoStr(e.target.value)}
                                        onBlur={() => setTouched(true)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none
                      ${hasErrorSaldo
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                                                : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
                                            }`}
                                        placeholder="Ej: 10000000"
                                    />
                                    {hasErrorSaldo && (
                                        <p className="mt-1 text-xs text-rose-600">
                                            Ingresa un valor numérico válido.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">
                                    Observaciones <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={observacion2}
                                    disabled={isGuardando || isFinal}
                                    onChange={(e) => setObservacion2(e.target.value)}
                                    onBlur={() => setTouched(true)}
                                    rows={3}
                                    className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none resize-y
                    ${hasErrorObs
                                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                                            : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
                                        }`}
                                    placeholder="Describe brevemente la justificación del descuento / saldo…"
                                />
                                {hasErrorObs && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        La observación es obligatoria.
                                    </p>
                                )}
                            </div>

                            {isFinal && (
                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                                    Esta solicitud ya fue marcada como <b>final</b>, por lo que no
                                    se pueden modificar los valores.
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isGuardando || isFinal}
                                    className={`btn btn-sm px-5 ${isFinal
                                            ? "bg-slate-200 text-slate-500 border-slate-200 cursor-not-allowed"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                                        }`}
                                >
                                    {isGuardando
                                        ? "Guardando..."
                                        : isFinal
                                            ? "Guardado como final"
                                            : "Guardar autorización"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </section>
    );
};

export default DescuentosContraentregaPanel;
