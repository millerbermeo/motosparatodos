// store/modalStore.ts
import { create } from "zustand";
import type { ReactNode } from "react";

type ModalSize =
  | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full"
  | { width?: string; height?: string; maxHeight?: string }; // clases Tailwind personalizadas

type ModalPosition = "center" | "top" | "bottom";

interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  open: (
    content: ReactNode,
    title?: string,
    options?: { size?: ModalSize; position?: ModalPosition }
  ) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: undefined,
  content: undefined,
  size: "lg",
  position: "center",
  open: (content, title, options) =>
    set({
      isOpen: true,
      content,
      title,
      size: options?.size ?? "lg",
      position: options?.position ?? "center",
    }),
  close: () => set({ isOpen: false }),
}));
