import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Command, Search } from 'lucide-react';

type CommandItem = {
  label: string;
  description: string;
  path: string;
  keywords: string[];
};

const COMMANDS: CommandItem[] = [
  { label: 'لوحة القيادة', description: 'النظرة التنفيذية الرئيسية', path: '/', keywords: ['dashboard', 'home', 'لوحة', 'رئيسية'] },
  { label: 'بدء الاستخدام', description: 'مسار onboarding التجاري المبني على حالة الـtenant', path: '/onboarding', keywords: ['onboarding', 'setup', 'company setup', 'بدء', 'تهيئة', 'شركة'] },
  { label: 'مركز القيادة', description: 'الأولويات والقرارات العاجلة', path: '/command-center', keywords: ['command', 'decision', 'قيادة', 'قرارات'] },
  { label: 'مركز العمليات', description: 'متابعة دورة الاستيراد وحالة العمل', path: '/work-center', keywords: ['work center', 'operations', 'jobs', 'عمليات', 'تشغيل'] },
  { label: 'مساحة القرار', description: 'الدليل والموافقة والتنفيذ والنتيجة', path: '/decision-experience', keywords: ['decision experience', 'evidence', 'approval', 'قرار', 'دليل', 'موافقة'] },
  { label: 'استيراد البيانات', description: 'رفع ومعاينة واعتماد الملفات', path: '/import', keywords: ['import', 'upload', 'excel', 'csv', 'pdf', 'استيراد', 'رفع'] },
  { label: 'جودة البيانات', description: 'الفجوات والأخطاء والتغطية', path: '/data-quality', keywords: ['quality', 'dq', 'جودة', 'بيانات'] },
  { label: 'التقارير', description: 'مركز التقارير والتصدير', path: '/reports', keywords: ['reports', 'report', 'تقارير'] },
  { label: 'التقرير التنفيذي', description: 'قصة الأداء والقرارات للإدارة', path: '/reports/executive', keywords: ['executive report', 'board', 'management', 'تقرير تنفيذي', 'إدارة'] },
  { label: 'تحليل الربحية', description: 'الإيراد والتكلفة والهامش', path: '/reports/profitability', keywords: ['profitability', 'margin', 'profit', 'ربحية', 'هامش', 'ربح'] },
  { label: 'تحليل الذمم', description: 'التحصيل والأعمار والذمم المدينة', path: '/reports/receivables', keywords: ['receivables', 'aging', 'collection', 'ذمم', 'تحصيل', 'أعمار'] },
  { label: 'ذكاء المخزون', description: 'القيمة وإعادة الطلب ونقاط النقص', path: '/reports/inventory-intelligence', keywords: ['inventory intelligence', 'stock', 'مخزون', 'إعادة الطلب'] },
  { label: 'سرعة الطلب', description: 'حركة الطلب والاتجاهات والسرعة', path: '/reports/demand-velocity', keywords: ['demand velocity', 'demand', 'velocity', 'طلب', 'سرعة'] },
  { label: 'التحليلات', description: 'RFM وABC والأعمار والتحليلات', path: '/analytics', keywords: ['analytics', 'rfm', 'abc', 'aging', 'تحليلات'] },
  { label: 'مفتش المؤشرات', description: 'هوية المؤشر وسياق الحساب والمصدر', path: '/metrics', keywords: ['metrics', 'metric inspector', 'kpi', 'مؤشرات', 'مفتش'] },
  { label: 'مجموعات البدائل', description: 'ربط الأصناف البديلة ضمن مجموعات قابلة للإدارة', path: '/alternative-groups', keywords: ['alternative groups', 'substitutes', 'بدائل', 'مجموعات'] },
  { label: 'الذكاء', description: 'التوصيات والتنبؤات والسيناريوهات', path: '/intelligence', keywords: ['ai', 'intelligence', 'forecast', 'سيناريو', 'تنبؤ'] },
  { label: 'التوصيات', description: 'مراجعة التوصيات والإجراءات المقترحة', path: '/intelligence/recommendations', keywords: ['recommendations', 'actions', 'توصيات', 'إجراءات'] },
  { label: 'التنبؤات', description: 'استعراض التنبؤات المتاحة من المصدر', path: '/intelligence/forecasts', keywords: ['forecasts', 'forecast', 'تنبؤات', 'توقعات'] },
  { label: 'Upwork Demo Mode', description: 'مطابقة متطلبات الوظائف مع قدرات المنتج الحقيقية', path: '/proposal-demo', keywords: ['upwork', 'proposal', 'job fit', 'demo', 'proposal demo', 'وظيفة', 'عرض', 'ديمو'] },
  { label: 'العملاء', description: 'إدارة وتحليل العملاء', path: '/customers', keywords: ['customers', 'clients', 'عملاء'] },
  { label: 'المنتجات', description: 'المنتجات والأصناف', path: '/products', keywords: ['products', 'sku', 'منتجات', 'أصناف'] },
  { label: 'المخزون', description: 'المخزون والحركة', path: '/inventory', keywords: ['inventory', 'stock', 'مخزون'] },
  { label: 'الإعدادات', description: 'إعدادات النظام', path: '/settings', keywords: ['settings', 'config', 'إعدادات'] },
];

interface CommandPaletteProps { open: boolean; onClose: () => void; }

const RECENT_COMMANDS_KEY = 'aghbari.commandPalette.recent';
const RECENT_LIMIT = 5;

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const recentCommands = useMemo(() => recentPaths.map(path => COMMANDS.find(item => item.path === path)).filter((item): item is CommandItem => Boolean(item)), [recentPaths]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...recentCommands, ...COMMANDS.filter(item => !recentPaths.includes(item.path))];
    return COMMANDS.filter(item => [item.label, item.description, ...item.keywords].join(' ').toLowerCase().includes(q));
  }, [query, recentCommands, recentPaths]);
  const openCommand = useCallback((item: CommandItem) => {
    const next = [item.path, ...recentPaths.filter(path => path !== item.path)].slice(0, RECENT_LIMIT);
    setRecentPaths(next);
    try { window.localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(next)); } catch { /* optional */ }
    navigate(item.path);
    onClose();
  }, [navigate, onClose, recentPaths]);
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    try {
      const raw = window.localStorage.getItem(RECENT_COMMANDS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setRecentPaths(parsed.filter((path): path is string => typeof path === 'string').slice(0, RECENT_LIMIT));
    } catch { /* optional */ }
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(value => Math.min(value + 1, Math.max(filtered.length - 1, 0))); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive(value => Math.max(value - 1, 0)); }
      if (event.key === 'Enter' && filtered[active]) { event.preventDefault(); openCommand(filtered[active]); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, filtered, onClose, open, openCommand]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/45 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="لوحة الأوامر">
      <button className="absolute inset-0 cursor-default" aria-label="إغلاق" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl" dir="rtl">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3"><Search size={19} className="text-ink-400" /><input ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} placeholder="ابحث عن صفحة أو إجراء..." className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400" /><kbd className="hidden rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[10px] text-ink-400 sm:inline-flex">Esc</kbd></div>
        <div className="max-h-[55vh] overflow-y-auto p-2">{!query.trim() && recentCommands.length > 0 && <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">الوصول السريع</div>}{filtered.length === 0 ? <div className="px-4 py-10 text-center text-sm text-ink-400">لا توجد نتائج مطابقة</div> : filtered.map((item, index) => <button key={item.path} type="button" onMouseEnter={() => setActive(index)} onClick={() => openCommand(item)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${index === active ? 'bg-primary-50 text-primary-900' : 'hover:bg-ink-50'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index === active ? 'bg-primary-100 text-primary-700' : 'bg-ink-100 text-ink-500'}`}><Command size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.label}</span><span className="block truncate text-xs text-ink-400">{item.description}</span></span>{index === active && <ArrowRight size={16} className="shrink-0 text-primary-500" />}</button>)}</div>
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/70 px-4 py-2 text-[11px] text-ink-400"><span>↑↓ للتنقل</span><span>Enter للفتح</span><span>Esc للإغلاق</span></div>
      </div>
    </div>
  );
}
