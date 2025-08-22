import { create } from 'zustand';

type WizardState = {
  stepIds: string[];
  activeId?: string;

  // derivados
  idx: number;
  isFirst: boolean;
  isLast: boolean;

  // acciones
  setSteps: (ids: string[], initialId?: string) => void;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
};

export const useWizardStore = create<WizardState>((set, get) => ({
  stepIds: [],
  activeId: undefined,
  idx: 0,
  isFirst: true,
  isLast: true,

  setSteps: (ids, initialId) => {
    const safeIds = Array.isArray(ids) ? ids : [];
    const firstId = safeIds[0];
    const activeId = initialId ?? firstId;

    const idx = Math.max(0, safeIds.findIndex(id => id === activeId));
    const isFirst = idx <= 0;
    const isLast = idx >= safeIds.length - 1 || safeIds.length === 0;

    set({ stepIds: safeIds, activeId, idx, isFirst, isLast });
  },

  goTo: (i) => {
    const { stepIds } = get();
    if (i < 0 || i >= stepIds.length) return;
    const activeId = stepIds[i];
    const idx = i;
    const isFirst = idx <= 0;
    const isLast = idx >= stepIds.length - 1;
    set({ activeId, idx, isFirst, isLast });
  },

  next: () => {
    const { idx, stepIds } = get();
    const n = Math.min(idx + 1, stepIds.length - 1);
    get().goTo(n);
  },

  prev: () => {
    const { idx } = get();
    const p = Math.max(idx - 1, 0);
    get().goTo(p);
  },
}));
