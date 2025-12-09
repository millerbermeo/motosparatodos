/* ===== TIPOS ===== */
export interface Empresa {
  id: number;
  nombre_empresa: string;
  nit_empresa: string;
  correo_garantias: string;
  telefono_garantias: string;
  correo_siniestros: string;
  telefono_siniestros: string;
  direccion_siniestros: string;
  slogan_empresa?: string | null;
  sitio_web?: string | null;
  imagen?: any; // ruta/filename que guarda el backend
}

export type NewEmpresa = Omit<Empresa, "id" | "imagen"> & { imagen?: File | null };

export interface EmpresasResponse {
  empresas: Empresa[];
}

export interface ServerError {
  message: string | string[];
}

export interface EmpresaRes {
  id: string;
  nombre_empresa: string;
}

export interface EmpresaSelect {
  success: boolean;
  puntos: EmpresaRes;
}


// Para el SELECT
export interface EmpresaOption {
  id: number;
  nombre: string;
}

// Lo que realmente devuelve /empresas_id.php
export interface EmpresasSelectResponse {
  success: boolean;
  puntos: { id: string; nombre_empresa: string }[];
}

export interface EmpresaIdResponse {
  success: boolean;
  empresa: Empresa | null;
}
