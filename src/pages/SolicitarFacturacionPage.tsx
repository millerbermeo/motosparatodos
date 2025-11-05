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
    <section className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
        <header className="bg-[#3BB273] text-white px-4 py-2 flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            {right ? <div className="text-sm opacity-90">{right}</div> : null}
        </header>
        <div className="p-0">{children}</div>
    </section>
);

const HeadRow = ({ cols }: { cols: React.ReactNode[] }) => (
    <div className="grid grid-cols-12 bg-[#53B8E4] text-white font-semibold">
        {cols.map((c, i) => (
            <div
                key={i}
                className={`px-3 py-2 ${["col-span-4", "col-span-2", "col-span-2", "col-span-2", "col-span-2"].at(i) ||
                    "col-span-2"
                    }`}
            >
                {c}
            </div>
        ))}
    </div>
);

const Row = ({ cols }: { cols: React.ReactNode[] }) => (
    <div className="grid grid-cols-12 border-b last:border-b-0">
        {cols.map((c, i) => (
            <div
                key={i}
                className={`px-3 py-2 ${i === 0 ? "col-span-6 md:col-span-6" : "col-span-6 md:col-span-6"
                    } border-r last:border-r-0`}
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

                    if (user?.rol === 'Administrador') {
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
            <main className="p-4 md:p-6">
                <div className="alert alert-info">Cargando solicitud…</div>
            </main>
        );
    }
    if (error || !data) {
        return (
            <main className="p-4 md:p-6">
                <div className="alert alert-error">
                    {error?.message || "No se encontró la solicitud."}
                </div>
                <button className="btn btn-ghost mt-3" onClick={() => navigate(-1)}>
                    ← Volver
                </button>
            </main>
        );
    }

    const encabezadoCliente = (
        <>
            <div className="text-lg md:text-xl font-semibold mb-2">
                Información del cliente:
            </div>
            <div className="text-sm leading-6">
                <div>{safe(data.nombre_cliente)}</div>
                <div>C.C. {safe(data.numero_documento)}</div>
                {data.email ? <div>{data.email}</div> : null}
                <div>
                    <span className="font-semibold">Teléfono:</span> {safe(data.telefono)}
                </div>
            </div>
        </>
    );

    return (
        <main className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <section className="rounded-xl border border-gray-300 bg-white shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>{encabezadoCliente}</div>
                    <div className="text-right">
                        <div className="text-lg font-semibold">
                            Cotización #{data.cotizacion_id ?? "—"}
                        </div>
                        <div className="text-sm opacity-70">Código: {data.codigo}</div>
                    </div>
                </div>
            </section>

            {/* Tabla Moto */}
            <section className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
                <HeadRow cols={["Motocicleta", "Modelo", "# Motor", "# Chasis", "Color"]} />
                <div className="grid grid-cols-12">
                    <div className="col-span-4 px-3 py-2 border-r">{safe(data.motocicleta)}</div>
                    <div className="col-span-2 px-3 py-2 border-r">{safe(data.modelo)}</div>
                    <div className="col-span-2 px-3 py-2 border-r">{safe(data.numero_motor)}</div>
                    <div className="col-span-2 px-3 py-2 border-r">{safe(data.numero_chasis)}</div>
                    <div className="col-span-2 px-3 py-2">{safe(data.color)}</div>
                </div>
            </section>

            {/* Condiciones del negocio */}
            <Box title="Condiciones del negocio" right={<span className="font-semibold">Costos</span>}>
                <div className="grid grid-cols-12">
                    <div className="col-span-8">
                        <div className="h-28 md:h-24" />
                    </div>
                    <div className="col-span-4 border-l">
                        <Row cols={["Valor Moto:", <span className="font-semibold">{fmtCOP(data.cn_valor_moto)}</span>]} />
                        <Row cols={["Valor bruto:", <span className="font-semibold">{fmtCOP(data.cn_valor_bruto)}</span>]} />
                        <Row cols={["IVA:", <span className="font-semibold">{fmtCOP(data.cn_iva)}</span>]} />
                        <Row cols={["Total:", <span className="font-semibold">{fmtCOP(data.cn_total)}</span>]} />
                    </div>
                </div>
            </Box>

            {/* Accesorios y Totales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box title="Accesorios">
                    <div className="p-3">
                        <div className="text-right text-sm mb-2">
                            {fmtCOP(data.acc_valor_bruto)} COP
                        </div>
                        <Row cols={["Valor bruto:", <span className="font-semibold">{fmtCOP(data.acc_valor_bruto)}</span>]} />
                        <Row cols={["IVA:", <span className="font-semibold">{fmtCOP(data.acc_iva)}</span>]} />
                        <Row cols={["Total:", <span className="font-semibold">{fmtCOP(data.acc_total)}</span>]} />
                    </div>
                </Box>

                <Box title="TOTAL">
                    <div className="p-3">
                        <Row cols={["Valor Moto:", <span className="font-semibold">{fmtCOP(data.tot_valor_moto)}</span>]} />
                        <Row cols={["SOAT:", <span className="font-semibold">{fmtOptCOP(data.tot_soat)}</span>]} />          {/* ← antes fmtCOP */}
                        <Row cols={["Matrícula:", <span className="font-semibold">{fmtOptCOP(data.tot_matricula)}</span>]} />     {/* ← antes fmtCOP */}
                        <Row cols={["Impuestos:", <span className="font-semibold">{fmtOptCOP(data.tot_impuestos)}</span>]} />     {/* ← antes fmtCOP */}
                        <Row cols={["Seguros y accesorios:", <span className="font-semibold">{fmtCOP(data.tot_seguros_accesorios)}</span>]} />
                        <Row cols={["TOTAL:", <span className="font-bold">{fmtCOP(data.tot_general)}</span>]} />

                    </div>
                </Box>
            </div>

            {/* Formulario (alineado y responsive) */}
            <section className="rounded-xl border border-gray-300 bg-white shadow-sm p-4 md:p-6">
                <h3 className="text-center text-lg md:text-xl font-semibold mb-6">
                    Complete la siguiente información
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Dos columnas en md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna izquierda */}
                        <div className="space-y-4">
                            {/* Documentos */}
                            <div className="form-control flex flex-col">
                                <label className="label">
                                    <span className="label-text">
                                        Documentos <span className="text-error">*</span>
                                    </span>
                                </label>
                                <select
                                    className={`select select-bordered ${errors.documentos ? "select-error" : ""}`}
                                    {...register("documentos", { required: "Requerido" })}
                                >
                                    <option value="Si">Si</option>
                                    <option value="No">No</option>
                                </select>
                                {errors.documentos && (
                                    <p className="text-xs text-error mt-1">{errors.documentos.message}</p>
                                )}
                            </div>

                            {/* Recibo de pago */}
                            <div className="form-control flex flex-col">
                                <label className="label">
                                    <span className="label-text">
                                        Recibo de pago Nº <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    className={`input input-bordered ${errors.reciboPago ? "input-error" : ""}`}
                                    placeholder="Digite el número de recibo de pago"
                                    {...register("reciboPago", {
                                        required: "Requerido",
                                        minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                        maxLength: { value: 40, message: "Máximo 40 caracteres" },
                                    })}
                                />
                                {errors.reciboPago && (
                                    <p className="text-xs text-error mt-1">{errors.reciboPago.message}</p>
                                )}
                            </div>

                            {/* Saldo contraentrega */}
                            <div className="form-control flex flex-col">
                                <label className="label">
                                    <span className="label-text">Saldo contraentrega</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    placeholder="0"
                                    {...register("saldoContraentrega", {
                                        validate: (v) =>
                                            !v || /^\d+$/.test(v.trim()) || "Solo números enteros",
                                    })}
                                />
                                {errors.saldoContraentrega && (
                                    <p className="text-xs text-error mt-1">
                                        {errors.saldoContraentrega.message as string}
                                    </p>
                                )}
                            </div>

                            {/* Manifiesto (requerido si Documentos = Si) */}
                            <div className="form-control flex flex-col">
                                <label className="label">
                                    <span className="label-text">
                                        Manifiesto {docValue === "Si" && <span className="text-error">*</span>}
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    className={`file-input file-input-bordered ${errors.manifiestoFile ? "file-input-error" : ""}`}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    {...register("manifiestoFile", {
                                        validate: (files) =>
                                            docValue === "No" || (files && files.length > 0) || "Requerido",
                                    })}
                                />
                                {errors.manifiestoFile && (
                                    <p className="text-xs text-error mt-1">
                                        {errors.manifiestoFile.message as string}
                                    </p>
                                )}
                            </div>

                            {/* Observaciones */}
                            <div className="form-control flex flex-col">
                                <label className="label">
                                    <span className="label-text">
                                        Observaciones <span className="text-error">*</span>
                                    </span>
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered min-h-28 ${errors.observaciones ? "textarea-error" : ""}`}
                                    placeholder="Observaciones"
                                    {...register("observaciones", {
                                        required: "Requerido",
                                        minLength: { value: 5, message: "Mínimo 5 caracteres" },
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
                                    <span className="label-text">Distribuidora</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    disabled={loadingDists}
                                    {...register("distribuidora")}
                                    value={distSlugSelected ?? ""}
                                    onChange={(e) => {
                                        // mantener integración con react-hook-form
                                        const event = { target: { name: "distribuidora", value: e.target.value } } as any;
                                        // @ts-ignore
                                        register("distribuidora").onChange(event);
                                    }}
                                >
                                    {DIST_OPTS.map((opt) => (
                                        <option key={opt.value || "default"} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {loadingDists && (
                                    <p className="text-xs text-slate-500 mt-1">Cargando distribuidoras…</p>
                                )}
                            </div>

                            {/* Descuento a autorizar */}
                            <div className="form-control flex flex-col">
                                <label className="label">
                                    <span className="label-text">Descuento a autorizar</span>
                                </label>
                                <input
                                    className={`input input-bordered ${errors.descuentoAut ? "input-error" : ""}`}
                                    placeholder="0"
                                    {...register("descuentoAut", {
                                        validate: (v) =>
                                            !v || /^\d+$/.test(v.trim()) || "Solo números enteros",
                                    })}
                                />
                                {errors.descuentoAut && (
                                    <p className="text-xs text-error mt-1">
                                        {errors.descuentoAut.message as string}
                                    </p>
                                )}
                            </div>

                            {/* Copia de la cédula (requerido si Documentos = Si) */}
                            <div className="form-control flex flex-col ">
                                <label className="label">
                                    <span className="label-text">
                                        Copia de la cédula {docValue === "Si" && <span className="text-error">*</span>}
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    className={`file-input file-input-bordered ${errors.cedulaFile ? "file-input-error" : ""}`}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    {...register("cedulaFile", {
                                        validate: (files) =>
                                            docValue === "No" || (files && files.length > 0) || "Requerido",
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
                    <div className="flex items-center justify-between pt-2">
                        <button type="button" className="btn" onClick={() => navigate(-1)}>
                            ← Volver
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={isSubmitting || isPending || loadingDists}
                        >
                            {isSubmitting || isPending ? "Procesando…" : "✓ Facturar"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default SolicitarFacturacionPage;
