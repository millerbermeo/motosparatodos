// src/pages/SolicitarFacturacionPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useGetFacturacionPorCodigo } from "../services/procesoContadoServices"; // <- mismo servicio
import { useRegistrarSolicitudFacturacion2 } from "../services/solicitudServices";
import { useAuthStore } from "../store/auth.store";
import { useDistribuidoras } from "../services/distribuidoraServices"; // 👈 NUEVO: hook catálogo

type FormValues = {
    documentos: "Si" | "No";
    distribuidora?: string;       // guardaremos el "slug" como value del select
    reciboPago?: string;
    descuentoAut?: string;        // opcional
    saldoContraentrega?: string;  // opcional
    cedulaFile?: FileList;
    manifiestoFile?: FileList;
    observaciones: string;
};

const fmtCOP = (v?: string | number | null) => {
    const n = v == null || v === "" ? 0 : Number(v);
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(Number.isNaN(n) ? 0 : n);
};
const safe = (v?: string | null) => (v ? String(v) : "—");

const fmtOptCOP = (v?: string | number | null) => {
    if (v === null || v === undefined || v === "") return "—";
    return fmtCOP(v);
};

// helper para value (slug) del select
const slugify = (s: string) =>
    s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const Box = ({
    title,
    right,
    children,
}: {
    title: string;
    right?: React.ReactNode;
    children?: React.ReactNode;
}) => (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
        <header className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm md:text-base tracking-tight">
                {title}
            </h3>
            {right ? (
                <div className="text-xs md:text-sm opacity-90 font-medium">
                    {right}
                </div>
            ) : null}
        </header>
        <div className="p-3 md:p-4">{children}</div>
    </section>
);

const HeadRow = ({ cols }: { cols: React.ReactNode[] }) => (
    <div className="grid grid-cols-12 bg-sky-600 text-white text-xs md:text-sm font-semibold">
        {cols.map((c, i) => (
            <div
                key={i}
                className={`px-3 py-2 border-r border-sky-500 last:border-r-0
                ${
                    ["col-span-4", "col-span-2", "col-span-2", "col-span-2", "col-span-2"].at(i) ||
                    "col-span-2"
                }`}
            >
                {c}
            </div>
        ))}
    </div>
);

const Row = ({ cols }: { cols: React.ReactNode[] }) => (
    <div className="grid grid-cols-12 border-b last:border-b-0 border-slate-200 bg-white">
        {cols.map((c, i) => (
            <div
                key={i}
                className={`px-3 py-2 text-xs md:text-sm
                    ${
                        i === 0
                            ? "col-span-6 md:col-span-6 font-medium text-slate-600"
                            : "col-span-6 md:col-span-6 text-right text-slate-800"
                    }
                    border-r border-slate-100 last:border-r-0`}
            >
                {c}
            </div>
        ))}
    </div>
);

const SolicitarFacturacionPage: React.FC = () => {
    const { codigo } = useParams<{ codigo: string }>();
    const navigate = useNavigate();

    // Datos origen
    const { data, isLoading, error } = useGetFacturacionPorCodigo(codigo);

    // Catálogo de distribuidoras desde backend
    const { data: distsResp, isLoading: loadingDists } = useDistribuidoras({
        page: 1,
        limit: 200,
    });

    // Construimos opciones del select manteniendo tu shape { value, label }
    const DIST_OPTS = React.useMemo(
        () => [
            { value: "", label: "Seleccione…" },
            ...((distsResp?.data ?? []).map((d) => ({
                value: slugify(d.nombre),
                label: d.nombre,
            })) as Array<{ value: string; label: string }>),
        ],
        [distsResp]
    );

    // Mapa slug -> { id, nombre } para enviar ID real y nombre en el payload
    const distSlugMap = React.useMemo(() => {
        const m = new Map<string, { id: number; nombre: string }>();
        (distsResp?.data ?? []).forEach((d) => m.set(slugify(d.nombre), { id: d.id, nombre: d.nombre }));
        return m;
    }, [distsResp]);

    // Hook submit
    const { mutate: registrarSolicitud, isPending } =
        useRegistrarSolicitudFacturacion2({
            endpoint: "/crear_solicitud_facturacion.php",
        });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: {
            documentos: "Si",
            distribuidora: "",
            reciboPago: "",
            descuentoAut: "0",
            saldoContraentrega: "0",
            observaciones: "",
        },
    });

    const docValue = watch("documentos");
    const distSlugSelected = watch("distribuidora"); // ← slug seleccionado

    const user = useAuthStore((state) => state.user);

    const onSubmit = async (values: FormValues) => {
        if (!data) return;

        // Resolver nombre e ID reales desde el slug seleccionado
        const dist = values.distribuidora ? distSlugMap.get(values.distribuidora) : undefined;
        const distNombre = dist?.nombre ?? "";
        const distId = dist?.id ?? "";

        const fd = new FormData();

        // ===== Backend payload (manteniendo tu estructura) =====
        fd.append("id_cotizacion", String(data.cotizacion_id ?? ""));
        fd.append("agencia", "Motos");
        fd.append("distribuidora", distNombre); // 👈 nombre desde catálogo
        fd.append("distribuidora_id", String(distId)); // 👈 id real
        fd.append("codigo_solicitud", codigo || "");
        fd.append("codigo_credito", "");
        fd.append("nombre_cliente", data.nombre_cliente || "");
        fd.append("tipo_solicitud", "Contado");
        fd.append("numero_recibo", values.reciboPago || "");
        fd.append("resibo_pago", values.reciboPago || "");
        fd.append("facturador", "Sin facturador");
        fd.append("autorizado", values.documentos === "Si" ? "Si" : "No");
        fd.append("facturado", "No");
        fd.append("entrega_autorizada", "No");
        fd.append("observaciones", values.observaciones || "");
        fd.append("is_act", "2");

        if (values.cedulaFile?.[0]) fd.append("cedula", values.cedulaFile[0]);
        if (values.manifiestoFile?.[0]) fd.append("manifiesto", values.manifiestoFile[0]);

        // Extras (no rompen si backend los ignora)
        fd.append("codigo_origen_facturacion", codigo || "");
        fd.append("numero_documento", data.numero_documento || "");
        fd.append("telefono", data.telefono || "");
        fd.append("email", data.email || "");
        fd.append("motocicleta", data.motocicleta || "");
        fd.append("modelo", data.modelo || "");
        fd.append("numero_motor", data.numero_motor || "");
        fd.append("numero_chasis", data.numero_chasis || "");
        fd.append("color", data.color || "");
        fd.append("placa", data.placa || "");
        fd.append("cn_valor_moto", String(data.cn_valor_moto ?? ""));
        fd.append("cn_valor_bruto", String(data.cn_valor_bruto ?? ""));
        fd.append("cn_iva", String(data.cn_iva ?? ""));
        fd.append("cn_total", String(data.cn_total ?? ""));
        fd.append("acc_valor_bruto", String(data.acc_valor_bruto ?? ""));
        fd.append("acc_iva", String(data.acc_iva ?? ""));
        fd.append("acc_total", String(data.acc_total ?? ""));
        fd.append("tot_valor_moto", String(data.tot_valor_moto ?? ""));
        fd.append("tot_soat", String(data.tot_soat ?? ""));
        fd.append("tot_matricula", String(data.tot_matricula ?? ""));
        fd.append("tot_impuestos", String(data.tot_impuestos ?? ""));
        fd.append("tot_seguros_accesorios", String(data.tot_seguros_accesorios ?? ""));
        fd.append("tot_general", String(data.tot_general ?? ""));

        registrarSolicitud(fd, {
            onSuccess: (resp) => {
                const texto = Array.isArray(resp?.message)
                    ? resp.message.join("\n")
                    : resp?.message ?? "Solicitud de facturación registrada correctamente";
                Swal.fire({
                    icon: "success",
                    title: "Solicitud registrada",
                    text: texto,
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    if (user?.rol === "Administrador") {
                        navigate("/solicitudes");
                    } else {
                        navigate("/cotizaciones");
                    }
                });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.error ||
                    err?.response?.data?.details ||
                    "No se pudo registrar la solicitud.";
                Swal.fire({ icon: "error", title: "Error", text: msg });
            },
        });
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-md p-6 text-center space-y-3">
                    <div className="loader mx-auto mb-2" />
                    <h2 className="font-semibold text-slate-800 text-lg">
                        Cargando solicitud…
                    </h2>
                    <p className="text-sm text-slate-500">
                        Estamos obteniendo la información de la cotización.
                    </p>
                </div>
            </main>
        );
    }
    if (error || !data) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full rounded-2xl bg-white border border-rose-200 shadow-md p-6">
                    <h2 className="font-semibold text-rose-700 text-lg mb-2">
                        No se encontró la solicitud
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">
                        {error?.message || "Verifica el código e intenta nuevamente."}
                    </p>
                    <button
                        className="btn btn-outline w-full"
                        onClick={() => navigate(-1)}
                    >
                        ← Volver
                    </button>
                </div>
            </main>
        );
    }

    const encabezadoCliente = (
        <>
            <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                    Solicitud de facturación contado
                </span>
            </div>
            <div className="text-lg md:text-xl font-semibold mb-1 text-slate-900">
                {safe(data.nombre_cliente)}
            </div>
            <div className="text-sm leading-6 text-slate-600 space-y-0.5">
                <div>
                    C.C.{" "}
                    <span className="font-medium">
                        {safe(data.numero_documento)}
                    </span>
                </div>
                {data.email ? <div>{data.email}</div> : null}
                <div>
                    <span className="font-semibold">Teléfono:</span>{" "}
                    {safe(data.telefono)}
                </div>
            </div>
        </>
    );

    return (
        <main className="min-h-screen bg-gradient-to-b w-full from-slate-50 to-slate-100 py-6 md:py-8">
            <div className="w-full space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8">
                {/* Header */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-md p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
                        <div className="flex-1">
                            {encabezadoCliente}
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Resumen de cotización
                            </div>
                            <div className="text-lg font-semibold text-slate-900">
                                Cotización #{data.cotizacion_id ?? "—"}
                            </div>
                            <div className="inline-flex items-center gap-2 text-xs mt-1">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                    Código:{" "}
                                    <span className="font-medium">
                                        {data.codigo}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabla Moto */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-semibold text-slate-800">
                            Detalle de la motocicleta
                        </h3>
                        <span className="text-xs text-slate-500">
                            Verifique que los datos coincidan con la cotización
                        </span>
                    </div>
                    <div className="border-t border-slate-100">
                        <HeadRow
                            cols={[
                                "Motocicleta",
                                "Modelo",
                                "# Motor",
                                "# Chasis",
                                "Color",
                            ]}
                        />
                        <div className="grid grid-cols-12 text-xs md:text-sm">
                            <div className="col-span-12 md:col-span-4 px-3 py-2 border-r border-slate-100">
                                {safe(data.motocicleta)}
                            </div>
                            <div className="col-span-6 md:col-span-2 px-3 py-2 border-r border-slate-100">
                                {safe(data.modelo)}
                            </div>
                            <div className="col-span-6 md:col-span-2 px-3 py-2 border-r border-slate-100">
                                {safe(data.numero_motor)}
                            </div>
                            <div className="col-span-6 md:col-span-2 px-3 py-2 border-r border-slate-100">
                                {safe(data.numero_chasis)}
                            </div>
                            <div className="col-span-6 md:col-span-2 px-3 py-2">
                                {safe(data.color)}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Condiciones del negocio */}
                <Box
                    title="Condiciones del negocio"
                    right={<span className="font-semibold text-sm">Costos</span>}
                >
                    <div className="grid grid-cols-1 md:grid-cols-12">
                        <div className="md:col-span-8 flex items-center justify-center">
                            <p className="text-xs md:text-sm text-slate-500 text-center px-4 py-6">
                                Esta sección resume los valores de la negociación
                                base del vehículo. Revise que el valor bruto, IVA y
                                total coincidan con el acuerdo con el cliente.
                            </p>
                        </div>
                        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-200 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl overflow-hidden">
                            <Row
                                cols={[
                                    "Valor Moto:",
                                    <span className="font-semibold">
                                        {fmtCOP(data.cn_valor_moto)}
                                    </span>,
                                ]}
                            />
                            <Row
                                cols={[
                                    "Valor bruto:",
                                    <span className="font-semibold">
                                        {fmtCOP(data.cn_valor_bruto)}
                                    </span>,
                                ]}
                            />
                            <Row
                                cols={[
                                    "IVA:",
                                    <span className="font-semibold">
                                        {fmtCOP(data.cn_iva)}
                                    </span>,
                                ]}
                            />
                            <Row
                                cols={[
                                    "Total:",
                                    <span className="font-semibold text-emerald-600">
                                        {fmtCOP(data.cn_total)}
                                    </span>,
                                ]}
                            />
                        </div>
                    </div>
                </Box>

                {/* Accesorios y Totales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Box title="Accesorios">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Valor accesorios (bruto)</span>
                                <span className="font-semibold text-slate-800">
                                    {fmtCOP(data.acc_valor_bruto)} COP
                                </span>
                            </div>
                            <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden">
                                <Row
                                    cols={[
                                        "Valor bruto:",
                                        <span className="font-semibold">
                                            {fmtCOP(data.acc_valor_bruto)}
                                        </span>,
                                    ]}
                                />
                                <Row
                                    cols={[
                                        "IVA:",
                                        <span className="font-semibold">
                                            {fmtCOP(data.acc_iva)}
                                        </span>,
                                    ]}
                                />
                                <Row
                                    cols={[
                                        "Total:",
                                        <span className="font-semibold text-emerald-600">
                                            {fmtCOP(data.acc_total)}
                                        </span>,
                                    ]}
                                />
                            </div>
                        </div>
                    </Box>

                    <Box title="Total de la operación">
                        <div className="space-y-2">
                            <div className="rounded-lg border border-slate-200 overflow-hidden">
                                <Row
                                    cols={[
                                        "Valor Moto:",
                                        <span className="font-semibold">
                                            {fmtCOP(data.tot_valor_moto)}
                                        </span>,
                                    ]}
                                />
                                <Row
                                    cols={[
                                        "SOAT:",
                                        <span className="font-semibold">
                                            {fmtOptCOP(data.tot_soat)}
                                        </span>,
                                    ]}
                                />
                                <Row
                                    cols={[
                                        "Matrícula:",
                                        <span className="font-semibold">
                                            {fmtOptCOP(data.tot_matricula)}
                                        </span>,
                                    ]}
                                />
                                <Row
                                    cols={[
                                        "Impuestos:",
                                        <span className="font-semibold">
                                            {fmtOptCOP(data.tot_impuestos)}
                                        </span>,
                                    ]}
                                />
                                <Row
                                    cols={[
                                        "Seguros y accesorios:",
                                        <span className="font-semibold">
                                            {fmtCOP(data.tot_seguros_accesorios)}
                                        </span>,
                                    ]}
                                />
                                <Row
                                    cols={[
                                        "TOTAL:",
                                        <span className="font-bold text-emerald-600 text-base">
                                            {fmtCOP(data.tot_general)}
                                        </span>,
                                    ]}
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Este total corresponde al valor general a
                                facturar. Asegúrese de que las cifras coincidan
                                con el negocio acordado con el cliente.
                            </p>
                        </div>
                    </Box>
                </div>

                {/* Formulario (alineado y responsive) */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-md p-4 md:p-6 lg:p-7">
                    <div className="mb-6 text-center space-y-1">
                        <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                            Solicitud de facturación
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
                            Diligencia los siguientes campos para generar la
                            solicitud de facturación de esta cotización. Los
                            campos marcados con{" "}
                            <span className="text-error">*</span> son
                            obligatorios.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Dos columnas en md+ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Columna izquierda */}
                            <div className="space-y-4">
                                {/* Documentos */}
                                <div className="form-control flex flex-col">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Documentos{" "}
                                            <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <select
                                        className={`select select-bordered bg-slate-50 ${
                                            errors.documentos
                                                ? "select-error"
                                                : ""
                                        }`}
                                        {...register("documentos", {
                                            required: "Requerido",
                                        })}
                                    >
                                        <option value="Si">Si</option>
                                        <option value="No">No</option>
                                    </select>
                                    {errors.documentos && (
                                        <p className="text-xs text-error mt-1">
                                            {errors.documentos.message}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Indica si se entregan todos los
                                        documentos requeridos para la
                                        facturación.
                                    </p>
                                </div>

                                {/* Recibo de pago */}
                                <div className="form-control flex flex-col">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Recibo de pago Nº{" "}
                                            <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <input
                                        className={`input input-bordered bg-slate-50 ${
                                            errors.reciboPago
                                                ? "input-error"
                                                : ""
                                        }`}
                                        placeholder="Digite el número de recibo de pago"
                                        {...register("reciboPago", {
                                            required: "Requerido",
                                            minLength: {
                                                value: 3,
                                                message:
                                                    "Mínimo 3 caracteres",
                                            },
                                            maxLength: {
                                                value: 40,
                                                message:
                                                    "Máximo 40 caracteres",
                                            },
                                        })}
                                    />
                                    {errors.reciboPago && (
                                        <p className="text-xs text-error mt-1">
                                            {errors.reciboPago.message}
                                        </p>
                                    )}
                                </div>

                                {/* Saldo contraentrega */}
                                <div className="form-control flex flex-col">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Saldo contraentrega
                                        </span>
                                    </label>
                                    <input
                                        className="input input-bordered bg-slate-50"
                                        placeholder="0"
                                        {...register("saldoContraentrega", {
                                            validate: (v) =>
                                                !v ||
                                                /^\d+$/.test(v.trim()) ||
                                                "Solo números enteros",
                                        })}
                                    />
                                    {errors.saldoContraentrega && (
                                        <p className="text-xs text-error mt-1">
                                            {
                                                errors.saldoContraentrega
                                                    .message as string
                                            }
                                        </p>
                                    )}
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Si aplica, indica el valor pendiente que
                                        el cliente cancelará al momento de la
                                        entrega.
                                    </p>
                                </div>

                                {/* Manifiesto (requerido si Documentos = Si) */}
                                <div className="form-control flex flex-col">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Manifiesto{" "}
                                            {docValue === "Si" && (
                                                <span className="text-error">
                                                    *
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        className={`file-input file-input-bordered bg-slate-50 ${
                                            errors.manifiestoFile
                                                ? "file-input-error"
                                                : ""
                                        }`}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        {...register("manifiestoFile", {
                                            validate: (files) =>
                                                docValue === "No" ||
                                                (files &&
                                                    files.length > 0) ||
                                                "Requerido",
                                        })}
                                    />
                                    {errors.manifiestoFile && (
                                        <p className="text-xs text-error mt-1">
                                            {
                                                errors.manifiestoFile
                                                    .message as string
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Observaciones */}
                                <div className="form-control flex flex-col">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Observaciones{" "}
                                            <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <textarea
                                        className={`textarea textarea-bordered bg-slate-50 min-h-28 ${
                                            errors.observaciones
                                                ? "textarea-error"
                                                : ""
                                        }`}
                                        placeholder="Incluye observaciones relevantes para el área de facturación"
                                        {...register("observaciones", {
                                            required: "Requerido",
                                            minLength: {
                                                value: 5,
                                                message:
                                                    "Mínimo 5 caracteres",
                                            },
                                        })}
                                    />
                                    {errors.observaciones && (
                                        <p className="text-xs text-error mt-1">
                                            {errors.observaciones.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="space-y-4">
                                {/* Distribuidora (dinámico con hook) */}
                                <div className="form-control flex flex-col">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Distribuidora
                                        </span>
                                    </label>
                                    <select
                                        className="select select-bordered bg-slate-50"
                                        disabled={loadingDists}
                                        {...register("distribuidora")}
                                        value={distSlugSelected ?? ""}
                                        onChange={(e) => {
                                            // mantener integración con react-hook-form
                                            const event = {
                                                target: {
                                                    name: "distribuidora",
                                                    value: e.target.value,
                                                },
                                            } as any;
                                            // @ts-ignore
                                            register("distribuidora").onChange(
                                                event
                                            );
                                        }}
                                    >
                                        {DIST_OPTS.map((opt) => (
                                            <option
                                                key={opt.value || "default"}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingDists && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Cargando distribuidoras…
                                        </p>
                                    )}
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Selecciona la distribuidora asociada a
                                        esta venta, si aplica.
                                    </p>
                                </div>

                                {/* Descuento a autorizar */}
                                <div className="form-control flex flex-col">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Descuento a autorizar
                                        </span>
                                    </label>
                                    <input
                                        className={`input input-bordered bg-slate-50 ${
                                            errors.descuentoAut
                                                ? "input-error"
                                                : ""
                                        }`}
                                        placeholder="0"
                                        {...register("descuentoAut", {
                                            validate: (v) =>
                                                !v ||
                                                /^\d+$/.test(v.trim()) ||
                                                "Solo números enteros",
                                        })}
                                    />
                                    {errors.descuentoAut && (
                                        <p className="text-xs text-error mt-1">
                                            {
                                                errors.descuentoAut
                                                    .message as string
                                            }
                                        </p>
                                    )}
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Si existe un descuento especial,
                                        especifícalo aquí para registro de
                                        facturación.
                                    </p>
                                </div>

                                {/* Copia de la cédula (requerido si Documentos = Si) */}
                                <div className="form-control flex flex-col ">
                                    <label className="label">
                                        <span className="label-text font-medium text-slate-700">
                                            Copia de la cédula{" "}
                                            {docValue === "Si" && (
                                                <span className="text-error">
                                                    *
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        className={`file-input file-input-bordered bg-slate-50 ${
                                            errors.cedulaFile
                                                ? "file-input-error"
                                                : ""
                                        }`}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        {...register("cedulaFile", {
                                            validate: (files) =>
                                                docValue === "No" ||
                                                (files &&
                                                    files.length > 0) ||
                                                "Requerido",
                                        })}
                                    />
                                    {errors.cedulaFile && (
                                        <p className="text-xs text-error mt-1">
                                            {errors.cedulaFile.message as string}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100 mt-2 pt-4">
                            <button
                                type="button"
                                className="btn btn-ghost md:btn-outline order-2 md:order-1"
                                onClick={() => navigate(-1)}
                            >
                                ← Volver
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success bg-emerald-600 hover:bg-emerald-700 border-none text-white px-6 order-1 md:order-2"
                                disabled={isSubmitting || isPending || loadingDists}
                            >
                                {isSubmitting || isPending
                                    ? "Procesando…"
                                    : "✓ Enviar solicitud de facturación"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default SolicitarFacturacionPage;
