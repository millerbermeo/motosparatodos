import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { RolesResponse } from "../shared/types/roles";

export const useRoles = () => {
  return useQuery<RolesResponse>({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await api.get<RolesResponse>("/roles.php");
      return data;
    },
  });
};
