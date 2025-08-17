import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { SubdistribucionesResponseRaw } from "../shared/types/distribucion";


export const useSubDistribucion = () => {
  return useQuery<string[]>({
    queryKey: ["subdistribuciones"],
    queryFn: async () => {
      const { data } = await api.get<SubdistribucionesResponseRaw>("/list_subdistribucion.php");
      return data.Subdistribuciones; // string[]
    },
  });
};