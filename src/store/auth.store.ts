// src/store/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, LoginResponse } from "../shared/types/auth";
import { normalizeModules } from "../utils/normalizeModules";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
};

type AuthActions = {
  setFromLogin: (payload: LoginResponse) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasModule: (module: string) => boolean;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setFromLogin: (data) => {
        const modules = normalizeModules(data.modules);
        const token = data.token ?? null;

        const user: AuthUser = {
          user_id: data.user_id,
          username: data.username,
          name: data.name,
          rol: data.rol,
          modules,
          telefono: data.telefono
        };

        set({ user, token });
      },

      logout: () => set({ user: null, token: null }),

      hasRole: (role) => get().user?.rol === role,

      hasModule: (module) => !!get().user?.modules?.includes(module),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
