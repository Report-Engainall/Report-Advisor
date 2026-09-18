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
    <div className="overflow-x-auto rounded-b-[1.35rem]">
      <table className="w-full min-w-[720px]">

        <thead>
          <tr className="border-b border-ink-100 bg-[#f7faf7] shadow-[inset_0_-1px_0_rgba(15,118,110,.08)]">
            {columns.map(col => <th key={col.key} className={'px-4 py-3 text-[10px] font-black tracking-wide text-ink-500 ' + (col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right')} style={{ width: col.width }}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const record = row as Record<string, unknown>;
            return <tr key={typeof record.id === 'string' || typeof record.id === 'number' ? String(record.id) : index} onClick={() => onRowClick?.(row)} className={'border-b border-ink-100/80 transition odd:bg-white even:bg-ink-50/25 ' + (onRowClick ? 'cursor-pointer hover:bg-primary-50/45' : '')}>
              {columns.map(col => <td key={col.key} className={'px-4 py-3 text-xs font-medium text-ink-700 ' + (col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right') + ' ' + (col.className ?? '')}>{col.render ? col.render(row) : record[col.key] as ReactNode}</td>)}
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
