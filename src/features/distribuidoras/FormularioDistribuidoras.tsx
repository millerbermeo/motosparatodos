import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";
import {
    useCreateDistribuidora,
    useUpdateDistribuidora,
} from "../../services/distribuidoraServices";

import type {
    Distribuidora,
} from "../../services/distribuidoraServices";

type Props =
    | { initialValues?: undefined; mode?: "create" }
    | { initialValues: Distribuidora; mode: "edit" };

type DistribuidoraFormValues = {
    nombre: string;
    telefono: string | null;
    direccion: string | null;
    estado: boolean; // checkbox -> luego lo convertimos a 0/1
};

const FormularioDistribuidoras: React.FC<Props> = ({
    initialValues,
    mode = "create",
}) => {
    const create = useCreateDistribuidora();
    const update = useUpdateDistribuidora();

    const { control, handleSubmit, reset, register } =
        useForm<DistribuidoraFormValues>({
            defaultValues: {
                nombre: initialValues?.nombre ?? "",
                telefono: initialValues?.telefono ?? "",
                direccion: initialValues?.direccion ?? "",
                estado: initialValues ? initialValues.estado === 1 : true,
            },
            mode: "onBlur",
        });

    React.useEffect(() => {
        reset({
            nombre: initialValues?.nombre ?? "",
            telefono: initialValues?.telefono ?? "",
            direccion: initialValues?.direccion ?? "",
            estado: initialValues ? initialValues.estado === 1 : true,
        });
    }, [initialValues, mode, reset]);

    const onSubmit = (values: DistribuidoraFormValues) => {
        const payload = {
            nombre: values.nombre.trim(),
            telefono: values.telefono?.trim() || null,
            direccion: values.direccion?.trim() || null,
            estado: values.estado ? 1 : 0,
        };
        if (mode === "edit" && initialValues?.id != null) {
            update.mutate(
                { id: initialValues.id, fecha: initialValues.fecha, ...payload } as any,
                {
                    onSuccess: () => {
                        close(); // 👈 cierra modal al actualizar correctamente
                    },
                }
            );
        } else {
            create.mutate(payload as any, {
                onSuccess: () => {
                    close(); // 👈 cierra modal al crear correctamente
                    // Si prefieres limpiar en lugar de cerrar:
                    // reset({ nombre: "", telefono: "", direccion: "", estado: true });
                },
            });
        }
    };

    const busy = create.isPending || update.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput<DistribuidoraFormValues>
                name="nombre"
                label="Nombre"
                control={control}
                placeholder="Ej. Fanalca"
                rules={{
                    required: "El nombre es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                }}
            />

            <FormInput<DistribuidoraFormValues>
                name="telefono"
                label="Teléfono"
                control={control}
                placeholder="Ej. 555-1234"
                rules={{}}
            />

            <FormInput<DistribuidoraFormValues>
                name="direccion"
                label="Dirección"
                control={control}
                placeholder="Ej. Calle 1 # 2-3"
                rules={{}}
            />

            <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                    <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        {...register("estado")}
                    />
                    <span className="label-text">Activa</span>
                </label>
            </div>

            <div className="flex justify-end gap-2">
                <button className="btn btn-primary" type="submit" disabled={busy}>
                    {mode === "edit" ? "Guardar cambios" : "Crear distribuidora"}
                </button>
            </div>
        </form>
    );
};

export default FormularioDistribuidoras;
