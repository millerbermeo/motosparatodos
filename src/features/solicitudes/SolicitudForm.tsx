// src/pages/SolicitudForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FormInput } from "../../shared/components/FormInput";
import { useRegistrarProcesoContado } from "../../services/procesoContadoServices";
import { useGetProcesoContadoPorCotizacionYMoto } from "../../services/procesoContadoHooks";

/* ============================ Tipos (solo lo que pide la UI) ============================ */
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

type ClienteForForm = Partial<
  Pick<
    SolicitudFormValues,
    | "primerNombre"
    | "segundoNombre"
    | "primerApellido"
    | "segundoApellido"
    | "numeroDocumento"
    | "numeroCelular"
    | "fechaNacimiento"
    | "ciudadResidencia"
    | "direccionResidencia"
  >
>;

// 👇 Estructura esperada desde buildSolicitudState(row)
type MotosState = {
  A?: any | null;
  B?: any | null;
  seleccionada?: any | null; // cuando viene solo una elegida
};
type IncomingCotizacionState = {
  cotizacionId?: number;
  clienteForForm?: ClienteForForm;
  motos?: MotosState;
  comercial?: any;
  raw?: any; // payload completo original de la cotización (si lo envías)
  motoSeleccion?: "A" | "B" | ""; // en caso de que se haya elegido en la pantalla anterior
};

/* ============================ Reglas/regex ============================ */
const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/;
const soloDigitos = /^[0-9]+$/;
const celularRegex = /^[0-9]{7,10}$/;

// helper para serializar sin undefined
const safeJSONString = (obj: any) => {
  try {
    return JSON.stringify(obj ?? null);
  } catch {
    return "{}";
  }
};

// extraer posibles datos de moto desde location.state
const pickMotoFromState = (incoming?: IncomingCotizacionState | null) => {
  const sel = incoming?.motos?.seleccionada ?? null;
  // intentamos varios nombres comunes
  const numero_chasis =
    sel?.numero_chasis ?? sel?.chasis ?? sel?.vin ?? sel?.numeroChasis ?? "";
  const numero_motor =
    sel?.numero_motor ?? sel?.motor ?? sel?.numeroMotor ?? "";
  const color = sel?.color ?? "";
  const placa = sel?.placa ?? "";
  return {
    numero_chasis: String(numero_chasis || ""),
    numero_motor: String(numero_motor || ""),
    color: String(color || ""),
    placa: String(placa || ""),
  };
};

const SolicitudForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // <- id de la cotización
  const navigate = useNavigate();
  const { mutate: registrar, isPending } = useRegistrarProcesoContado();

  // ⬇️ Recibir TODO lo que venga desde navigate(..., { state })
  const location = useLocation();
  const incoming = (location.state as IncomingCotizacionState) || {};

  console.log(incoming)
  const clienteForForm = incoming?.clienteForForm;

  // "semilla" de moto desde location para poder consultar proceso_contado
  const motoSeed = React.useMemo(() => pickMotoFromState(incoming), [incoming]);

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

  // Prefill SOLO datos de cliente si llegaron por state (no tocamos los campos de producto)
  React.useEffect(() => {
    if (!clienteForForm) return;
    reset((prev) => ({
      ...prev,
      primerNombre: clienteForForm.primerNombre ?? "",
      segundoNombre: clienteForForm.segundoNombre ?? "",
      primerApellido: clienteForForm.primerApellido ?? "",
      segundoApellido: clienteForForm.segundoApellido ?? "",
      numeroDocumento: clienteForForm.numeroDocumento ?? "",
      numeroCelular: clienteForForm.numeroCelular ?? "",
      fechaNacimiento: clienteForForm.fechaNacimiento ?? "",
      ciudadResidencia: clienteForForm.ciudadResidencia ?? "",
      direccionResidencia: clienteForForm.direccionResidencia ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteForForm]);

  // Prefill de producto con lo que venga en location.state (solo si hay algo)
  React.useEffect(() => {
    const hasSeed =
      (motoSeed.numero_chasis && motoSeed.numero_chasis.length > 0) ||
      (motoSeed.numero_motor && motoSeed.numero_motor.length > 0) ||
      (motoSeed.color && motoSeed.color.length > 0) ||
      (motoSeed.placa && motoSeed.placa.length > 0);
    if (!hasSeed) return;
    reset((prev) => ({
      ...prev,
      numeroChasis: motoSeed.numero_chasis || prev.numeroChasis,
      numeroMotor: motoSeed.numero_motor || prev.numeroMotor,
      color: motoSeed.color || prev.color,
      placa: motoSeed.placa || prev.placa,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motoSeed.numero_chasis, motoSeed.numero_motor, motoSeed.color, motoSeed.placa]);

  // ==================== Consultar proceso_contado ====================
  // También observamos lo que el usuario escriba, por si quiere buscar con datos distintos

  const cotizacionId = React.useMemo(
    () => (id ? Number(id) : incoming?.cotizacionId ?? undefined),
    [id, incoming?.cotizacionId]
  );
  const { data: pcData, isFetching: pcLoading } =
    useGetProcesoContadoPorCotizacionYMoto({
      cotizacion_id: cotizacionId,
    });


  console.log("sss", pcData);





  // Aplicar autocompletado UNA sola vez cuando pcData llega
  const didAutofillRef = React.useRef(false);
  React.useEffect(() => {
    if (!pcData || didAutofillRef.current) return;

    // mapear del API -> inputs del form
    reset((prev) => ({
      ...prev,
      primerNombre: pcData.primer_nombre ?? prev.primerNombre,
      segundoNombre: pcData.segundo_nombre ?? prev.segundoNombre,
      primerApellido: pcData.primer_apellido ?? prev.primerApellido,
      segundoApellido: pcData.segundo_apellido ?? prev.segundoApellido,
      numeroDocumento: pcData.numero_documento ?? prev.numeroDocumento,
      numeroCelular: pcData.numero_celular ?? prev.numeroCelular,
      fechaNacimiento: pcData.fecha_nacimiento ?? prev.fechaNacimiento,
      ciudadResidencia: pcData.ciudad_residencia ?? prev.ciudadResidencia,
      direccionResidencia: pcData.direccion_residencia ?? prev.direccionResidencia,
      numeroChasis: pcData.numero_chasis ?? prev.numeroChasis,
      numeroMotor: pcData.numero_motor ?? prev.numeroMotor,
      placa: pcData.placa ?? prev.placa,
      color: pcData.color ?? prev.color,
    }));

    didAutofillRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pcData]);

  // ============================ Submit ============================
  const onSubmit = (values: SolicitudFormValues) => {
    const fd = new FormData();

    // ==== helpers locales SOLO para este submit ====
    const inferLadoFromIncoming = (incoming?: IncomingCotizacionState | null): 'a' | 'b' | null => {
      if (!incoming) return null;
      if (incoming.motoSeleccion === 'A') return 'a';
      if (incoming.motoSeleccion === 'B') return 'b';

      const sel = incoming?.motos?.seleccionada;
      const raw = incoming?.raw;
      if (!sel || !raw) return null;

      const norm = (s: any) =>
        String(s ?? '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .trim();

      const lineaSel = norm(sel.linea ?? sel.modelo ?? '');
      const lineaA = norm(raw.linea_a ?? '');
      const lineaB = norm(raw.linea_b ?? '');

      if (lineaSel && lineaA && lineaSel.includes(lineaA)) return 'a';
      if (lineaSel && lineaB && lineaSel.includes(lineaB)) return 'b';
      return null;
    };

    const getDocsFor = (raw: any, lado: 'a' | 'b') => {
      const suf = `_${lado}`;
      const soat = Number(raw?.[`soat${suf}`]) || 0;
      const impuestos = Number(raw?.[`impuestos${suf}`]) || 0;
      const matricula = Number(raw?.[`matricula${suf}`]) || 0;
      const precio_documentos = Number(raw?.[`precio_documentos${suf}`]) || 0;
      return { soat, impuestos, matricula, precio_documentos };
    };
    // =================================================

    if (id) fd.append("id_cotizacion", String(id));
    fd.append("is_act", "2");
    fd.append("agencia", "Motos");

    const nombreCliente = [
      values.primerNombre,
      values.segundoNombre,
      values.primerApellido,
      values.segundoApellido,
    ]
      .map((v) => (v ?? "").trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ");
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

    // ==== NUEVO: enriquecer motos/seleccionada con SOAT/IMP/MAT/Docs ====
    const ladoInferido = inferLadoFromIncoming(incoming);
    const raw = incoming?.raw ?? {};

    let motoSeleccionadaEnriched = incoming?.motos?.seleccionada ?? null;
    if (motoSeleccionadaEnriched && ladoInferido) {
      const docs = getDocsFor(raw, ladoInferido);
      motoSeleccionadaEnriched = {
        ...motoSeleccionadaEnriched,
        soat: docs.soat,
        impuestos: docs.impuestos,
        matricula: docs.matricula,
        precioDocumentos: docs.precio_documentos,
        _lado: ladoInferido.toUpperCase(), // "A" | "B" (solo informativo)
      };
    }

    const docsA = getDocsFor(raw, 'a');
    const docsB = getDocsFor(raw, 'b');

    const motosPayload = (() => {
      const base = incoming?.motos ? { ...incoming.motos } : {};
      const A = base?.A ?? null;
      const B = base?.B ?? null;

      const A_enriched = A
        ? {
          ...A,
          soat: docsA.soat,
          impuestos: docsA.impuestos,
          matricula: docsA.matricula,
          precioDocumentos: docsA.precio_documentos,
        }
        : A;

      const B_enriched = B
        ? {
          ...B,
          soat: docsB.soat,
          impuestos: docsB.impuestos,
          matricula: docsB.matricula,
          precioDocumentos: docsB.precio_documentos,
        }
        : B;

      return {
        ...base,
        A: A_enriched,
        B: B_enriched,
        seleccionada: motoSeleccionadaEnriched ?? base.seleccionada ?? null,
      };
    })();
    // ================================================================

    // Payloads extra que ya tenías (usando ahora los enriquecidos)
    fd.append(
      "cotizacion_payload",
      safeJSONString({
        cotizacionId: incoming?.cotizacionId ?? (id ? Number(id) : null),
        comercial: incoming?.comercial ?? null,
        motos: motosPayload, // 👈 con soat/impuestos/matricula/precioDocumentos
        motoSeleccion: incoming?.motoSeleccion ?? null,
      })
    );

    if (motoSeleccionadaEnriched) {
      fd.append("moto_seleccionada", safeJSONString(motoSeleccionadaEnriched));
    } else if (incoming?.motos?.seleccionada) {
      // fallback si por alguna razón no se pudo enriquecer
      fd.append("moto_seleccionada", safeJSONString(incoming.motos.seleccionada));
    }

    if (incoming?.raw) {
      fd.append("cotizacion_raw", safeJSONString(incoming.raw));
    }
    if (incoming?.clienteForForm) {
      fd.append("cliente_from_state", safeJSONString(incoming.clienteForForm));
    }

    // (Opcional) Si tu backend quiere estos valores aparte, descomenta:
    // if (motoSeleccionadaEnriched) {
    //   const s = motoSeleccionadaEnriched as any;
    //   if (typeof s.soat === 'number') fd.append("soat_moto", String(s.soat));
    //   if (typeof s.impuestos === 'number') fd.append("impuestos_moto", String(s.impuestos));
    //   if (typeof s.matricula === 'number') fd.append("matricula_moto", String(s.matricula));
    // }

    // ✅ Aquí capturamos la respuesta para tomar el "codigo" y navegar
    registrar(fd, {
      onSuccess: (resp: any) => {
        const codigo = resp?.codigo;
        if (codigo) {
          reset();
          navigate(`/cotizaciones/facturacion/${encodeURIComponent(codigo)}`);
        } else {
          reset();
          navigate(`/cotizaciones`);
        }
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

      {/* Puedes mostrar un pequeño estado mientras busca en proceso_contado */}
      {pcLoading && (
        <div className="alert alert-info mb-3">Buscando datos previos del cliente y la moto…</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ================== Información del cliente ================== */}
        <section className="rounded-xl border border-gray-300 bg-base-100 shadow-sm">
          <div className="border-b bg-sky-500 overflow-hidden rounded-t-2xl border-gray-300 px-4 py-3 md:px-6">
            <h3 className="text-lg md:text-xl font-semibold text-center text-white">
              Información del cliente
            </h3>
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
            <h3 className="text-lg md:text-xl font-semibold text-center text-white">
              Información del producto
            </h3>
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
              onClick={handleSubmit(onSubmit)}
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
