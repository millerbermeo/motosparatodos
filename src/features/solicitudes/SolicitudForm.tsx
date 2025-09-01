import React from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { FormInput } from "../../shared/components/FormInput";
import { useRegistrarSolicitudFacturacion } from "../../services/solicitudServices";

// ============================ Tipos (solo lo que pide la UI) ============================
type SolicitudFormValues = {
  // Información del cliente
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  numeroDocumento: string;
  numeroCelular: string;
  fechaNacimiento: string;
  ciudadResidencia: string;
  direccionResidencia: string;

  // Información del producto
  numeroChasis: string;
  numeroMotor: string;
  placa?: string;
  color?: string;
};

// ============================ Reglas/regex ============================
const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/;
const soloDigitos = /^[0-9]+$/;
const celularRegex = /^[0-9]{7,10}$/;

const SolicitudForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // <- este es el codigo_credito
  const { mutate: registrar, isPending } = useRegistrarSolicitudFacturacion();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm<SolicitudFormValues>({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      numeroDocumento: "",
      numeroCelular: "",
      fechaNacimiento: "",
      ciudadResidencia: "",
      direccionResidencia: "",
      numeroChasis: "",
      numeroMotor: "",
      placa: "",
      color: "",
    },
  });

  // ============================ Submit ============================
  const onSubmit = (values: SolicitudFormValues) => {
    const fd = new FormData();

    // Campos EXACTOS (snake_case) + codigo_credito (id)
    if (id) {
      fd.append("id_cotizacion", String(id));  // <-- mismo id para id_cotizacion
    }

    fd.append("agencia", "Motos");
    // fd.append("codigo_solicitud", "Motos");
    // 1) Construir el nombre completo sin espacios extra
    const nombreCliente = [
      values.primerNombre,
      values.segundoNombre,
      values.primerApellido,
      values.segundoApellido,
    ]
      .map(v => (v ?? "").trim())   // limpia extremos
      .filter(Boolean)               // elimina vacíos
      .join(" ")                     // une con un espacio
      .replace(/\s+/g, " ");         // colapsa espacios múltiples

    // 2) Agregar al FormData con la clave que espera el backend
    fd.append("nombre_cliente", nombreCliente);


    fd.append("numero_documento", values.numeroDocumento.trim());
    fd.append("numero_celular", values.numeroCelular.trim());
    fd.append("fecha_nacimiento", values.fechaNacimiento);
    fd.append("ciudad_residencia", values.ciudadResidencia.trim());
    fd.append("direccion_residencia", values.direccionResidencia.trim());

    fd.append("numero_chasis", values.numeroChasis.trim());
    fd.append("numero_motor", values.numeroMotor.trim());
    fd.append("placa", (values.placa ?? "").toUpperCase().trim());
    fd.append("color", (values.color ?? "").trim());
    fd.append("tipo_solicitud", "Contado");


    registrar(fd, {
      onSuccess: () => {
        reset(); // limpia cuando la API responde OK
      },
    });
  };

  const grid = "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🌐</span>
        <h2 className="text-xl md:text-2xl font-semibold">Diligencie la siguiente información</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ================== Información del cliente ================== */}
        <section className="rounded-xl border border-gray-300 bg-base-100 shadow-sm">
          <div className="border-b bg-sky-500 overflow-hidden rounded-t-2xl border-gray-300 px-4 py-3 md:px-6">
            <h3 className="text-lg md:text-xl font-semibold text-center text-white">Información del cliente</h3>
          </div>

          <div className={`p-4 md:p-6 ${grid}`}>
            <FormInput
              name="primerNombre"
              label="Primer nombre*"
              control={control}
              placeholder="Ingrese primer nombre"
              rules={{
                required: "Requerido",
                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                pattern: { value: soloLetras, message: "Solo letras y espacios" },
              }}
            />
            <FormInput
              name="segundoNombre"
              label="Segundo nombre"
              control={control}
              placeholder="Ingrese segundo nombre"
              rules={{ pattern: { value: soloLetras, message: "Solo letras y espacios" } }}
            />
            <FormInput
              name="primerApellido"
              label="Primer apellido*"
              control={control}
              placeholder="Ingrese primer apellido"
              rules={{ required: "Requerido", pattern: { value: soloLetras, message: "Solo letras y espacios" } }}
            />
            <FormInput
              name="segundoApellido"
              label="Segundo apellido"
              control={control}
              placeholder="Ingrese segundo apellido"
              rules={{ pattern: { value: soloLetras, message: "Solo letras y espacios" } }}
            />
            <FormInput
              name="numeroDocumento"
              label="Número de documento*"
              control={control}
              placeholder="Ingrese número de documento"
              rules={{
                required: "Requerido",
                minLength: { value: 5, message: "Mínimo 5 dígitos" },
                maxLength: { value: 15, message: "Máximo 15 dígitos" },
                pattern: { value: soloDigitos, message: "Solo dígitos" },
              }}
            />
            <FormInput
              name="numeroCelular"
              label="Número de celular*"
              control={control}
              placeholder="Ingrese número de celular"
              rules={{
                required: "Requerido",
                pattern: { value: celularRegex, message: "Debe tener 7 a 10 dígitos" },
              }}
            />
            <FormInput
              name="fechaNacimiento"
              label="Fecha de nacimiento*"
              type="date"
              control={control}
              rules={{ required: "Requerido" }}
            />
            <FormInput
              name="ciudadResidencia"
              label="Ciudad de residencia*"
              control={control}
              placeholder="Ingrese ciudad de residencia"
              rules={{
                required: "Requerido",
                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                pattern: { value: soloLetras, message: "Solo letras y espacios" },
              }}
            />
            <FormInput
              name="direccionResidencia"
              label="Dirección de residencia*"
              control={control}
              placeholder="Ingrese dirección de residencia"
              rules={{ required: "Requerido", minLength: { value: 3, message: "Mínimo 3 caracteres" } }}
            />
          </div>
        </section>

        {/* ================== Información del producto ================== */}
        <section className="rounded-2xl border border-gray-300 bg-base-100 shadow-sm">
          <div className="border-b bg-sky-500 overflow-hidden rounded-t-2xl border-gray-300 px-4 py-3 md:px-6">
            <h3 className="text-lg md:text-xl font-semibold text-center text-white">Información del producto</h3>
          </div>

          <div className={`p-4 md:p-6 ${grid}`}>
            <FormInput
              name="numeroChasis"
              label="Número de chasis*"
              control={control}
              placeholder="Ingrese número de chasis"
              rules={{ required: "Requerido" }}
            />
            <FormInput
              name="numeroMotor"
              label="Número de motor*"
              control={control}
              placeholder="Ingrese número de motor"
              rules={{ required: "Requerido" }}
            />
            <FormInput
              name="color"
              label="Color"
              control={control}
              placeholder="Ingrese color"
              rules={{ pattern: { value: soloLetras, message: "Solo letras y espacios" } }}
            />
            <FormInput
              name="placa"
              label="Placa"
              control={control}
              placeholder="Ingrese placa"
              rules={{ setValueAs: (v: any) => (v ? String(v).toUpperCase() : v) }}
            />
          </div>
        </section>

        {/* ================== Acciones ================== */}
        <div className="flex justify-between">
          <button type="button" className="btn" onClick={() => history.back()}>
            ← Volver
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => reset()}
              disabled={isSubmitting || isPending}
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={!isValid || isSubmitting || isPending}
            >
              Aceptar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SolicitudForm;
