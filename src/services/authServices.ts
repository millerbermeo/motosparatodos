import { useMutation } from "@tanstack/react-query";
import { api } from "./axiosInstance";

interface LoginRequest {
  username: string;
  password: string;
}

// El back devuelve csrf_token y user_id
interface LoginResponse {
  csrf_token: string;
  user_id: number;
}


export const loginRequest = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const { data } = await api.post<LoginResponse>("/auth_token.php", credentials);

    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Error de conexión");
  }
};

const useLogin = () => {
  const mutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      console.log("Login OK", data);
      // Si necesitas también guardar el user_id:
      // localStorage.setItem("user_id", String(data.user_id));
    },
    onError: (error: any) => {
      console.error("Error al hacer login:", error.message);
    },
  });

  return mutation;
};

export default useLogin;
