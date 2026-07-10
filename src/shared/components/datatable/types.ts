// src/shared/components/datatable/types.ts
import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
};

export type PaginationVariant = "numbered" | "simple";

export type PaginationConfig = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  siblingCount?: number;
  boundaryCount?: number;
  variant?: PaginationVariant;
  activeButtonClassName?: string;
  /** Spinner junto al selector de "Filas"; por defecto usa el `isLoading` general. */
  isFetching?: boolean;
  /** Oculta prev/números/next pero conserva el texto "Mostrando X–Y de Z" (modo detalle). */
  hideControls?: boolean;
  /** Reemplaza el texto "Mostrando X–Y de Z" por contenido custom (p. ej. TablaCreditos). */
  summaryOverride?: React.ReactNode;
};

export type SelectionConfig<T> = {
  selectedKeys: Set<React.Key>;
  onToggleRow: (key: React.Key, row: T) => void;
  onToggleAll: (checked: boolean) => void;
};

export type SortDirection = "asc" | "desc";

export type SortConfig = {
  sortKey: string | null;
  direction: SortDirection;
  onSortChange: (sortKey: string) => void;
};
