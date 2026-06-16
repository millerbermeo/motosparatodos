import Swal, { type SweetAlertIcon } from "sweetalert2";

type AlertOpts = {
  confirmButtonText?: string;
  timer?: number;
  html?: string;
};

type ConfirmOpts = {
  title: string;
  text?: string;
  html?: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  cancelText?: string;
  /** Color del botón confirmar (CSS). */
  confirmColor?: string;
  /** Color del botón cancelar (CSS). */
  cancelColor?: string;
  /** Invierte la posición de los botones (confirmar a la derecha). */
  reverseButtons?: boolean;
};

export const alert = {
  warn: (title: string, text?: string, opts?: AlertOpts) =>
    Swal.fire({
      icon: "warning",
      title,
      text,
      html: opts?.html,
      confirmButtonText: opts?.confirmButtonText ?? "Entendido",
      timer: opts?.timer,
    }),

  success: (title: string, text?: string, opts?: AlertOpts) =>
    Swal.fire({
      icon: "success",
      title,
      text,
      html: opts?.html,
      confirmButtonText: opts?.confirmButtonText ?? "OK",
      timer: opts?.timer,
      showConfirmButton: opts?.timer ? false : true,
    }),

  error: (title: string, text?: string, opts?: AlertOpts) =>
    Swal.fire({
      icon: "error",
      title,
      text,
      html: opts?.html,
      confirmButtonText: opts?.confirmButtonText ?? "Cerrar",
    }),

  info: (title: string, text?: string, opts?: AlertOpts) =>
    Swal.fire({
      icon: "info",
      title,
      text,
      html: opts?.html,
      confirmButtonText: opts?.confirmButtonText ?? "OK",
      timer: opts?.timer,
    }),

  /**
   * Diálogo de confirmación. Devuelve true si el usuario confirma, false si cancela.
   * Uso: if (await alert.confirm({ title, text })) { ... }
   */
  confirm: async (opts: ConfirmOpts): Promise<boolean> => {
    const res = await Swal.fire({
      icon: opts.icon ?? "question",
      title: opts.title,
      text: opts.text,
      html: opts.html,
      showCancelButton: true,
      confirmButtonText: opts.confirmText ?? "Sí, continuar",
      cancelButtonText: opts.cancelText ?? "Cancelar",
      confirmButtonColor: opts.confirmColor ?? "#2BB352",
      cancelButtonColor: opts.cancelColor ?? "#64748b",
      reverseButtons: opts.reverseButtons ?? false,
      focusCancel: true,
    });
    return res.isConfirmed;
  },
};
