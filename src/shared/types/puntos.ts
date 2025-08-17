// Tipos que reflejan EXACTAMENTE lo que devuelve el backend (strings)
export interface PuntoAPI {
  id: string;
  empresa_id: string;
  nombre_punto: string;
  telefono: string;
  correo: string;
  direccion: string;
  activo?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  nombre_empresa?: string;
}

export interface PuntosResponse {
  success: boolean;
  count?: number;
  puntos: PuntoAPI[]; // ← el backend devuelve esto
}

// Si quieres seguir usando tus tipos "de app" con números, mantenlos aparte:
export interface Punto {
  id: number;
  empresa_id: number;
  nombre_punto: string;
  telefono: string;
  correo: string;
  direccion: string;
}
export type NewPunto = Omit<Punto, "id">;