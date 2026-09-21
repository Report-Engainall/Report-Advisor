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
  if (loading) return <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 w-full"/>)}</div>;
  if (!data || data.length === 0) return <div className="p-12 text-center text-xs font-semibold text-ink-400">{emptyMessage}</div>;

  return (
    <div className="ag-data-table data-table-shell overflow-auto rounded-[12px]">
      <table className="w-full min-w-[760px] border-separate border-spacing-0">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key} className={'sticky top-0 z-10 border-b border-ink-200 bg-ink-50/95 px-4 py-2.5 text-[10px] font-black tracking-wide text-ink-500 backdrop-blur ' + (col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right')} style={{ width: col.width }}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const record = row as Record<string, unknown>;
            return <tr key={typeof record.id === 'string' || typeof record.id === 'number' ? String(record.id) : index} onClick={() => onRowClick?.(row)} className={'group border-b border-ink-100/90 bg-white transition-colors last:border-b-0 ' + (onRowClick ? 'cursor-pointer hover:bg-primary-50/45 focus-within:bg-primary-50/45' : 'hover:bg-ink-50/55')}>
              {columns.map(col => <td key={col.key} className={'border-b border-ink-100/80 px-4 py-3 text-xs font-medium text-ink-700 group-last:border-b-0 ' + (col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right') + ' ' + (col.className ?? '')}>{col.render ? col.render(row) : record[col.key] as ReactNode}</td>)}
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
