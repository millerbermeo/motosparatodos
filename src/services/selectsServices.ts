// src/services/marcasService.ts
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "./axiosInstance";
import type { CanalesResponse, FinancierasResponse, Marca, MarcasResponse, PreguntasResponse, Seguro, SegurosResponse } from "../shared/types/selects";

/* ========= Query Keys ========= */
export const QK = {
    marcas: ["marcas_select"] as const,
    canales: ["canales_select"] as const,
    preguntas: ["preguntas_select"] as const,
    financieras: ["financieras_select"] as const,
    seguros: ["seguros_select"] as const, 
};

/* ========= Hook: listar marcas ========= */
export const useMarcas = () =>
    useQuery<Marca[], AxiosError>({
        queryKey: QK.marcas,
        queryFn: async ({ signal }) => {
            const { data } = await api.get<MarcasResponse>("/list_marcas.php", { signal });

            if (!data?.success || !Array.isArray(data.marcas)) {
                throw new Error("Respuesta inválida del servidor al listar marcas");
            }

            return data.marcas.map((m) => ({
                id: Number(m.id),
                marca: m.marca.trim(),
                fecha: m.fecha,
            }));
        },
        staleTime: 60_000,
        retry: 1,
    });

/* ========= Hook: listar canales ========= */
export const useCanales = () =>
    useQuery<string[], AxiosError>({
        queryKey: QK.canales,
        queryFn: async ({ signal }) => {
            const { data } = await api.get<CanalesResponse>("/list_canal.php", { signal });

            if (!data?.success || !Array.isArray(data.canales)) {
                throw new Error("Respuesta inválida del servidor al listar canales");
            }

            return data.canales.map((c) => c.trim());
        },
        staleTime: 60_000,
        retry: 1,
    });


/* ========= Hook: listar preguntas ========= */
export const usePreguntas = () =>
    useQuery<string[], AxiosError>({
        queryKey: QK.preguntas,
        queryFn: async ({ signal }) => {
            const { data } = await api.get<PreguntasResponse>("/list_preguntas.php", { signal });
            if (!data?.success || !Array.isArray(data.preguntas)) {
                throw new Error("Respuesta inválida del servidor al listar preguntas");
            }
            return data.preguntas.map((p) => p.trim());
        },
        staleTime: 60_000,
        retry: 1,
    });


export const useFinancieras = () =>
    useQuery<string[], AxiosError>({
        queryKey: QK.financieras,
        queryFn: async ({ signal }) => {
            const { data } = await api.get<FinancierasResponse>("/list_financieras.php", { signal });

            if (!data?.success || !Array.isArray(data.financieras)) {
                throw new Error("Respuesta inválida del servidor al listar financieras");
            }

            return data.financieras.map((f) => f.trim());
        },
        staleTime: 60_000,
        retry: 1,
    });



    /* ========= Hook: listar seguros ========= */
export const useSeguros = () =>
  useQuery<Seguro[], AxiosError>({
    queryKey: QK.seguros,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<SegurosResponse>("/list_seguros.php", { signal });      

      return data.seguros.map((s) => ({
        id: Number(s.id),
        nombre: s.nombre,
        tipo: s.tipo,
        valor: Number(s.valor),
      }));
    },
    staleTime: 60_000,
    retry: 1,
  });