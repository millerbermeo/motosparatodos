// src/store/loader.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LoaderState = {
  isLoading: boolean;
  // ID del timeout activo (si se usó duración)
  _timerId?: ReturnType<typeof setTimeout> | null;
  // Mostrar el loader. Si pasas ms, se auto-oculta.
  show: (ms?: number) => void;
  // Ocultar el loader inmediatamente.
  hide: () => void;
  // Helper: muestra durante la ejecución de una promesa/función async.
  withLoader: <T>(fn: () => Promise<T>) => Promise<T>;
};

export const useLoaderStore = create<LoaderState>()(
  devtools((set, get) => ({
    isLoading: false,
    _timerId: null,

    show: (ms?: number) => {
      // Limpia cualquier timer previo
      const current = get()._timerId;
      if (current) clearTimeout(current);

      // Activa loading
      set({ isLoading: true, _timerId: null });

      // Si hay duración, programa autocierre
      if (typeof ms === 'number' && ms > 0) {
        const id = setTimeout(() => {
          // Solo cierra si sigue activo
          if (get().isLoading) set({ isLoading: false, _timerId: null });
        }, ms);
        set({ _timerId: id });
      }
    },

    hide: () => {
      const current = get()._timerId;
      if (current) clearTimeout(current);
      set({ isLoading: false, _timerId: null });
    },

    withLoader: async <T,>(fn: () => Promise<T>) => {
      const { show, hide } = get();
      show();
      try {
        const res = await fn();
        return res;
      } finally {
        hide();
      }
    },
  }))
);
