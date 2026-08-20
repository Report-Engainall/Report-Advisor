import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, Search, ArrowUp, ArrowDown, CornerDownLeft, X } from 'lucide-react';
import { EXPERIENCE_COMMANDS, rankExperienceCommands } from '@/lib/productExperience';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => rankExperienceCommands(EXPERIENCE_COMMANDS, query).slice(0, 9), [query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setSelected(value => Math.min(value, Math.max(0, results.length - 1)));
  }, [results.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); setSelected(value => Math.min(value + 1, results.length - 1)); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); setSelected(value => Math.max(value - 1, 0)); return; }
      if (event.key === 'Enter' && results[selected]) {
        event.preventDefault();
        const target = results[selected];
        if (target.path) navigate(target.path);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, onClose, open, results, selected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="مركز الأوامر">
      <button className="fixed inset-0 bg-ink-950/45 backdrop-blur-[2px]" aria-label="إغلاق" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
          <Search size={19} className="text-ink-400" />
          <input ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setSelected(0); }} placeholder="ابحث عن صفحة أو تحليل أو إجراء…" className="flex-1 bg-transparent outline-none text-sm text-ink-900 placeholder:text-ink-400" />
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50" aria-label="إغلاق"><X size={16} /></button>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-400">لا توجد نتائج مطابقة</div>
          ) : results.map((item, index) => (
            <button key={item.id} onMouseEnter={() => setSelected(index)} onClick={() => { if (item.path) navigate(item.path); onClose(); }} className={`w-full rounded-xl px-3 py-3 text-right flex items-center gap-3 transition-colors ${selected === index ? 'bg-primary-50 text-primary-900' : 'hover:bg-ink-50'}`}>
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${selected === index ? 'bg-primary-100 text-primary-700' : 'bg-ink-100 text-ink-500'}`}><Command size={17} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.label}</span><span className="block text-xs text-ink-400 mt-0.5 truncate">{item.description}</span></span>
              {item.shortcut && <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-[10px] text-ink-400">{item.shortcut}</kbd>}
              {selected === index && <CornerDownLeft size={15} className="text-primary-500" />}
            </button>
          ))}
        </div>
        <div className="border-t border-ink-100 px-4 py-2.5 flex items-center gap-4 text-[10px] text-ink-400">
          <span className="flex items-center gap-1"><ArrowUp size={12} /><ArrowDown size={12} /> للتنقل</span>
          <span className="flex items-center gap-1"><CornerDownLeft size={12} /> فتح</span>
          <span className="mr-auto">Esc إغلاق</span>
        </div>
      </div>
    </div>
  );
}
