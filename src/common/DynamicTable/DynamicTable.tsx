import { useState, useMemo } from "react";

// ============================================
// 📦 Type Definitions
// ============================================

export type ColumnAlignment = "left" | "center" | "right";

export interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Accessor function or key path to get the value from data */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom render function for cell content */
  render?: (row: T, index: number) => React.ReactNode;
  /** Column alignment */
  align?: ColumnAlignment;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom width (e.g., "200px", "20%", "auto") */
  width?: string;
  /** Hide column on mobile */
  hideOnMobile?: boolean;
}

export interface DynamicTableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column configuration */
  columns: Column<T>[];
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Callback when row selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Enable pagination */
  pagination?: boolean;
  /** Items per page (default: 10) */
  pageSize?: number;
  /** Enable search/filter */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Custom search function */
  onSearch?: (query: string, data: T[]) => T[];
  /** Row actions (edit, delete, etc.) */
  actions?: {
    label: string;
    onClick: (row: T, index: number) => void;
    icon?: React.ReactNode;
    variant?: "primary" | "danger" | "secondary";
  }[];
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom row key extractor */
  getRowKey?: (row: T, index: number) => string | number;
  /** Custom row className */
  rowClassName?: (row: T, index: number) => string;
  /** Enable hover effect on rows */
  hoverable?: boolean;
  /** Enable striped rows */
  striped?: boolean;
  /** Compact mode (smaller padding) */
  compact?: boolean;
}

// ============================================
// 🎨 Component
// ============================================

const DynamicTable = <T extends Record<string, unknown>>({
  data,
  columns,
  selectable = false,
  onSelectionChange,
  pagination = false,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  actions,
  emptyMessage = "No data available",
  loading = false,
  getRowKey,
  rowClassName,
  hoverable = true,
  striped = false,
  compact = false,
}: DynamicTableProps<T>) => {
  // ============================================
  // 📊 State Management
  // ============================================
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // ============================================
  // 🔍 Search & Filter Logic
  // ============================================
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    if (onSearch) {
      return onSearch(searchQuery, data);
    }

    // Default search: search all string values
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery, onSearch]);

  // ============================================
  // 🔀 Sorting Logic
  // ============================================
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key);
      if (!column) return 0;

      let aValue: unknown;
      let bValue: unknown;

      if (typeof column.accessor === "function") {
        aValue = column.accessor(a);
        bValue = column.accessor(b);
      } else if (column.accessor) {
        aValue = a[column.accessor];
        bValue = b[column.accessor];
      } else {
        return 0;
      }

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig, columns]);

  // ============================================
  // 📄 Pagination Logic
  // ============================================
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // ============================================
  // 🎯 Event Handlers
  // ============================================
  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = paginatedData.map((row, index) =>
        getRowKey ? getRowKey(row, index) : index
      );
      setSelectedRows(new Set(allKeys));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowKey: string | number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowKey);
    } else {
      newSelected.delete(rowKey);
    }
    setSelectedRows(newSelected);

    if (onSelectionChange) {
      const selectedData = data.filter((row, index) =>
        newSelected.has(getRowKey ? getRowKey(row, index) : index)
      );
      onSelectionChange(selectedData);
    }
  };

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.render) {
      return column.render(row, data.indexOf(row));
    }

    if (typeof column.accessor === "function") {
      return String(column.accessor(row));
    }

    if (column.accessor) {
      return String(row[column.accessor] ?? "");
    }

    return "";
  };

  const getAlignmentClass = (align?: ColumnAlignment) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getActionButtonClass = (variant?: string) => {
    switch (variant) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "secondary":
        return "bg-gray-500 hover:bg-gray-600 text-white";
      default:
        return "bg-blue-500 hover:bg-blue-600 text-white";
    }
  };

  // ============================================
  // 🎨 Render
  // ============================================
  return (
    <div className="w-full">
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedRows.size === paginatedData.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 ${
                    compact ? "py-2" : "py-3"
                  } text-xs font-semibold text-gray-700 uppercase tracking-wider ${getAlignmentClass(
                    column.align
                  )} ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      {column.label}
                      <span className="text-gray-400">
                        {sortConfig?.key === column.key
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th
                  className={`px-4 ${
                    compact ? "py-2" : "py-3"
                  } text-xs font-semibold text-gray-700 uppercase tracking-wider text-center`}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowKey = getRowKey ? getRowKey(row, index) : index;
                const isSelected = selectedRows.has(rowKey);
                const customClass = rowClassName
                  ? rowClassName(row, index)
                  : "";

                return (
                  <tr
                    key={rowKey}
                    className={`
                      ${striped && index % 2 === 0 ? "bg-gray-50" : ""}
                      ${hoverable ? "hover:bg-gray-100" : ""}
                      ${isSelected ? "bg-blue-50" : ""}
                      ${customClass}
                      transition-colors
                    `}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(rowKey, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 ${
                          compact ? "py-2" : "py-3"
                        } text-sm text-gray-900 ${getAlignmentClass(
                          column.align
                        )} ${
                          column.hideOnMobile ? "hidden md:table-cell" : ""
                        }`}
                      >
                        {getCellValue(row, column)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td
                        className={`px-4 ${
                          compact ? "py-2" : "py-3"
                        } text-sm text-center`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row, index)}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${getActionButtonClass(
                                action.variant
                              )}`}
                              title={action.label}
                            >
                              {action.icon ? (
                                <span className="flex items-center gap-1">
                                  {action.icon}
                                  <span className="hidden sm:inline">
                                    {action.label}
                                  </span>
                                </span>
                              ) : (
                                action.label
                              )}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and adjacent pages
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          currentPage === page
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
