// src/utils/confirmDelete.ts
import Swal from "sweetalert2";

type ConfirmDeleteOpts = {
  confirmButtonColor?: string;
  cancelButtonColor?: string;
};

// Diálogo de confirmación de borrado, idéntico al repetido en cada Tabla* con delete.
export const confirmDelete = async (
  html: string,
  title = "Eliminar",
  opts?: ConfirmDeleteOpts
): Promise<boolean> => {
  const res = await Swal.fire({
    icon: "warning",
    title,
    html,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: opts?.confirmButtonColor ?? "#ef4444",
    cancelButtonColor: opts?.cancelButtonColor,
  });
  return res.isConfirmed;
};
