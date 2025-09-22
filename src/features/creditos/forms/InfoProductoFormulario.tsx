// src/components/solicitudes/InfoProductoFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { useActualizarCredito } from "../../../services/creditosServices";
import { useParams } from "react-router-dom";
import { useCredito } from "../../../services/creditosServices"; // si tu hook está aquí
import { useWizardStore } from "../../../store/wizardStore";

// === Helpers dinero: UI en pesos ↔ DB en centavos ===
import { unformatNumber } from "../../../shared/components/moneyUtils";

/** String con puntos/comas/etc. → número en PESOS (entero) */
const toNumberPesos = (v: unknown): number => {
  if (v == null) return 0;
  const digits = unformatNumber(String(v)); // "1.200.000" -> "1200000"
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};

/** Centavos (DB, escala 2) → string de pesos (sin formato) para el form */
const centsToPesosStr = (cents: unknown): string => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return "0";
  return String(Math.trunc(n / 100)); // 123456 -> "1234"
};

/** String de pesos (con máscara) → número en centavos para DB */
const pesosStrToCentsNumber = (value: unknown): number => {
  const pesos = toNumberPesos(value); // "1.234.567" -> 1234567
  return pesos * 100;
};

type ProductoValues = {
  /** Solo lectura, viene del backend como string "Marca - Línea - Modelo" o similar */
  producto: string;
  /** Solo lectura (en PESOS, tal como viene del backend) */
  valorMoto: number | string;

  /** Editables */
  plazoCuotas: number | string;
  cuotaInicial: number | string;
  comentario?: string;
};

const toNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, "."));
  return Number.isFinite(n) ? n : 0;
};

// Arma el string "Marca - Línea - Modelo" si vienen campos sueltos
const buildProducto = (c: any): string => {
  if (typeof c?.producto === "string" && c.producto.trim()) return c.producto.trim();
  const marca = (c?.marca ?? "").toString().trim();
  const linea = (c?.linea ?? "").toString().trim();
  const modelo = (c?.modelo ?? "").toString().trim();
  return [marca, linea, modelo].filter(Boolean).join(" - ");
};

const InfoProductoFormulario: React.FC = () => {
  // Wizard (Zustand)
  const next = useWizardStore((s) => s.next);
  const prev = useWizardStore((s) => s.prev);
  const isFirst = useWizardStore((s) => s.isFirst);

  // 1) Tomar el código desde la URL
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  // 2) RHF
  const { control, handleSubmit, setValue } = useForm<ProductoValues>({
    mode: "onBlur",
    defaultValues: {
      producto: "",
      valorMoto: "0",     // string para que la máscara aplique
      plazoCuotas: 6,
      cuotaInicial: "0",  // string para máscara
      comentario: "",
    },
  });

  const actualizarCredito = useActualizarCredito();
  const isSaving = actualizarCredito.isPending;

  // 3) Traer el crédito
  const { data, isLoading, isError } = useCredito({ codigo_credito }, !!codigo_credito);

  // 4) Mapear data -> setValue (listar con setValue, no reset)
  React.useEffect(() => {
    if (!data?.success || !data?.creditos?.length) return;
    const c = data.creditos[0];

    setValue("producto", buildProducto(c), { shouldDirty: false });

    // ⚠️ Valor de producto YA VIENE EN PESOS. NO dividir, NO quitar ceros.
    // Solo conviértelo a string para que FormInput lo formatee con puntos.
    setValue("valorMoto", String(c?.valor_producto ?? "0"), { shouldDirty: false });

    setValue("plazoCuotas", c?.plazo_meses ?? 6, { shouldDirty: false });

    // cuota_inicial: seguimos manejando escala 2 (centavos) si tu backend lo requiere.
    // Si también viene en pesos, cambia esta línea por: String(c?.cuota_inicial ?? "0")
    setValue("cuotaInicial", centsToPesosStr(c?.cuota_inicial ?? 0), { shouldDirty: false });

    setValue("comentario", c?.comentario ?? "", { shouldDirty: false });
  }, [data, setValue]);

  // 5) Guardar (solo actualiza los 3 campos)
  const onSubmit = (v: ProductoValues) => {
    const payload = {
      plazo_meses: toNumber(v.plazoCuotas) || undefined,
      // UI (pesos con máscara) -> DB (centavos). Si tu backend quiere pesos, usa toNumberPesos(v.cuotaInicial)
      cuota_inicial: pesosStrToCentsNumber(v.cuotaInicial) || 0,
      comentario: (v.comentario?.trim() ?? "") || null,
    };
    actualizarCredito.mutate(
      { codigo_credito, payload },
      {
        onSuccess: () => {
          // reflejar los confirmados sin marcar dirty
          setValue("plazoCuotas", payload.plazo_meses ?? 0, { shouldDirty: false });
          // Volvemos a mostrar en pesos (string) para la UI
          setValue("cuotaInicial", centsToPesosStr(payload.cuota_inicial ?? 0), { shouldDirty: false });
          setValue("comentario", payload.comentario ?? "", { shouldDirty: false });
          next();
        },
      }
    );
  };

  const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3";

  if (!codigo_credito) {
    return <div className="alert alert-error">No se encontró el código del crédito en la URL.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="badge text-xl badge-success text-white mb-3">
        Solicitud de crédito - Información del producto
      </div>

      {/* Estados simples */}
      {isLoading && <div className="text-sm opacity-70">Cargando crédito…</div>}
      {isError && <div className="text-sm text-error">No se pudo cargar el crédito.</div>}

      <div className={grid}>
        {/* Solo lectura en un solo campo */}
        <FormInput name="producto" label="Producto" control={control} disabled placeholder="—" />

        {/* Valor de la moto: en PESOS tal cual, solo agregar puntos */}
        <FormInput
          name="valorMoto"
          label="Valor de la moto"
          type="number"
          control={control}
          disabled
          placeholder="0"
          formatThousands
        />

        {/* Editables */}
        <FormInput
          name="plazoCuotas"
          label="Plazo (Cuotas)"
          type="number"
          control={control}
          placeholder="Ej. 12"
          rules={{
            required: "La cantidad de cuotas es obligatoria",
            min: { value: 1, message: "Debe ser al menos 1 cuota" },
            max: { value: 120, message: "Máximo 120 cuotas" },
            setValueAs: (v: unknown) => toNumber(v),
          }}
        />

        {/* Cuota Inicial con máscara y validación */}
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
      </div>

      {/* Comentario */}
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

      {/* Controles del paso */}
      <div className="flex items-center justify-between gap-2">
        {/* ← Anterior: no sale del paso si es el primero o si está guardando */}
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
          {/* Guardar → avanza solo si éxito */}
          <button
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
  );
};

export default InfoProductoFormulario;
