import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput"; // ajusta el import a tu alias/ruta real

type SeguroKey = "vidaClasicoAnual" | "mascotasSemestral" | "mascotasAnual";

type FormValues = {
  canalContacto: string;
  categoriaRelacion: string;

  cedula: string;
  fechaNacimiento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;

  celular: string;
  email: string;

  moto1Marca: string;
  moto1Modelo: string;
  moto2Marca: string;
  moto2Modelo: string;

  garantiaExtendida: "Si" | "No";
  accesoriosValor: number;

  seguros: Partial<Record<SeguroKey, boolean>>;
  otrosSeguros: number;

  matriculaSoat: number;
  descuentos: number;

  comentario: string;
};

const canales = ["", "Presencial", "Teléfono", "WhatsApp", "Instagram", "Facebook", "Web"];
const categoriasRelacion = ["", "No me interesan", "Me gustan las motos", "Estoy cotizando", "Quiero comprar pronto"];

const marcas = ["", "HONDA", "YAMAHA", "SUZUKI", "BAJAJ"];
const modelosPorMarca: Record<string, Array<{ value: string; label: string; precio: number }>> = {
  "": [{ value: "", label: "Seleccione...", precio: 0 }],
  HONDA: [
    { value: "", label: "Seleccione...", precio: 0 },
    { value: "DIO LED STD 2024", label: "DIO LED STD 2024 - 7.445.000 COP", precio: 7_445_000 },
    { value: "CB125F", label: "CB125F - 7.990.000 COP", precio: 7_990_000 },
  ],
  YAMAHA: [
    { value: "", label: "Seleccione...", precio: 0 },
    { value: "FZ 2.0", label: "FZ 2.0 - 8.600.000 COP", precio: 8_600_000 },
  ],
  SUZUKI: [{ value: "", label: "Seleccione...", precio: 0 }],
  BAJAJ: [{ value: "", label: "Seleccione...", precio: 0 }],
};

const SEGUROS_CATALOGO: Record<SeguroKey, { label: string; valor: number }> = {
  vidaClasicoAnual: { label: "Seguro Vida - Combo clásico 1 año", valor: 67_200 },
  mascotasSemestral: { label: "Seguro Mascotas - Semestral", valor: 50_000 },
  mascotasAnual: { label: "Seguro Mascotas - Anual", valor: 85_000 },
};

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
    isFinite(n) ? Math.max(0, Math.round(n)) : 0
  );

const numberParser = (v: any) => {
  if (v === "" || v == null) return 0;
  const n = Number(String(v).replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
};

const CotizacionesFormulario: React.FC = () => {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      canalContacto: "",
      categoriaRelacion: "",

      cedula: "",
      fechaNacimiento: "",
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",

      celular: "",
      email: "",

      moto1Marca: "HONDA",
      moto1Modelo: "DIO LED STD 2024",
      moto2Marca: "",
      moto2Modelo: "",

      garantiaExtendida: "Si",
      accesoriosValor: 0,

      seguros: {},
      otrosSeguros: 0,

      matriculaSoat: 770001,
      descuentos: 0,

      comentario: "",
    },
  });

  const valores = watch();

  const precioMoto1 =
    modelosPorMarca[valores.moto1Marca]?.find((m) => m.value === valores.moto1Modelo)?.precio || 0;
  const precioMoto2 =
    modelosPorMarca[valores.moto2Marca]?.find((m) => m.value === valores.moto2Modelo)?.precio || 0;

  const totalSeguros = useMemo(() => {
    let t = 0;
    (Object.keys(SEGUROS_CATALOGO) as SeguroKey[]).forEach((k) => {
      if (valores.seguros?.[k]) t += SEGUROS_CATALOGO[k].valor;
    });
    t += Number(valores.otrosSeguros || 0);
    return t;
  }, [valores.seguros, valores.otrosSeguros]);

  const totalSinSeguros = useMemo(() => {
    const accesorios = Number(valores.accesoriosValor || 0);
    const matricula = Number(valores.matriculaSoat || 0);
    const descuentos = Number(valores.descuentos || 0);
    return precioMoto1 + precioMoto2 + accesorios + matricula - descuentos;
  }, [precioMoto1, precioMoto2, valores.accesoriosValor, valores.matriculaSoat, valores.descuentos]);

  const totalConSeguros = totalSinSeguros + totalSeguros;

  const onSubmit = (data: FormValues) => {
    const safe = {
      ...data,
      resumen: { precioMoto1, precioMoto2, totalSeguros, totalSinSeguros, totalConSeguros },
    };
    console.log("Cotización (ejemplo):", safe);
    alert("Formulario de ejemplo enviado (ver consola).");
  };

  const modelosMoto1 = modelosPorMarca[valores.moto1Marca] || modelosPorMarca[""];
  const modelosMoto2 = modelosPorMarca[valores.moto2Marca] || modelosPorMarca[""];

  return (
    <div className="overflow-x-auto rounded-2xl p-6 border border-base-300 bg-base-100 shadow-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        {/* GRID 1→2 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Canal de contacto */}
          <div className="md:col-span-2">
            <div className="relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
              <label className="absolute left-3 top-2 text-xs text-base-content/60 select-none">
                Canal de contacto
              </label>
              <select className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-lg" {...register("canalContacto")}>
                {canales.map((c) => (
                  <option key={c} value={c}>{c || "Seleccione..."}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categoría relación */}
          <div className="md:col-span-2">
            <div className="relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
              <label className="absolute left-3 top-2 text-xs text-base-content/60 select-none">
                Pregunta al cliente: ¿Para ti cuál de estas categorías describe mejor su relación con las motos?
              </label>
              <select className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-lg" {...register("categoriaRelacion")}>
                {categoriasRelacion.map((c) => (
                  <option key={c} value={c}>{c || "Seleccione..."}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos personales con tu FormInput */}
          <FormInput<FormValues> name="cedula" label="Cédula" control={control} />
          <FormInput<FormValues>
            name="fechaNacimiento"
            label="Fecha de nacimiento"
            control={control}
            type="date"
          />

          <FormInput<FormValues>
            name="primerNombre"
            label="Primer nombre"
            control={control}
            rules={{ required: "El primer nombre es obligatorio" }}
          />
          <FormInput<FormValues> name="segundoNombre" label="Segundo nombre" control={control} />

          <FormInput<FormValues>
            name="primerApellido"
            label="Primer apellido"
            control={control}
            rules={{ required: "El primer apellido es obligatorio" }}
          />
          <FormInput<FormValues> name="segundoApellido" label="Segundo apellido" control={control} />

          <FormInput<FormValues>
            name="celular"
            label="Celular"
            control={control}
            type="tel"
            rules={{
              required: "El celular es obligatorio",
              pattern: { value: /^[0-9 +()\-]{7,20}$/, message: "Teléfono no válido" },
            }}
          />
          <FormInput<FormValues>
            name="email"
            label="Email"
            control={control}
            type="email"
            rules={{
              validate: (v: any) => !v || /\S+@\S+\.\S+/.test(v) || "Correo no válido",
            }}
          />

          {/* Motocicletas */}
          <div>
            <div className="relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
              <label className="absolute left-3 top-2 text-xs text-base-content/60">
                Motocicleta 1 <span className="text-error">*</span>
              </label>
              <div className="px-3 pt-6 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2"
                    aria-invalid={!!errors.moto1Marca || !!errors.moto1Modelo}
                    {...register("moto1Marca", { required: "Seleccione la marca" })}
                  >
                    {marcas.map((m) => (
                      <option key={m} value={m}>{m || "Seleccione..."}</option>
                    ))}
                  </select>
                  <select
                    className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2"
                    {...register("moto1Modelo", { required: "Seleccione el modelo" })}
                  >
                    {modelosMoto1.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 text-xs opacity-70">
                  Precio seleccionado: <strong>{fmtCOP(precioMoto1)}</strong>
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm text-error">
              {errors.moto1Marca?.message || errors.moto1Modelo?.message || ""}
            </p>
          </div>

          <div>
            <div className="relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
              <label className="absolute left-3 top-2 text-xs text-base-content/60">Motocicleta 2</label>
              <div className="px-3 pt-6 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2" {...register("moto2Marca")}>
                    {marcas.map((m) => (
                      <option key={m} value={m}>{m || "Seleccione..."}</option>
                    ))}
                  </select>
                  <select className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2" {...register("moto2Modelo")}>
                    {modelosMoto2.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 text-xs opacity-70">
                  Precio seleccionado: <strong>{fmtCOP(precioMoto2)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Garantía y accesorios */}
          <div>
            <div className="relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
              <label className="absolute left-3 top-2 text-xs text-base-content/60">Garantía extendida</label>
              <select className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-lg" {...register("garantiaExtendida")}>
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <FormInput<FormValues>
            name="accesoriosValor"
            label="Accesorios / Marcadas / Personalizadas"
            control={control}
            rules={{ setValueAs: numberParser }}
          />

          {/* SEGUROS */}
          <div className="md:col-span-2">
            <div className="rounded-xl border border-base-300 overflow-hidden">
              <div className="bg-sky-100 px-4 py-2 text-sm font-medium">Elige los seguros de la cotización</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div>
                  {(Object.keys(SEGUROS_CATALOGO) as SeguroKey[]).map((k) => (
                    <label key={k} className="flex items-center gap-2 py-1">
                      <Controller
                        name={`seguros.${k}` as const}
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <span className="text-sm">
                        {SEGUROS_CATALOGO[k].label} - {fmtCOP(SEGUROS_CATALOGO[k].valor)}
                      </span>
                    </label>
                  ))}
                </div>
                <div>
                  <FormInput<FormValues>
                    name="otrosSeguros"
                    label="Otros seguros"
                    control={control}
                    rules={{ setValueAs: numberParser }}
                  />
                  <div className="bg-emerald-100 text-emerald-800 rounded-lg mt-2 px-3 py-2 text-sm">
                    Valor total de seguros: <strong>{fmtCOP(totalSeguros)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="md:col-span-2 space-y-2">
            <div className="bg-sky-100 rounded-lg px-3 py-2 text-sm">
              Matrícula y SOAT: <strong>{fmtCOP(valores.matriculaSoat || 0)}</strong>
            </div>
            <div className="bg-sky-100 rounded-lg px-3 py-2 text-sm">
              Descuentos: <strong>{fmtCOP(valores.descuentos || 0)}</strong>
            </div>
            <div className="bg-sky-100 rounded-lg px-3 py-2 text-sm">
              Accesorios / Marcadas / Personalizadas: <strong>{fmtCOP(valores.accesoriosValor || 0)}</strong>
            </div>
            <div className="bg-emerald-100 rounded-lg px-3 py-2 text-sm font-semibold">
              TOTAL SIN SEGUROS: <strong>{fmtCOP(totalSinSeguros)}</strong>
            </div>
            <div className="bg-emerald-100 rounded-lg px-3 py-2 text-sm font-semibold">
              TOTAL CON SEGUROS: <strong>{fmtCOP(totalConSeguros)}</strong>
            </div>
          </div>

          {/* Campos numéricos auxiliares */}
          <FormInput<FormValues>
            name="matriculaSoat"
            label="Matrícula y SOAT"
            control={control}
            rules={{ setValueAs: numberParser }}
          />
          <FormInput<FormValues>
            name="descuentos"
            label="Descuentos"
            control={control}
            rules={{ setValueAs: numberParser }}
          />

          {/* Comentario */}
          <FormInput<FormValues>
            name="comentario"
            label="Comentario"
            control={control}
            rules={{ required: "El comentario es obligatorio" }}
          />

          {/* Submit */}
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="btn btn-primary w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cotización (ejemplo)"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CotizacionesFormulario;
