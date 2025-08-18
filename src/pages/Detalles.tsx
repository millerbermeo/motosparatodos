import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import DetalleCotizacion from '../features/cotizaciones/DetalleCotizacion'

const Detalles: React.FC = () => {
  const { id } = useParams<{ id: string }>()  // 👈 toma el id de la URL

  if (!id) {
    // Si no hay id, redirige (puedes llevarlo a 403 o a cotizaciones)
    return <Navigate to="/cotizaciones" replace />
  }

  return <DetalleCotizacion />  // 👈 pasa el id como prop si lo necesitas
}

export default Detalles
