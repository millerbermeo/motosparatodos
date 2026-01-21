import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import type { NewUsuario, Usuario } from "../shared/types/users";
import type { ServerError } from "../shared/types/server";
import { useModalStore } from "../store/modalStore";
import Swal from "sweetalert2";

// ====== LISTADO con filtros + paginación ======
export type UserFilters = {
  q?: string;
  rol?: string;
  state?: "" | "1" | "0";
};

export interface UsersListResponse {
  success: boolean;
  data: Usuario[];
  roles: string[];
  pagination: {
    total: number | string;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

const clean = (v?: string) => {
  const t = (v ?? "").trim();
  return t.length ? t : undefined;
};

// ✅ ahora useUsuarios recibe page/perPage/filters
export const useUsuarios = (page: number, perPage: number, filters: UserFilters) => {
  return useQuery<UsersListResponse>({
    queryKey: ["users", { page, perPage, ...filters }],
    queryFn: async () => {
      const params: Record<string, any> = { page, per_page: perPage };

      if (clean(filters.q)) params.q = clean(filters.q);
      if (clean(filters.rol)) params.rol = clean(filters.rol);
      if (filters.state !== undefined && filters.state !== "") params.state = filters.state;

      const { data } = await api.get<UsersListResponse>("/list_users.php", { params });
      return data;
    },
    staleTime: 10_000,
  });
};

// ====== BY ID (si lo sigues usando) ======
export const useUsuarioById = (id: string) => {
  return useQuery<Usuario>({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await api.get<Usuario>("/list_users.php", { params: { id } });
      return data;
    },
    enabled: Boolean(id),
  });
};

// ====== CREATE ======
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
      closeModal();
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
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// ====== UPDATE ======
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
      closeModal();
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
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// ====== TOGGLE STATE ======
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
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al cambiar estado del usuario";
      const arr = Array.isArray(raw) ? raw : [raw];
      arr.forEach((m) => console.error(m));
    },
  });
};
