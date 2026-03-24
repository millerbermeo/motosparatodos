import Swal from "sweetalert2";

export const alert = {
  warn: (title: string, text: string) =>
    Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonText: "Entendido",
    }),

  success: (title: string, text: string) =>
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "OK",
    }),

  error: (title: string, text: string) =>
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "Cerrar",
    }),

  info: (title: string, text: string) =>
    Swal.fire({
      icon: "info",
      title,
      text,
      confirmButtonText: "OK",
    }),
};