import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Command, Search } from 'lucide-react';

type CommandItem = { label: string; description: string; path: string; keywords: string[] };

const COMMANDS: CommandItem[] = [
  { label: 'لوحة القيادة', description: 'النظرة التنفيذية الرئيسية', path: '/', keywords: ['dashboard', 'home', 'لوحة', 'رئيسية'] },
  { label: 'مركز القيادة', description: 'الأولويات والقرارات العاجلة', path: '/command-center', keywords: ['command', 'decision', 'قيادة', 'قرارات'] },
  { label: 'استيراد البيانات', description: 'رفع ومعاينة واعتماد الملفات', path: '/import', keywords: ['import', 'upload', 'excel', 'csv', 'pdf', 'استيراد', 'رفع'] },
  { label: 'جودة البيانات', description: 'الفجوات والأخطاء والتغطية', path: '/data-quality', keywords: ['quality', 'dq', 'جودة', 'بيانات'] },
  { label: 'التقارير', description: 'مركز التقارير والتصدير', path: '/reports', keywords: ['reports', 'report', 'تقارير', 'snapshot', 'diff', 'لقطة', 'مقارنة'] },
  { label: 'الأدلة', description: 'استكشاف مصدر الأرقام ومسارها', path: '/evidence', keywords: ['evidence', 'lineage', 'source', 'دليل', 'مصدر', 'سلسلة'] },
  { label: 'إعادة تشغيل القرار', description: 'مراجعة القرار ولقطته وأدلته', path: '/decisions/replay', keywords: ['decision', 'replay', 'قرار', 'إعادة', 'تشغيل'] },
  { label: 'التحليلات', description: 'RFM وABC والأعمار والتحليلات', path: '/analytics', keywords: ['analytics', 'rfm', 'abc', 'aging', 'تحليلات'] },
  { label: 'الذكاء', description: 'التوصيات والتنبؤات والسيناريوهات', path: '/intelligence', keywords: ['ai', 'intelligence', 'forecast', 'سيناريو', 'تنبؤ', 'recommendation', 'توصيات'] },
  { label: 'العملاء', description: 'إدارة وتحليل العملاء', path: '/customers', keywords: ['customers', 'clients', 'عملاء'] },
  { label: 'المنتجات', description: 'المنتجات والأصناف', path: '/products', keywords: ['products', 'sku', 'منتجات', 'أصناف'] },
  { label: 'المخزون', description: 'المخزون والحركة', path: '/inventory', keywords: ['inventory', 'stock', 'مخزون'] },
  { label: 'مركز التحكم', description: 'صحة النظام والمهام والخدمات', path: '/control-plane', keywords: ['control', 'health', 'jobs', 'system', 'تحكم', 'صحة', 'مهام'] },
  { label: 'الإعدادات', description: 'إعدادات النظام', path: '/settings', keywords: ['settings', 'config', 'إعدادات'] },
];

interface CommandPaletteProps { open: boolean; onClose: () => void; }
const LISTBOX_ID = 'report-advisor-command-results';

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); if (!q) return COMMANDS; return COMMANDS.filter(item => [item.label, item.description, ...item.keywords].join(' ').toLowerCase().includes(q)); }, [query]);

  useEffect(() => { if (!open) return; setQuery(''); setActive(0); requestAnimationFrame(() => inputRef.current?.focus()); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(value => Math.min(value + 1, Math.max(filtered.length - 1, 0))); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive(value => Math.max(value - 1, 0)); }
      if (event.key === 'Home' && filtered.length > 0) { event.preventDefault(); setActive(0); }
      if (event.key === 'End' && filtered.length > 0) { event.preventDefault(); setActive(filtered.length - 1); }
      if (event.key === 'Enter' && filtered[active]) { event.preventDefault(); navigate(filtered[active].path); onClose(); }
    };
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, filtered, navigate, onClose, open]);

  if (!open) return null;
  const activeId = filtered[active] ? `command-option-${active}` : undefined;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/45 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="لوحة الأوامر">
      <button className="absolute inset-0 cursor-default" aria-label="إغلاق" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl" dir="rtl">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3"><Search size={19} className="text-ink-400" aria-hidden="true" /><input ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} placeholder="ابحث عن صفحة أو إجراء..." className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400" role="combobox" aria-autocomplete="list" aria-controls={LISTBOX_ID} aria-expanded="true" aria-activedescendant={activeId} /><kbd className="hidden rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[10px] text-ink-400 sm:inline-flex">Esc</kbd></div>
        <div id={LISTBOX_ID} className="max-h-[55vh] overflow-y-auto p-2" role="listbox" aria-label="نتائج لوحة الأوامر">
          {filtered.length === 0 ? <div className="px-4 py-10 text-center text-sm text-ink-400" role="status">لا توجد نتائج مطابقة</div> : filtered.map((item, index) => <button key={item.path} id={`command-option-${index}`} type="button" role="option" aria-selected={index === active} onMouseEnter={() => setActive(index)} onClick={() => { navigate(item.path); onClose(); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${index === active ? 'bg-primary-50 text-primary-900' : 'hover:bg-ink-50'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index === active ? 'bg-primary-100 text-primary-700' : 'bg-ink-100 text-ink-500'}`}><Command size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.label}</span><span className="block truncate text-xs text-ink-400">{item.description}</span></span>{index === active && <ArrowRight size={16} className="shrink-0 text-primary-500" aria-hidden="true" />}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/70 px-4 py-2 text-[11px] text-ink-400"><span>↑↓ للتنقل</span><span>Home/End للبداية والنهاية</span><span>Enter للفتح</span><span>Esc للإغلاق</span></div>
      </div>
    </div>
  );
}
