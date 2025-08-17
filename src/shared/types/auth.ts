// src/shared/types/auth.ts
export interface LoginResponse {
  user_id: number;
  username: string;
  name: string;
  rol?: string;                 // algunos backends mandan 'rol'
  modules: string[] | string;   // a veces llega como string JSON o CSV
  token?: string;
}

export interface AuthUser {
  user_id: number;
  username: string;
  name: string;
  rol?: string;
  modules: string[];
}