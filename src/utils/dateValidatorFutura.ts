export const dateNotTodayOrFuture = (val: unknown): true | string => {
  const v = typeof val === "string" ? val : "";
  if (!v) return true;

  const exp = new Date(`${v}T00:00:00`);
  exp.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (+exp === +today) return "No puede ser hoy";
  if (exp > today) return "No puede ser una fecha futura";

  return true;
};