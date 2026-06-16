import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type NotificacionesState = {
  /** IDs de notificaciones ya vistas por el usuario */
  seenIds: number[];

  /**
   * Sincroniza el estado con el listado actual (normalmente las últimas 10).
   * Descarta IDs vistos que ya no están en el listado para no acumular
   * referencias obsoletas en el almacenamiento persistente.
   */
  sync: (currentIds: number[]) => void;

  /** Marca como vistas todas las notificaciones visibles actualmente. */
  markSeen: (currentIds: number[]) => void;

  /** Cantidad de notificaciones del listado actual que aún no se han visto. */
  unreadCount: (currentIds: number[]) => number;
};

export const useNotificacionesStore = create<NotificacionesState>()(
  persist(
    (set, get) => ({
      seenIds: [],

      sync: (currentIds) =>
        set((state) => {
          const visibles = new Set(currentIds);
          const pruned = state.seenIds.filter((id) => visibles.has(id));
          // Solo actualizar si realmente cambió (evita renders innecesarios)
          if (pruned.length === state.seenIds.length) return state;
          return { seenIds: pruned };
        }),

      markSeen: (currentIds) =>
        set((state) => {
          const merged = new Set(state.seenIds);
          currentIds.forEach((id) => merged.add(id));
          return { seenIds: Array.from(merged) };
        }),

      unreadCount: (currentIds) => {
        const seen = new Set(get().seenIds);
        return currentIds.reduce(
          (acc, id) => (seen.has(id) ? acc : acc + 1),
          0
        );
      },
    }),
    {
      name: "notificaciones-vistas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
