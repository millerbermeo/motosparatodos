// src/shared/components/datatable/DataTable.tsx
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getPaginationItems } from "./paginationRange";
import type {
  DataTableColumn,
  PaginationConfig,
  SelectionConfig,
  SortConfig,
} from "./types";

const btnBase =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
// Mismo azul de marca que el thead (bg-[#3498DB]); index.css lo atenúa en modo oscuro.
const btnActive = `${btnBase} bg-[#3498DB] text-white`;
const btnEllipsis =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const alignClass = (align?: "left" | "right" | "center") =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "";

function PaginationFooter({
  pagination,
  isLoading,
}: {
  pagination: PaginationConfig;
  isLoading?: boolean;
}) {
  const {
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions,
    siblingCount,
    boundaryCount,
    variant = "numbered",
    activeButtonClassName,
    hideControls,
    summaryOverride,
    isFetching,
  } = pagination;

  const goPrev = () => onPageChange(Math.max(1, page - 1));
  const goNext = () => onPageChange(Math.min(totalPages, page + 1));
  const goTo = (p: number) => onPageChange(Math.min(Math.max(1, p), totalPages));

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const defaultSummary =
    variant === "simple" ? (
      <>Página {page} de {totalPages} — Total: {totalItems}</>
    ) : (
      <>Mostrando {start}–{end} de {totalItems}</>
    );

  // Único selector de "cantidad de registros": vive acá, junto al resumen.
  const summaryBlock = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-base-content/50">{summaryOverride ?? defaultSummary}</span>
      {(isFetching ?? isLoading) && (
        <span className="loading loading-spinner loading-xs" aria-hidden="true" />
      )}
      {onPageSizeChange && (
        <span className="flex items-center gap-1.5">
          <label className="text-xs opacity-70 whitespace-nowrap">Filas:</label>
          <select
            className="select select-bordered select-xs w-16"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {(pageSizeOptions ?? [10, 20, 50]).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
      )}
    </div>
  );

  if (variant === "simple") {
    return (
      <div className="flex flex-wrap justify-between items-center gap-3 p-4">
        {summaryBlock}
        <div className="flex items-center gap-2">
          <button className={btnGhost} onClick={goPrev} disabled={page === 1} aria-label="Página anterior">
            «
          </button>
          <button className={btnGhost} onClick={goNext} disabled={page === totalPages} aria-label="Página siguiente">
            »
          </button>
        </div>
      </div>
    );
  }

  const items = getPaginationItems(page, totalPages, siblingCount, boundaryCount);

  return (
    <div className="flex items-center justify-between px-4 pb-4 pt-2 flex-wrap gap-3">
      {summaryBlock}

      {!hideControls && (
        <div className="flex items-center gap-2 flex-wrap">
          <button className={btnGhost} onClick={goPrev} disabled={page === 1} aria-label="Página anterior">
            «
          </button>

          {items.map((it, idx) =>
            it === "..." ? (
              <span key={`e-${idx}`} className={btnEllipsis}>
                …
              </span>
            ) : (
              <button
                key={`p-${it}`}
                className={it === page ? (activeButtonClassName ?? btnActive) : btnGhost}
                onClick={() => goTo(Number(it))}
              >
                {it}
              </button>
            )
          )}

          <button className={btnGhost} onClick={goNext} disabled={page === totalPages} aria-label="Página siguiente">
            »
          </button>
        </div>
      )}
    </div>
  );
}

export type DataTableProps<T> = {
  title?: React.ReactNode;
  toolbar?: React.ReactNode;
  filters?: React.ReactNode;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  rowClassName?: (row: T) => string;
  tableClassName?: string;
  footer?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
  selection?: SelectionConfig<T>;
  sort?: SortConfig;
  pagination?: PaginationConfig;
  /** "plain" reproduce el thead no-sticky/sin mayúsculas que usa TablaCumpleanos. */
  theadVariant?: "styled" | "plain";
};

function DataTableInner<T>({
  title,
  toolbar,
  filters,
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  errorMessage = "Error al cargar los datos",
  emptyMessage = "Sin resultados",
  rowClassName,
  tableClassName,
  footer,
  className,
  onRowClick,
  selection,
  sort,
  pagination,
  theadVariant = "styled",
}: DataTableProps<T>) {
  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        {errorMessage}
      </div>
    );
  }

  const colSpan = columns.length + (selection ? 1 : 0);

  return (
    <div className={`rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl ${className ?? ""}`}>
      {(title || toolbar) && (
        <div className="px-4 pt-4 my-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          {title && (
            <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
              {title}
            </h3>
          )}
          {toolbar && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
              {toolbar}
            </div>
          )}
        </div>
      )}

      {filters && <div className="px-4 pb-3">{filters}</div>}

      <div className="relative overflow-x-auto max-w-full px-4">
        <table
          className={`table table-zebra ${theadVariant === "styled" ? "table-pin-rows" : ""} ${tableClassName ?? ""}`}
        >
          <thead
            className={
              theadVariant === "plain"
                ? "bg-[#3498DB] text-white"
                : "sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-backdrop-filter:backdrop-blur-md"
            }
          >
            <tr
              className={
                theadVariant === "plain"
                  ? ""
                  : "[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]"
              }
            >
              {selection && (
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={rows.length > 0 && selection.selectedKeys.size === rows.length}
                    onChange={(e) => selection.onToggleAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 ${alignClass(col.align)} ${col.headerClassName ?? ""}`}
                >
                  {col.sortable && sort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => sort.onSortChange(col.key)}
                    >
                      {col.header}
                      {sort.sortKey === col.key &&
                        (sort.direction === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-base-200/40">
            {rows.map((row, idx) => {
              const key = rowKey(row, idx);
              const isSelected = selection?.selectedKeys.has(key);
              return (
                <tr
                  key={key}
                  className={`transition-colors ${onRowClick ? "cursor-pointer" : ""} ${
                    rowClassName?.(row) ?? ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selection && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={!!isSelected}
                        onChange={() => selection.onToggleRow(key, row)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`${alignClass(col.align)} ${col.className ?? ""}`}>
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              );
            })}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="text-center text-base-content/50 py-10">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {footer}

      {pagination && <PaginationFooter pagination={pagination} isLoading={isLoading} />}
    </div>
  );
}

export const DataTable = DataTableInner as <T>(
  props: DataTableProps<T>
) => React.ReactElement;
