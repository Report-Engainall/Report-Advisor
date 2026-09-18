import { useEffect, useMemo, useState } from 'react';
import { BookmarkPlus, Check, ChevronDown, RotateCcw, Trash2 } from 'lucide-react';

export type SavedViewValue = Record<string, string | number | boolean | null>;

type SavedView = {
  id: string;
  name: string;
  value: SavedViewValue;
  createdAt: string;
};

interface SavedViewMenuProps {
  storageKey: string;
  value: SavedViewValue;
  onApply: (value: SavedViewValue) => void;
  onReset: () => void;
  disabled?: boolean;
}

function readViews(storageKey: string): SavedView[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedView =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        item.value &&
        typeof item.value === 'object',
    ).slice(0, 8);
  } catch {
    return [];
  }
}

function writeViews(storageKey: string, views: SavedView[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(views.slice(0, 8)));
  } catch {
    // Saved views are an optional local convenience and never block the workflow.
  }
}

export function SavedViewMenu({ storageKey, value, onApply, onReset, disabled = false }: SavedViewMenuProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [views, setViews] = useState<SavedView[]>([]);

  useEffect(() => {
    if (!open) return;
    setViews(readViews(storageKey));
  }, [open, storageKey]);

  const hasSavedViews = views.length > 0;
  const currentFingerprint = useMemo(() => JSON.stringify(value), [value]);

  const saveCurrent = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : \`1789749693718-\${Math.random().toString(36).slice(2)}\`;
    const next: SavedView[] = [
      { id, name: trimmed, value, createdAt: new Date().toISOString() },
      ...views.filter(view => JSON.stringify(view.value) !== currentFingerprint),
    ].slice(0, 8);

    setViews(next);
    writeViews(storageKey, next);
    setName('');
  };

  const removeView = (id: string) => {
    const next = views.filter(view => view.id !== id);
    setViews(next);
    writeViews(storageKey, next);
  };

  return (
    <div className="relative" dir="rtl">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <BookmarkPlus size={15} />
        العروض المحفوظة
        <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl">
          <div className="border-b border-ink-100 bg-ink-50/75 p-3">
            <div className="text-[10px] font-black tracking-[0.12em] text-ink-400">SAVED VIEWS</div>
            <div className="mt-1 text-sm font-black text-ink-900">احفظ طريقة العمل الحالية</div>
            <p className="mt-1 text-[11px] leading-5 text-ink-500">
              محفوظ محليًا على هذا الجهاز ومعزول بمفتاح المؤسسة الحالية. لا يؤثر على حالة قاعدة البيانات.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter') saveCurrent(); }}
                placeholder="اسم العرض، مثل: عمليات تحتاج مراجعة"
                className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="button"
                disabled={!name.trim()}
                onClick={saveCurrent}
                className="btn-primary shrink-0 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                حفظ
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {hasSavedViews ? views.map(view => (
              <div key={view.id} className="group flex items-center gap-2 rounded-xl px-2 py-2.5 hover:bg-ink-50">
                <button
                  type="button"
                  onClick={() => { onApply(view.value); setOpen(false); }}
                  className="flex min-w-0 flex-1 items-start gap-2 text-right"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <Check size={14} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-ink-800">{view.name}</span>
                    <span className="mt-0.5 block text-[10px] text-ink-400">
                      {new Date(view.createdAt).toLocaleDateString('ar-YE')}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeView(view.id)}
                  className="rounded-lg p-2 text-ink-300 opacity-0 transition hover:bg-danger-50 hover:text-danger-600 group-hover:opacity-100 focus:opacity-100"
                  aria-label={\`حذف العرض \${view.name}\`}
                  title="حذف العرض"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )) : (
              <div className="px-3 py-8 text-center text-xs text-ink-400">
                لا توجد عروض محفوظة على هذا الجهاز.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/60 px-3 py-2">
            <button type="button" onClick={() => { onReset(); setOpen(false); }} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-500 hover:text-primary-700">
              <RotateCcw size={13} />
              إعادة ضبط الفلاتر
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[11px] font-bold text-ink-400 hover:text-ink-700">
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
