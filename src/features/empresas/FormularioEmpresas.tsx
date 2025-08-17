import React from "react";
import {
    useCreateEmpresa,
    useUpdateEmpresa,
} from "../../services/empresasServices";
import type { Empresa } from "../../shared/types/empresas";


type Base = {
    id?: number;
    nombre_empresa: string;
    nit_empresa: string;
    correo_garantias: string;
    telefono_garantias: string;
    correo_siniestros: string;
    telefono_siniestros: string;
    direccion_siniestros: string;
    slogan_empresa?: string | null;
    sitio_web?: string | null;
    imagen?: string | null; // filename/url actual
};

type EmpresaForm = Omit<Empresa, "id" | "imagen"> & { imagen?: File | null };


type Props =
    | { initialValues?: undefined; mode?: "create" }
    | { initialValues: Base & { id: number }; mode: "edit" };

const FormularioEmpresas: React.FC<Props> = ({ initialValues, mode = "create" }) => {
    const [nombreEmpresa, setNombreEmpresa] = React.useState(initialValues?.nombre_empresa ?? "");
    const [nitEmpresa, setNitEmpresa] = React.useState(initialValues?.nit_empresa ?? "");
    const [correoGarantias, setCorreoGarantias] = React.useState(initialValues?.correo_garantias ?? "");
    const [telGarantias, setTelGarantias] = React.useState(initialValues?.telefono_garantias ?? "");
    const [correoSiniestros, setCorreoSiniestros] = React.useState(initialValues?.correo_siniestros ?? "");
    const [telSiniestros, setTelSiniestros] = React.useState(initialValues?.telefono_siniestros ?? "");
    const [direccionSiniestros, setDireccionSiniestros] = React.useState(initialValues?.direccion_siniestros ?? "");
    const [slogan, setSlogan] = React.useState(initialValues?.slogan_empresa ?? "");
    const [sitioWeb, setSitioWeb] = React.useState(initialValues?.sitio_web ?? "");
    const [file, setFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(initialValues?.imagen ?? null);

    const create = useCreateEmpresa();
    const update = useUpdateEmpresa();

    React.useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: EmpresaForm = {
            nombre_empresa: nombreEmpresa.trim(),
            nit_empresa: nitEmpresa.trim(),
            correo_garantias: correoGarantias.trim(),
            telefono_garantias: telGarantias.trim(),
            correo_siniestros: correoSiniestros.trim(),
            telefono_siniestros: telSiniestros.trim(),
            direccion_siniestros: direccionSiniestros.trim(),
            slogan_empresa: slogan || "",
            sitio_web: sitioWeb || "",
            imagen: file ?? null,
        };

        // 3) en edit, compón el input sin ambigüedad
        if (mode === "edit" && initialValues?.id != null) {
            update.mutate({
                id: initialValues.id,
                ...payload,                 // <- payload NO tiene id
                nuevaImagen: file ?? null,
            } as any);
        } else {
            create.mutate(payload as any);
        }
    };

    const busy = create.isPending || update.isPending;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nombre empresa */}
                <label className="form-control w-full">
                    <span className="label-text">Nombre de la empresa</span>
                    <input
                        className="input input-bordered w-full"
                        value={nombreEmpresa}
                        onChange={(e) => setNombreEmpresa(e.target.value)}
                        required
                    />
                </label>

                {/* NIT */}
                <label className="form-control w-full">
                    <span className="label-text">NIT</span>
                    <input
                        className="input input-bordered w-full"
                        value={nitEmpresa}
                        onChange={(e) => setNitEmpresa(e.target.value)}
                        required
                    />
                </label>

                {/* Correo garantías */}
                <label className="form-control w-full">
                    <span className="label-text">Correo (garantías)</span>
                    <input
                        type="email"
                        className="input input-bordered w-full"
                        value={correoGarantias}
                        onChange={(e) => setCorreoGarantias(e.target.value)}
                        required
                    />
                </label>

                {/* Tel garantías */}
                <label className="form-control w-full">
                    <span className="label-text">Teléfono (garantías)</span>
                    <input
                        className="input input-bordered w-full"
                        value={telGarantias}
                        onChange={(e) => setTelGarantias(e.target.value)}
                        required
                    />
                </label>

                {/* Correo siniestros */}
                <label className="form-control w-full">
                    <span className="label-text">Correo (siniestros)</span>
                    <input
                        type="email"
                        className="input input-bordered w-full"
                        value={correoSiniestros}
                        onChange={(e) => setCorreoSiniestros(e.target.value)}
                        required
                    />
                </label>

                {/* Tel siniestros */}
                <label className="form-control w-full">
                    <span className="label-text">Teléfono (siniestros)</span>
                    <input
                        className="input input-bordered w-full"
                        value={telSiniestros}
                        onChange={(e) => setTelSiniestros(e.target.value)}
                        required
                    />
                </label>

                {/* Dirección siniestros (2 columnas) */}
                <label className="form-control md:col-span-2">
                    <span className="label-text">Dirección (siniestros)</span>
                    <input
                        className="input input-bordered w-full"
                        value={direccionSiniestros}
                        onChange={(e) => setDireccionSiniestros(e.target.value)}
                        required
                    />
                </label>

                {/* Slogan */}
                <label className="form-control w-full">
                    <span className="label-text">Slogan (opcional)</span>
                    <input
                        className="input input-bordered w-full"
                        value={slogan ?? ""}
                        onChange={(e) => setSlogan(e.target.value)}
                    />
                </label>

                {/* Sitio web */}
                <label className="form-control w-full">
                    <span className="label-text">Sitio web (opcional)</span>
                    <input
                        type="url"
                        className="input input-bordered w-full"
                        value={sitioWeb ?? ""}
                        onChange={(e) => setSitioWeb(e.target.value)}
                    />
                </label>

                {/* Imagen */}
                <label className="form-control w-full">
                    <span className="label-text">Logo / Imagen (opcional)</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {preview && (
                        <div className="mt-2">
                            <img src={preview} alt="Preview" className="h-24 rounded-md object-cover" />
                        </div>
                    )}
                </label>
            </div>

            <div className="flex justify-end gap-2">
                <button className="btn btn-primary" type="submit" disabled={busy}>
                    {mode === "edit" ? "Guardar cambios" : "Crear empresa"}
                </button>
            </div>
        </form>
    );
};

export default FormularioEmpresas;
