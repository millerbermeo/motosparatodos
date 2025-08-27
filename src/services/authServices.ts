// src/services/authServices.ts
import { useMutation } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { LoginResponse } from "../shared/types/auth";
import { useAuthStore } from "../store/auth.store";

interface LoginRequest {
  username: string;
  password: string;
}

export const loginRequest = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const { data } = await api.post<LoginResponse>("/auth_token.php", credentials);
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Credenciales Incorrectas");
  }
};

const useLogin = () => {
  const setFromLogin = useAuthStore((s) => s.setFromLogin);

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setFromLogin(data); // ✅ persistimos en Zustand
    },
  });
};

export default useLogin;
