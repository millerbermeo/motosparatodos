import React, { useState } from "react";
import { useSubirFirma } from "../../../services/documentosServices"; // ajusta la ruta a donde tengas tu hook

const SolicitudFormulario: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  // Hook de mutación
  const subirFirma = useSubirFirma();

  const handleUpload = () => {
    if (!file) {
      alert("Por favor selecciona un archivo primero");
      return;
    }

    // Aquí reemplaza con el código de crédito real que tengas en tu flujo
    subirFirma.mutate({
      codigo_credito: "30QLKp6",
      firma: file,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Botón para descargar PDF */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">1. Descargar solicitud</h2>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            const link = document.createElement("a");
            link.href = "/solicitud.pdf";
            link.download = "solicitud.pdf";
            link.click();
          }}
        >
          📥 Descargar solicitud
        </button>
      </div>

      {/* Input para subir imagen de firmas */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">2. Adjuntar firmas</h2>
        <input
          type="file"
          accept="application/pdf,image/*"
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded cursor-pointer p-2 bg-blue-50"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />

        <button
          onClick={handleUpload}
          disabled={subirFirma.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {subirFirma.isPending ? "Subiendo..." : "📤 Subir firma"}
        </button>
      </div>
    </div>
  );
};

export default SolicitudFormulario;
