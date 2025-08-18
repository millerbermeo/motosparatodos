
/* ========= Tipos ========= */
export interface MarcaServer {
    id: string;          // viene como string
    marca: string;
    fecha: string;       // "YYYY-MM-DD HH:mm:ss"
}

export interface MarcasResponse {
    success: boolean;
    count: number;
    marcas: MarcaServer[];
}

export type Marca = {
    id: number;
    marca: string;
    fecha: string;       // mantengo string; si prefieres Date, parsea aquí
};

export interface CanalesResponse {
    success: boolean;
    canales: string[];
}

export interface PreguntasResponse {
    success: boolean;
    preguntas: string[];
}


/* ========= Tipos ========= */
export interface FinancierasResponse {
  success: boolean;
  financieras: string[];
}



/* ========= Tipos: Seguros ========= */
export interface SeguroServer {
  id: string;                // viene como string
  nombre: string;
  tipo: string;
  valor: string | number;    // en el JSON puede venir como string
}

export interface SegurosResponse {
  success: boolean;
  count?: number;
  seguros: SeguroServer[];
}

export type Seguro = {
  id: number;
  nombre: string;
  tipo: string;
  valor: number;             // lo normalizamos a número
};