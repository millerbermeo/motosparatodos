import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import type { NewUsuario, Usuario, UsuariosResponse } from "../shared/types/users";
import type { ServerError } from "../shared/types/server";




export const useUsuarios = () => {
  return useQuery<Usuario[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<UsuariosResponse>('/list_users.php');
      return data.usuarios;
    },
  });
};


export const useRegisterUsuario = () => {

  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (usuario: NewUsuario) => {
      const { data } = await api.post("/create_user.php", usuario);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al registrar usuario";
      const arr = Array.isArray(raw) ? raw : [raw];
      arr.forEach((m) => console.log(m, "error"));
    },
  });
};



export const useUpdateUsuario = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ( data : Usuario) => {

        console.log("actulzaidno",data)
      const res = await api.put("/create_user.php", data);
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar usuario";
      const arr = Array.isArray(raw) ? raw : [raw];
      arr.forEach((m) => console.log(m, "error"));
    },
  });
};


interface UpdateStatePayload {
  id: number;
  state: 0 | 1;
}

export const useToggleUsuarioState = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateStatePayload) => {
      const { data } = await api.put("/state_user.php", payload);
      return data;
    },
    onSuccess: async () => {
      // Refrescamos la lista de usuarios
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al cambiar estado del usuario";
      const arr = Array.isArray(raw) ? raw : [raw];
      arr.forEach((m) => console.error(m));
    },
  });
};