import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useToggleUsuarioState } from "../../services/usersServices";

interface Props {
  id: number;
  currentState: 0 | 1;
}

const UsuarioEstadoAlert: React.FC<Props> = ({ id, currentState }) => {
  const [state, setState] = useState<0 | 1>(currentState);
  const toggleState = useToggleUsuarioState();

  useEffect(() => {
    setState(currentState);
  }, [currentState]);

  const handleToggle = () => {
    const newState = state === 1 ? 0 : 1;

    Swal.fire({
      title: "¿Confirmar cambio?",
      text: `El usuario pasará a estado ${newState === 1 ? "Activo" : "Inactivo"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        toggleState.mutate(
          { id, state: newState },
          {
            onSuccess: () => {
              setState(newState);
              Swal.fire("¡Actualizado!", "El estado del usuario fue cambiado.", "success");
            },
            onError: () => {
              Swal.fire("Error", "No se pudo cambiar el estado", "error");
            },
          }
        );
      }
    });
  };

  return (
    <input
      type="checkbox"
      checked={state == 1}
      onChange={handleToggle}
      className="toggle toggle-success toggle-md"
    />
  );
};

export default UsuarioEstadoAlert;
