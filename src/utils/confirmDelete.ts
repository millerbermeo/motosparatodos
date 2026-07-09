// src/utils/confirmDelete.ts
import Swal from "sweetalert2";

// Diálogo de confirmación de borrado, idéntico al repetido en cada Tabla* con delete.
export const confirmDelete = async (
  html: string,
  title = "Eliminar"
): Promise<boolean> => {
  const res = await Swal.fire({
    icon: "warning",
    title,
    html,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#ef4444",
  });
  return res.isConfirmed;
};
