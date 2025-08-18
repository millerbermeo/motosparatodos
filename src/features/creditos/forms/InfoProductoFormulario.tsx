// src/components/solicitudes/InfoProductoFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";

type ProductoValues = {
    marca: string;
    linea: string;
    modelo: string | number;
    valorMoto: number | string;

    plazoCuotas: number | string;
    cuotaInicial: number | string;
    comentario?: string;
};

type Props = {
    // opcional: si ya tienes la info elegida de la moto, pásala aquí
    initialValues?: Partial<ProductoValues>;
    onSubmitForm?: (payload: {
        marca: string;
        linea: string;
        modelo: string;
        valorMoto: number;
        plazoCuotas: number;
        cuotaInicial: number;
        comentario?: string;
    }) => void;
};

const plazosOptions: SelectOption[] = [6, 12, 18, 24, 36, 48, 60].map((p) => ({
    value: String(p),
    label: String(p),
}));

const InfoProductoFormulario: React.FC<Props> = ({ initialValues, onSubmitForm }) => {
    const { control, handleSubmit, watch } = useForm<ProductoValues>({
        mode: "onBlur",
        defaultValues: {
            marca: initialValues?.marca ?? "",
            linea: initialValues?.linea ?? "",
            modelo: initialValues?.modelo ?? "",
            valorMoto: initialValues?.valorMoto ?? 0,
            plazoCuotas: initialValues?.plazoCuotas ?? 6,
            cuotaInicial: initialValues?.cuotaInicial ?? 0,
            comentario: initialValues?.comentario ?? "",
        },
    });

    const valorMoto = Number(watch("valorMoto") || 0);

    const onSubmit = (v: ProductoValues) => {
        const payload = {
            marca: String(v.marca ?? ""),
            linea: String(v.linea ?? ""),
            modelo: String(v.modelo ?? ""),
            valorMoto: Number(v.valorMoto) || 0,
            plazoCuotas: Number(v.plazoCuotas) || 0,
            cuotaInicial: Number(v.cuotaInicial) || 0,
            comentario: v.comentario?.trim() || undefined,
        };
        onSubmitForm ? onSubmitForm(payload) : console.log("InfoProducto payload:", payload);
    };

    const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


            <div className="badge text-xl badge-success text-white  mb-3">
                Solicitud de crédito - Información del producto
            </div>

            <div className={grid}>
                {/* Marca (solo lectura) */}
                <FormInput
                    name="marca"
                    label="Marca"
                    control={control}
                    disabled
                    placeholder="—"
                />

                {/* Línea (solo lectura) */}
                <FormInput
                    name="linea"
                    label="Línea"
                    control={control}
                    disabled
                    placeholder="—"
                />

                {/* Modelo (solo lectura) */}
                <FormInput
                    name="modelo"
                    label="Modelo"
                    control={control}
                    disabled
                    placeholder="—"
                />

                {/* Valor de la moto (solo lectura) */}
                <FormInput
                    name="valorMoto"
                    label="Valor de la moto"
                    type="number"
                    control={control}
                    disabled
                    placeholder="0"
                />

                {/* Plazo (cuotas) */}
                <FormSelect
                    name="plazoCuotas"
                    label="Plazo (Cuotas)"
                    control={control}
                    options={plazosOptions}
                    rules={{ required: "Seleccione el plazo" }}
                />

                {/* Cuota inicial */}
                <FormInput
                    name="cuotaInicial"
                    label="Cuota inicial"
                    type="number"
                    control={control}
                    placeholder="0"
                    rules={{
                        required: "Requerido",
                        validate: (v) => {
                            const n = Number(v);
                            if (isNaN(n) || n < 0) return "Debe ser un número mayor o igual a 0";
                            if (valorMoto && n > valorMoto) return "No puede ser mayor al valor de la moto";
                            return true;
                        },
                    }}
                />
            </div>

            {/* Comentario (usa FormInput como textarea simple) */}
            <div>
                <FormInput
                    name="comentario"
                    label="Comentario"
                    control={control}
                    placeholder="Ingrese el comentario de crédito"
                    className="min-h-28"
                />
            </div>

            <div className="flex justify-end gap-2">
                <button type="reset" className="btn btn-ghost">Limpiar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default InfoProductoFormulario;
