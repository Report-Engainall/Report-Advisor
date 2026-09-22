import { type ReactNode, useEffect, useMemo, useState } from 'react';

export interface Column<T> {
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

export function DataTable<T extends object>({ columns, data, loading, emptyMessage = 'لا توجد بيانات', onRowClick, pageSize }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const effectivePageSize = Number.isInteger(pageSize) && (pageSize ?? 0) > 0 ? pageSize! : 0;
  const pageCount = effectivePageSize ? Math.max(1, Math.ceil(data.length / effectivePageSize)) : 1;
  const visibleRows = useMemo(
    () => effectivePageSize ? data.slice(page * effectivePageSize, (page + 1) * effectivePageSize) : data,
    [data, effectivePageSize, page],
  );

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  if (loading) return <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 w-full"/>)}</div>;
  if (!data || data.length === 0) return <div className="ag-table-empty"><div className="ag-table-empty-icon" aria-hidden="true">⌁</div><div className="ag-table-empty-title">{emptyMessage}</div><div className="ag-table-empty-copy">تظهر هنا البيانات المتاحة فقط بعد اجتياز شروط المصدر والتحقق.</div></div>;

  return (
    <div className="space-y-3">
      <div className="ag-data-table data-table-shell overflow-auto rounded-[12px]">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key} className={'sticky top-0 z-10 border-b border-ink-200 bg-ink-50/95 px-4 py-2.5 text-[10px] font-black tracking-wide text-ink-500 backdrop-blur ' + (col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right')} style={{ width: col.width }}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => {
              const record = row as Record<string, unknown>;
              return <tr key={typeof record.id === 'string' || typeof record.id === 'number' ? String(record.id) : index} onClick={() => onRowClick?.(row)} onKeyDown={onRowClick ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onRowClick(row); } } : undefined} tabIndex={onRowClick ? 0 : undefined} className={'group border-b border-ink-100/90 bg-white transition-colors last:border-b-0 ' + (onRowClick ? 'cursor-pointer hover:bg-primary-50/45 focus-within:bg-primary-50/45' : 'hover:bg-ink-50/55')}>
                {columns.map(col => <td key={col.key} className={'border-b border-ink-100/80 px-4 py-3 text-xs font-medium text-ink-700 group-last:border-b-0 ' + (col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right') + ' ' + (col.className ?? '')}>{col.render ? col.render(row) : record[col.key] as ReactNode}</td>)}
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {effectivePageSize > 0 && pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2 text-xs text-ink-500" aria-label="تنقّل الجدول">
          <span className="font-medium">صفحة {page + 1} من {pageCount}</span>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0} aria-label="الصفحة السابقة">الصفحة السابقة</button>
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))} disabled={page >= pageCount - 1} aria-label="الصفحة التالية">الصفحة التالية</button>
          </div>
        </div>
      )}
    </div>
  );
}
