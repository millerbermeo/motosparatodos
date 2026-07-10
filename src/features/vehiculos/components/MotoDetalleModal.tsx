// src/features/vehiculos/components/MotoDetalleModal.tsx
import React from "react";
import { ImageWithFallback } from "../../../shared/components/ImageWithFallback";

type Props = {
  moto: any;
  /** URL ya precargada (o null si no tiene/falló) — se resuelve antes de abrir el modal. */
  imagenSrc: string | null;
};

const Dato: React.FC<{ label: string; value: React.ReactNode; wide?: boolean }> = ({ label, value, wide }) => (
  <div className={wide ? "col-span-2" : ""}>
    <dt className="text-xs font-medium uppercase tracking-wide text-base-content/50">{label}</dt>
    <dd className="mt-0.5 text-sm font-semibold text-base-content">{value}</dd>
  </div>
);

/** Vista de detalle de una moto: imagen + info, usada al hacer click en la miniatura de la tabla. */
export const MotoDetalleModal: React.FC<Props> = ({ moto: m, imagenSrc }) => {
  const mostrando = Number(m.estado_moto) === 1;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="shrink-0 md:w-2/5">
        <ImageWithFallback
          src={imagenSrc}
          alt={`${m.marca ?? ""} ${m.linea ?? ""}`}
          className="aspect-4/3 w-full rounded-xl border border-base-300 object-cover"
          iconSize={40}
        />
      </div>

      <div className="min-w-0 flex-1">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <Dato label="Marca" value={m.marca || "-"} />
          <Dato label="Línea" value={m.linea || "-"} />
          <Dato label="Modelo" value={m.modelo || "-"} />
          <Dato label="Cilindraje" value={m.cilindraje != null ? `${m.cilindraje} CC` : "-"} />
          <Dato label="Tipo" value={m.tipo_moto || "-"} />
          <Dato
            label="Estado"
            value={
              <span className={`badge ${m.estado === "Nueva" ? "badge-success" : "badge-warning"}`}>
                {m.estado || "-"}
              </span>
            }
          />
          <Dato label="Empresa" value={m.empresa || "-"} wide />
          <Dato label="Subdistribución" value={m.subdistribucion || "-"} wide />
          <Dato
            label="Precio base"
            value={`${Number(m.precio_base || 0).toLocaleString()} COP`}
          />
          <Dato
            label="Mostrar en catálogo"
            value={
              <span className={`badge ${mostrando ? "badge-success" : "badge-ghost"}`}>
                {mostrando ? "Sí" : "No"}
              </span>
            }
          />
        </dl>

        {m.descrip && (
          <div className="mt-4 border-t border-base-200 pt-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-base-content/50">Descripción</dt>
            <dd className="mt-1 text-sm text-base-content/80">{m.descrip}</dd>
          </div>
        )}
      </div>
    </div>
  );
};
