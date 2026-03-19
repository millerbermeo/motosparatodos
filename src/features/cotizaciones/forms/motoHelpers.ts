type Moto = {
  linea: string;
  precio_base: number;
  modelo?: string;
};

type SelectOption = {
  value: string;
  label: string;
};

export const buildMotoOptions = (motos: Moto[] = []): SelectOption[] => {
  return motos.map((m, index) => ({
    value: String(index),
    label: `${m.linea} - ${Number(m.precio_base).toLocaleString("es-CO")} COP - Modelo ${m.modelo ?? ""}`,
  }));
};