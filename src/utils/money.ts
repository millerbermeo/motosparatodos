export const fmtCOP = (v?: number | null) => {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);
};

  // moneyUtils.ts
export const unformatNumber = (
  v: string | number | null | undefined,
  options?: {
    allowDecimals?: boolean;
    maxDecimals?: number;
  }
): string => {
  if (v === null || v === undefined) return "";

  const { allowDecimals = true, maxDecimals = 2 } = options ?? {};
  let str = String(v).trim();

  if (!allowDecimals) {
    return str.replace(/\D+/g, "");
  }

  // deja solo números y coma
  str = str.replace(/[^\d,]/g, "");

  // deja solo la primera coma
  const firstCommaIndex = str.indexOf(",");
  if (firstCommaIndex !== -1) {
    const intPart = str.slice(0, firstCommaIndex).replace(/,/g, "");
    const decPart = str
      .slice(firstCommaIndex + 1)
      .replace(/,/g, "")
      .slice(0, maxDecimals);

    const normalizedInt = intPart === "" ? "0" : intPart;
    return `${normalizedInt},${decPart}`;
  }

  return str;
};

export const formatThousands = (
  value: string,
  options?: {
    allowDecimals?: boolean;
  }
): string => {
  if (!value) return "";

  const { allowDecimals = true } = options ?? {};

  if (!allowDecimals) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const [integer = "", decimal] = value.split(",");
  const normalizedInt = integer === "" ? "0" : integer;
  const formattedInt = normalizedInt.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return decimal !== undefined ? `${formattedInt},${decimal}` : formattedInt;
};

export const toNumberSafe = (
  v: string | number | null | undefined
): number => {
  if (v === null || v === undefined) return 0;

  const raw = unformatNumber(v, { allowDecimals: true, maxDecimals: 2 });
  if (!raw) return 0;

  // "1200,22" -> "1200.22"
  const normalized = raw.replace(",", ".");
  const num = Number(normalized);

  return Number.isNaN(num) ? 0 : num;
};

export const toNumberOrNullMoney = (
  v: string | number | null | undefined
): number | null => {
  if (v === null || v === undefined) return null;

  const raw = unformatNumber(v, { allowDecimals: true, maxDecimals: 2 });
  if (!raw) return null;

  const normalized = raw.replace(",", ".");
  const num = Number(normalized);

  return Number.isNaN(num) ? null : num;
};

/**
 * Por si alguna vez el backend quiere string decimal con punto:
 * "1.200,22" -> "1200.22"
 */
export const toBackendDecimalString = (
  v: string | number | null | undefined
): string => {
  const raw = unformatNumber(v, { allowDecimals: true, maxDecimals: 2 });
  return raw ? raw.replace(",", ".") : "";
};