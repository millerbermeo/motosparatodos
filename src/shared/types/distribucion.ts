/* ===== TIPOS ===== */
export interface Subdistribucion {
  id: number;
  nombre: string;
}

export interface SubdistribucionesResponseRaw {
  success: boolean;
  Subdistribuciones: string[];
}