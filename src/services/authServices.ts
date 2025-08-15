import { useMutation} from "@tanstack/react-query";
import axios from "axios";
// import type { UseMutationOptions } from '@tanstack/react-query';


interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}


const loginRequest = async (credentials: LoginRequest): Promise<LoginResponse> => {

    
    const baseURL = import.meta.env.VITE_API_URL
  try {
        const { data } = await axios.post<LoginResponse>(
        `${baseURL}/auth_token.php`,
        credentials,
        );
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error de conexión');
  }
};

const useLogin = () => {

    const mutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginRequest,
    onSuccess: (data) => {
        console.log(data)
    },
    onError: (error: any) => {
      console.error("Error al hacer login:", error.message);
    },
  });

  return mutation;
};

export default useLogin;




