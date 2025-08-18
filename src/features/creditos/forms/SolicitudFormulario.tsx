import React from 'react'

const SolicitudFormulario: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Botón para descargar PDF */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">1. Descargar solicitud</h2>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            // Aquí puedes reemplazar con la URL real del PDF
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
          accept="image/*"
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded cursor-pointer p-2 bg-blue-50"
        />
      </div>
    </div>
  )
}

export default SolicitudFormulario
