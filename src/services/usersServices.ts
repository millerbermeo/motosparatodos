import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";

// Obtener lista de usuarios con filtros
export const useUsuarios = () => {


    return useQuery<any[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get<any[]>('/list_users.php');
            return data;
        },
    });
};