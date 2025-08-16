import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { FormValues } from "./types";
import { modelosPorMarca } from "./catalogs";
import { ContactSelects } from "./components/ContactSelects";
import { DatosPersonales } from "./components/DatosPersonales";
import { MotocicletasSection } from "./components/MotocicletasSection";
import { GarantiaAccesorios } from "./components/GarantiaAccesorios";
import { SegurosSection } from "./components/SegurosSection";
import { ResumenValores } from "./components/ResumenValores";
import { CamposAuxiliares } from "./components/CamposAuxiliares";
import { Comentario } from "./components/Comentario";

const CotizacionesFormulario: React.FC = () => {
  const { register, control, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
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

  const v = watch();

  const precioMoto1 =
    modelosPorMarca[v.moto1Marca]?.find((m) => m.value === v.moto1Modelo)?.precio || 0;
  const precioMoto2 =
    modelosPorMarca[v.moto2Marca]?.find((m) => m.value === v.moto2Modelo)?.precio || 0;

  const totalSeguros = useMemo(() => {
    let t = 0;
    (Object.values(v.seguros || {}) as boolean[]).forEach((sel) => {
      if (!sel) return;
    });
    // Recalcular sumando catálogo por clave
    for (const [k, sel] of Object.entries(v.seguros || {})) {
      if (sel) {
        // lazy import para evitar ciclo: require local
        const { SEGUROS_CATALOGO } = require("./catalogs");
        t += SEGUROS_CATALOGO[k as keyof typeof SEGUROS_CATALOGO].valor;
      }
    }
    t += Number(v.otrosSeguros || 0);
    return t;
  }, [v.seguros, v.otrosSeguros]);

  const totalSinSeguros = useMemo(() => {
    const accesorios = Number(v.accesoriosValor || 0);
    const matricula = Number(v.matriculaSoat || 0);
    const descuentos = Number(v.descuentos || 0);
    return precioMoto1 + precioMoto2 + accesorios + matricula - descuentos;
  }, [precioMoto1, precioMoto2, v.accesoriosValor, v.matriculaSoat, v.descuentos]);

  const totalConSeguros = totalSinSeguros + totalSeguros;

  const onSubmit = (data: FormValues) => {
    const safe = { ...data, resumen: { precioMoto1, precioMoto2, totalSeguros, totalSinSeguros, totalConSeguros } };
    console.log("Cotización (ejemplo):", safe);
    alert("Formulario de ejemplo enviado (ver consola).");
  };

  return (
    <div className="overflow-x-auto rounded-2xl p-6 border border-base-300 bg-base-100 shadow-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

          <ContactSelects register={register} />

          <DatosPersonales control={control} errors={errors} />

          <MotocicletasSection
            register={register}
            errors={errors}
            precioMoto1={precioMoto1}
            precioMoto2={precioMoto2}
            moto1Marca={v.moto1Marca}
            moto2Marca={v.moto2Marca}
          />

          <GarantiaAccesorios register={register} control={control} />

          <SegurosSection control={control} totalSeguros={totalSeguros} />

          <ResumenValores
            matriculaSoat={v.matriculaSoat}
            descuentos={v.descuentos}
            accesoriosValor={v.accesoriosValor}
            totalSinSeguros={totalSinSeguros}
            totalConSeguros={totalConSeguros}
          />

          <CamposAuxiliares control={control} />

          <Comentario control={control} />

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
