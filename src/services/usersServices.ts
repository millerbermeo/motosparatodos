import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import type { NewUsuario, Usuario, UsuariosResponse } from "../shared/types/users";
import type { ServerError } from "../shared/types/server";
import { useModalStore } from "../store/modalStore";
import Swal from "sweetalert2";




export const useUsuarios = () => {
  return useQuery<Usuario[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<UsuariosResponse>('/list_users.php');
      return data.usuarios;
    },
  });
};

export const useUsuarioById = (id: string) => {
  return useQuery<Usuario>({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get<Usuario>(`/list_users.php/${id}`);
      return data;
    },
    enabled: Boolean(id), // solo ejecuta si hay un id válido
  });
};


export const useRegisterUsuario = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (usuario: NewUsuario) => {
      const { data } = await api.post("/create_user.php", usuario);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      closeModal(); // 🔒 cierra modal
      Swal.fire({
        icon: "success",
        title: "Usuario registrado",
        text: "El usuario fue creado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al registrar usuario";
      const arr = Array.isArray(raw) ? raw : [raw];

      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"), // muestra todos los errores en varias líneas
      });
    },
  });
};

export const useUpdateUsuario = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (data: Usuario) => {
      const res = await api.put("/create_user.php", data);
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      closeModal(); // 🔒 cierra modal
      Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        text: "Los cambios se guardaron correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar usuario";
      const arr = Array.isArray(raw) ? raw : [raw];

      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
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