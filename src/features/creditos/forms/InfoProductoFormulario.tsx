// src/components/solicitudes/InfoProductoFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect } from "../../../shared/components/FormSelect";
import {
  useActualizarCredito,
  useCredito,
  useDeudor,
} from "../../../services/creditosServices";
import { useCotizacionById } from "../../../services/cotizacionesServices";
import { useParams } from "react-router-dom";
import { useWizardStore } from "../../../store/wizardStore";

import { TablaAmortizacionCredito } from "../../../features/creditos/TablaAmortizacionCredito";
import { unformatNumber } from "../../../utils/money";

/** String con puntos/comas/etc. → número en PESOS (entero) */
const toNumberPesos = (v: unknown): number => {
  if (v == null) return 0;
  const digits = unformatNumber(String(v));
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};

// ✅ AHORA plazoCuotas ES NUMBER SIEMPRE
type ProductoValues = {
  producto: string;
  plazoCuotas: number;
  valorMoto: number | string;
  cuotaInicial: number | string;
  comentario?: string;
  fechaInicio: string; // fecha_inicial en backend — inicio real del crédito
};

// Opciones de plazo (en meses)
const PLAZO_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 6, label: "6 cuotas" },
  { value: 12, label: "12 cuotas" },
  { value: 24, label: "24 cuotas" },
  { value: 36, label: "36 cuotas" },
];

const buildProducto = (c: any): string => {
  if (typeof c?.producto === "string" && c.producto.trim())
    return c.producto.trim();
  const marca = (c?.marca ?? "").toString().trim();
  const linea = (c?.linea ?? "").toString().trim();
  const modelo = (c?.modelo ?? "").toString().trim();
  return [marca, linea, modelo].filter(Boolean).join(" - ");
};

const normalizePlazo = (v: unknown, fallback = 12): number => {
  const n = Number(v);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
};

const InfoProductoFormulario: React.FC = () => {
  const next = useWizardStore((s) => s.next);
  const prev = useWizardStore((s) => s.prev);
  const isFirst = useWizardStore((s) => s.isFirst);

  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  const { control, handleSubmit, setValue, watch } = useForm<ProductoValues>({
    mode: "onBlur",
    defaultValues: {
      producto: "",
      valorMoto: "0",
      plazoCuotas: 12,
      cuotaInicial: "0",
      comentario: "",
      fechaInicio: "",
    },
  });

  const actualizarCredito = useActualizarCredito();
  const isSaving = actualizarCredito.isPending;

  const { data, isLoading, isError } = useCredito(
    { codigo_credito },
    !!codigo_credito
  );

  const creditoBackend =
    data?.success && data.creditos?.length ? data.creditos[0] : null;

  const { data: deudorData } = useDeudor(codigo_credito);
  const infoPers = (deudorData as any)?.data?.informacion_personal;
  const nombreCliente = [
    infoPers?.primer_nombre,
    infoPers?.segundo_nombre,
    infoPers?.primer_apellido,
    infoPers?.segundo_apellido,
  ].filter(Boolean).join(" ") || undefined;

  const { data: cotizacionData } = useCotizacionById(Number(creditoBackend?.cotizacion_id ?? 0));
  const cotObj = cotizacionData?.data;
  const sufCot = (cotObj?.moto_seleccionada ?? 1) === 2 ? "b" : "a";
  const productoCot = [cotObj?.[`marca_${sufCot}`], cotObj?.[`linea_${sufCot}`]]
    .filter(Boolean).join(" ") || undefined;
  const cedulaCot = cotObj?.cedula ?? infoPers?.numero_documento ?? undefined;


  // ✅ Sincroniza FORM apenas llega backend (plazoCuotas = número)
  React.useEffect(() => {
    if (!creditoBackend) return;
    const c = creditoBackend;

    setValue("producto", buildProducto(c), { shouldDirty: false });
    setValue(
      "valorMoto",
      String(
        Number(c?.valor_producto ?? 0) -
        Number(c?.garantia_extendida_valor ?? 0)
      ),
      {
        shouldDirty: false,
      }
    );

    // ✅ número
    const plazoNumero = normalizePlazo(c?.plazo_meses, 12);
    setValue("plazoCuotas", plazoNumero, { shouldDirty: false });

    setValue("cuotaInicial", String(c?.cuota_inicial ?? "0"), {
      shouldDirty: false,
    });
    setValue("comentario", c?.comentario ?? "", { shouldDirty: false });

    // Toma fecha_entrega del backend si existe, si no queda vacío
    const fechaInicialRaw = c?.fecha_inicial
      ? String(c.fecha_inicial).substring(0, 10)
      : c?.fecha_creacion
        ? String(c.fecha_creacion).substring(0, 10)
        : "";
    setValue("fechaInicio", fechaInicialRaw, { shouldDirty: false });
  }, [creditoBackend, setValue]);

  const onSubmit = (v: ProductoValues) => {
    const payload = {
      plazo_meses: v.plazoCuotas || undefined,
      cuota_inicial: toNumberPesos(v.cuotaInicial) || 0,
      comentario: (v.comentario?.trim() ?? "") || null,
      fecha_inicial: v.fechaInicio || null,
    };

    actualizarCredito.mutate(
      { codigo_credito, payload },
      {
        onSuccess: () => {
          // ✅ Re-afirma valores en form
          setValue("plazoCuotas", normalizePlazo(payload.plazo_meses, 12), {
            shouldDirty: false,
          });
          setValue("cuotaInicial", String(payload.cuota_inicial ?? 0), {
            shouldDirty: false,
          });
          setValue("comentario", payload.comentario ?? "", {
            shouldDirty: false,
          });
          next();
        },
      }
    );
  };

  // 👇 Leemos lo que hay en el form
  const plazoCuotasWatch = watch("plazoCuotas");
  const cuotaInicialWatch = watch("cuotaInicial");
  const fechaInicioWatch = watch("fechaInicio");

  // ✅ Tabla: form → backend → 12 (pero ya todo es número)
  const plazoParaTabla = normalizePlazo(
    plazoCuotasWatch ?? creditoBackend?.plazo_meses ?? 12,
    12
  );

  const cuotaInicialParaTabla = toNumberPesos(
    cuotaInicialWatch ?? creditoBackend?.cuota_inicial ?? 0
  );

  const creditoParaTabla = creditoBackend
    ? {
      valor_producto: (Number(creditoBackend.valor_producto) || 0) - (Number(creditoBackend.garantia_extendida_valor) || 0),
      cuota_inicial: cuotaInicialParaTabla,
      plazo_meses: plazoParaTabla,
      soat: creditoBackend.soat ?? "0",
      matricula: creditoBackend.matricula ?? "0",
      impuestos: creditoBackend.impuestos ?? "0",
      accesorios_total: creditoBackend.accesorios_total ?? "0",
      precio_seguros: creditoBackend.precio_seguros ?? "0",
      garantia_extendida_valor: creditoBackend.garantia_extendida_valor ?? "0",
    }
    : null;

  const fechaCreacionCredito =
    fechaInicioWatch ||
    (creditoBackend?.fecha_inicial
      ? String(creditoBackend.fecha_inicial)
      : creditoBackend?.fecha_creacion ?? undefined);

  const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3";

  if (!codigo_credito) {
    return (
      <div className="alert alert-error">
        No se encontró el código del crédito en la URL.
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="badge text-xl badge-success text-white mb-3">
          Solicitud de crédito - Información del producto
        </div>

        {isLoading && <div className="text-sm opacity-70">Cargando crédito…</div>}
        {isError && (
          <div className="text-sm text-error">No se pudo cargar el crédito.</div>
        )}

        <div className={grid}>
          <FormInput
            name="producto"
            label="Producto"
            control={control}
            disabled
            placeholder="—"
          />

          <FormInput
            name="valorMoto"
            label="Valor de la moto"
            type="number"
            control={control}
            disabled
            placeholder="0"
            formatThousands
          />

          <FormSelect
            name="plazoCuotas"
            label="Plazo (Cuotas)"
            control={control}
            options={PLAZO_OPTIONS}
            rules={{ required: "La cantidad de cuotas es obligatoria" }}
          />

          <FormInput
            name="cuotaInicial"
            label="Cuota inicial"
            type="number"
            control={control}
            placeholder="0"
            formatThousands
            rules={{
              required: "Requerido",
              validate: (v) => toNumberPesos(v) >= 0 || "Debe ser >= 0",
            }}
          />

          <FormInput
            name="fechaInicio"
            label="Fecha inicio del crédito"
            type="date"
            control={control}
            placeholder=""
          />
        </div>

        <div>
          <FormInput
            name="comentario"
            label="Comentario"
            control={control}
            placeholder="Ingrese el comentario de crédito"
            className="min-h-28"
            rules={{
              required: "La descripción es obligatoria",
              minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={prev}
            disabled={isFirst || isSaving}
            title={isFirst ? "Ya estás en el primer paso" : "Ir al paso anterior"}
          >
            ← Anterior
          </button>

          <div className="flex gap-2">
            <button
              data-wizard-save
              type="submit"
              className="btn btn-warning"
              disabled={isSaving}
              title="Guardar cambios (avanza solo si se guarda correctamente)"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </form>

      {creditoParaTabla && (
        <div className="mt-8">
          <TablaAmortizacionCredito
            credito={creditoParaTabla}
            fechaCreacion={fechaCreacionCredito}
            cotizacionId={Number(creditoBackend?.cotizacion_id ?? 0)}
            tasaFinanciacion={Number(cotObj?.tasa_financiacion) > 0 ? Number(cotObj.tasa_financiacion) : undefined}
            tasaGarantia={Number(cotObj?.tasa_garantia) > 0 ? Number(cotObj.tasa_garantia) : undefined}
            nombreCliente={nombreCliente}
            cedula={cedulaCot}
            direccion={infoPers?.direccion_residencia}
            telefono={infoPers?.celular}
            producto={productoCot}
          />
        </div>
      )}
    </>
  );
};

export default InfoProductoFormulario;
