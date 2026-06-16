import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

// Aplica el tema al <html data-theme="..."> (DaisyUI lee este atributo).
const applyTheme = (theme: ThemeMode) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
};

type ThemeState = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light", // estado actual por defecto
      setTheme: (t) => {
        applyTheme(t);
        set({ theme: t });
      },
      toggle: () => {
        const next: ThemeMode = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "theme-mode",
      // Reaplica el tema al rehidratar desde localStorage (al recargar la app)
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? "light");
      },
    }
  )
);

// Aplica el tema lo antes posible (antes del primer render) para evitar parpadeo.
applyTheme(useThemeStore.getState().theme);

// Sincroniza el tema entre pestañas/ventanas abiertas.
// El evento `storage` se dispara en las OTRAS pestañas cuando cambia localStorage.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== "theme-mode" || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue);
      const next: ThemeMode = parsed?.state?.theme === "dark" ? "dark" : "light";
      if (next !== useThemeStore.getState().theme) {
        applyTheme(next);
        useThemeStore.setState({ theme: next });
      }
    } catch {
      /* valor no parseable: ignorar */
    }
  });
}
