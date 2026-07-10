// src/features/solicitudes/DescuentosContraentregaPanel.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    useDescuentosContraentrega,
    useActualizarDescuentosContraentrega,
} from "../../services/solicitudServices";
import { alert } from "../../utils/alerts";
import { fmtCOP, formatThousands, unformatNumber } from "../../utils/money";

type Props = {
    /** id de la fila en solicitudes_facturacion (PRIMARY KEY) */
    idSolicitud: number | string;
};

/** Convierte "500.000" o "500000" -> 500000 */
const parseMoney = (raw: string): number | null => {
    const digits = unformatNumber(raw, { allowDecimals: false });
    if (digits === "") return null;
    const n = Number(digits);
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

        setDescuentoStr(dB != null ? formatThousands(String(dB), { allowDecimals: false }) : "");
        setSaldoStr(sB != null ? formatThousands(String(sB), { allowDecimals: false }) : "");
        setObservacion2(data.observacion2 ?? "");
    }, [data]);

    const handleSubmit = async (e: React.FormEvent) => {
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

        const ok = await alert.confirm({
            title: "¿Guardar autorización?",
            html: `Se guardará el descuento y saldo contraentrega autorizados. ¿Deseas continuar?`,
            confirmText: "Sí, guardar",
        });
        if (!ok) return;

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
                    // Recarga después de que el alert de éxito del hook (timer 1600ms) se vea.
                    setTimeout(() => window.location.reload(), 1700);
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
        <section className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
            <div className="bg-sky-700 text-white font-semibold px-5 py-2.5 text-sm">
                Autorización de descuento y saldo contraentrega
            </div>

            <div className="p-5 space-y-4 text-sm text-base-content">
                {isLoading && (
                    <div className="text-base-content/60 text-sm">Cargando información…</div>
                )}

                {isError && (
                    <div className="text-error text-sm">
                        Error al cargar descuentos: {String((error as any)?.message ?? "")}
                    </div>
                )}

                {!isLoading && !isError && data && (
                    <>
                        {/* Avisos azules con los valores solicitados (A) */}
                        <div className="space-y-2">
                            <div className="rounded-md bg-info/10 border border-info/30 px-4 py-2 text-xs sm:text-sm text-info">
                                La solicitud de facturación tiene una solicitud de descuento de{" "}
                                <span className="font-semibold">
                                    {fmtCOP(data.descuentoSolicitadoA)}
                                </span>
                            </div>
                            <div className="rounded-md bg-info/10 border border-info/30 px-4 py-2 text-xs sm:text-sm text-info">
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
                                    <label className="block text-sm font-semibold text-base-content mb-1">
                                        Descuento a autorizar
                                    </label>
                                    <input
                                        type="text"
                                        value={descuentoStr}
                                        disabled={isGuardando || isFinal}
                                        onChange={(e) =>
                                            setDescuentoStr(
                                                formatThousands(
                                                    unformatNumber(e.target.value, { allowDecimals: false }),
                                                    { allowDecimals: false }
                                                )
                                            )
                                        }
                                        onBlur={() => setTouched(true)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none
                      ${hasErrorDescuento
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-error/30"
                                                : "border-base-300 focus:border-sky-500 focus:ring-info/30"
                                            }`}
                                        placeholder="Ej: 500000"
                                    />
                                    {hasErrorDescuento && (
                                        <p className="mt-1 text-xs text-error">
                                            Ingresa un valor numérico válido.
                                        </p>
                                    )}
                                </div>

                                {/* Saldo contraentrega a autorizar */}
                                <div>
                                    <label className="block text-sm font-semibold text-base-content mb-1">
                                        Saldo contraentrega a autorizar
                                    </label>
                                    <input
                                        type="text"
                                        value={saldoStr}
                                        disabled={isGuardando || isFinal}
                                        onChange={(e) =>
                                            setSaldoStr(
                                                formatThousands(
                                                    unformatNumber(e.target.value, { allowDecimals: false }),
                                                    { allowDecimals: false }
                                                )
                                            )
                                        }
                                        onBlur={() => setTouched(true)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none
                      ${hasErrorSaldo
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-error/30"
                                                : "border-base-300 focus:border-sky-500 focus:ring-info/30"
                                            }`}
                                        placeholder="Ej: 10000000"
                                    />
                                    {hasErrorSaldo && (
                                        <p className="mt-1 text-xs text-error">
                                            Ingresa un valor numérico válido.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-1">
                                    Observaciones <span className="text-error">*</span>
                                </label>
                                <textarea
                                    value={observacion2}
                                    disabled={isGuardando || isFinal}
                                    onChange={(e) => setObservacion2(e.target.value)}
                                    onBlur={() => setTouched(true)}
                                    rows={3}
                                    className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none resize-y
                    ${hasErrorObs
                                            ? "border-rose-400 focus:border-rose-500 focus:ring-error/30"
                                            : "border-base-300 focus:border-sky-500 focus:ring-info/30"
                                        }`}
                                    placeholder="Describe brevemente la justificación del descuento / saldo…"
                                />
                                {hasErrorObs && (
                                    <p className="mt-1 text-xs text-error">
                                        La observación es obligatoria.
                                    </p>
                                )}
                            </div>

                            {isFinal && (
                                <div className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-md px-3 py-2">
                                    Esta solicitud ya fue marcada como <b>final</b>, por lo que no
                                    se pueden modificar los valores.
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isGuardando || isFinal}
                                    className={`btn btn-sm px-5 ${isFinal
                                            ? "bg-base-300 text-base-content/60 border-base-300 cursor-not-allowed"
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
