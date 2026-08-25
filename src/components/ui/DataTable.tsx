import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: 'right' | 'left' | 'center';
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T extends object>({ columns, data, loading, emptyMessage = 'لا توجد بيانات', onRowClick }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="p-5">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="p-10 text-center text-sm text-ink-400">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider whitespace-nowrap ${
                  col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right'
                }`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const rowRecord = row as Record<string, unknown>;
            return (
              <tr
                key={typeof rowRecord.id === 'string' || typeof rowRecord.id === 'number' ? String(rowRecord.id) : i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-ink-50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-ink-50' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-ink-700 whitespace-nowrap ${
                      col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : rowRecord[col.key] as ReactNode}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
