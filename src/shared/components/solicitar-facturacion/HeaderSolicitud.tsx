import React from "react";
import { ClipboardList } from "lucide-react";

type Props = {
  titulo?: string;
  descripcion?: string;
  tipo?: "contado" | "credito";
};

export const HeaderSolicitud: React.FC<Props> = ({
  titulo = "Solicitud de facturación",
  descripcion = "Diligencia los siguientes campos para generar la solicitud de facturación de esta cotización.",
  tipo = "contado",
}) => {
  const tipoLabel =
    tipo === "credito" ? (
      <span className="text-yellow-300">(Crédito)</span>
    ) : null;

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 bg-[#3498DB] text-white rounded-2xl px-5 py-4 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.01]">
        
        {/* Icono */}
        <div className="shrink-0 bg-white/10 p-3 rounded-xl border border-white/20">
          <ClipboardList className="w-6 h-6" />
        </div>

        {/* Contenido */}
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-lg md:text-xl font-semibold leading-tight">
            {titulo} {tipoLabel}
          </h3>

          <p className="text-xs md:text-sm text-white/90 max-w-xl">
            {descripcion}{" "}
            <span className="text-yellow-300 font-semibold">*</span> son obligatorios.
          </p>
        </div>
      </div>
    </div>
  );
};