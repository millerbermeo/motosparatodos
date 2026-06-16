import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";

/* =========================
   TYPES
========================= */

export interface Notificacion {
    id: number;
    titulo: string;
    mensaje: string;
    tipo: string;
    modulo: string;
    referencia_id: number | null;
    url: string | null;
    created_at: string;
}

export interface NotificacionesResponse {
    success: boolean;
    data: Notificacion[];
    filters?: {
        tipos: string[];
        modulos: string[];
    };
    pagination?: {
        total: number | string;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

/* =========================
   LISTADO PAGINADO + FILTROS
========================= */

export const useNotificaciones = (
    page: number = 1,
    q?: string,
    tipo?: string,
    modulo?: string
) => {
    return useQuery<NotificacionesResponse>({
        queryKey: ["notificaciones", { page, q, tipo, modulo }],
        queryFn: async () => {
            const { data } = await api.get<NotificacionesResponse>(
                "/listar_notificaciones.php",
                {
                    params: {
                        page,
                        ...(q ? { q } : {}),
                        ...(tipo ? { tipo } : {}),
                        ...(modulo ? { modulo } : {}),
                    },
                }
            );
            return data;
        },
        placeholderData: keepPreviousData,

        staleTime: 30_000,
    });
};

/* =========================
   DETALLE POR ID
========================= */

export const useNotificacionById = (id: number | string | undefined) => {
    const parsedId =
        typeof id === "string" ? id.trim() : id;

    return useQuery<{ success: boolean; data: Notificacion }>({
        queryKey: ["notificacion-id", parsedId],
        enabled: parsedId !== undefined && parsedId !== null && `${parsedId}` !== "",
        queryFn: async () => {
            const { data } = await api.get(
                "/listar_notificaciones.php",
                {
                    params: { id: parsedId },
                }
            );
            return data;
        },
    });
};

/* =========================
   ÚLTIMAS NOTIFICACIONES (TOP 10)
========================= */

export const useUltimasNotificaciones = () => {
    return useQuery<{
        success: boolean;
        data: Notificacion[];
    }>({
        queryKey: ["notificaciones-ultimas"],
        queryFn: async () => {
            const { data } = await api.get(
                "/ultimas_notificaciones.php"
            );
            return data;
        },
        refetchInterval: 5_000, // refresca cada 15s
        refetchIntervalInBackground: true,
        staleTime: 10_000,
    });
};