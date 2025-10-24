// src/services/cotizacionesServices.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";

type Id = number | string;

/** Trae cotizacion + creditos + solicitar_estado_facturacion en una sola consulta */
export const useCotizacionFullById = (id: Id | undefined) => {
  const parsedId = typeof id === "string" ? id.trim() : id;

  return useQuery<any>({
    queryKey: ["cotizacion-full", parsedId],
    enabled: parsedId !== undefined && parsedId !== null && `${parsedId}` !== "",
    queryFn: async () => {
      const { data } = await api.get<any>("/cotizacion_full.php", {
        params: { id: parsedId },
      });
      return data; // <-- any
    },
    staleTime: 30_000, // opcional
  });
};
