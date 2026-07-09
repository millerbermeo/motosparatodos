// src/shared/hooks/useClientPagination.ts
import React from "react";

// Pagina en cliente un array ya cargado (completo o pre-filtrado en servidor).
// Mismo cálculo que tenían TablaMarcas/TablaEmpresas/TablaPuntos/TablaLineasMarcas inline.
export function useClientPagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSizeState] = React.useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = React.useMemo(
    () => items.slice(start, start + pageSize),
    [items, start, pageSize]
  );

  const setPageSize = (n: number) => {
    setPageSizeState(n);
    setPage(1);
  };

  return { page, setPage, pageSize, setPageSize, totalPages, totalItems, pageItems };
}
