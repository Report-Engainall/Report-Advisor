import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  { label: 'تحليل المستندات', description: 'استخراج وإثبات الملفات الخارجية', path: '/import/analyze', keywords: ['document analysis', 'file analysis', 'تحليل المستندات', 'ملفات'] },
  { label: 'جودة البيانات', description: 'الفجوات والأخطاء والتغطية', path: '/data-quality', keywords: ['quality', 'dq', 'جودة', 'بيانات'] },
  { label: 'التقارير', description: 'مركز التقارير والتصدير', path: '/reports', keywords: ['reports', 'report', 'تقارير'] },
  { label: 'تقرير المبيعات', description: 'مبيعات الفترة وقراءة الأداء', path: '/reports/sales', keywords: ['sales', 'مبيعات', 'تقرير مبيعات'] },
  { label: 'تقرير المشتريات', description: 'المشتريات والحركة الشرائية', path: '/reports/purchases', keywords: ['purchases', 'مشتريات', 'تقرير مشتريات'] },
  { label: 'تقرير المخزون', description: 'حالة المخزون والتقييم', path: '/reports/inventory', keywords: ['inventory report', 'مخزون', 'تقرير مخزون'] },

  { label: 'التقرير التنفيذي', description: 'قصة الأداء والقرارات للإدارة', path: '/reports/executive', keywords: ['executive report', 'board', 'management', 'تقرير تنفيذي', 'إدارة'] },
  { label: 'تحليل الربحية', description: 'الإيراد والتكلفة والهامش', path: '/reports/profitability', keywords: ['profitability', 'margin', 'profit', 'ربحية', 'هامش', 'ربح'] },
  { label: 'تحليل الذمم', description: 'التحصيل والأعمار والذمم المدينة', path: '/reports/receivables', keywords: ['receivables', 'aging', 'collection', 'ذمم', 'تحصيل', 'أعمار'] },
  { label: 'ذكاء المخزون', description: 'القيمة وإعادة الطلب ونقاط النقص', path: '/reports/inventory-intelligence', keywords: ['inventory intelligence', 'stock', 'مخزون', 'إعادة الطلب'] },
  { label: 'سرعة الطلب', description: 'حركة الطلب والاتجاهات والسرعة', path: '/reports/demand-velocity', keywords: ['demand velocity', 'demand', 'velocity', 'طلب', 'سرعة'] },
  { label: 'التحليلات', description: 'RFM وABC والأعمار والتحليلات', path: '/analytics', keywords: ['analytics', 'rfm', 'abc', 'aging', 'تحليلات'] },
  { label: 'تحليل RFM', description: 'تقسيم العملاء حسب القيمة والسلوك', path: '/analytics/rfm', keywords: ['rfm', 'عملاء', 'قيمة'] },
  { label: 'تحليل ABC', description: 'تصنيف المنتجات حسب الأهمية', path: '/analytics/abc', keywords: ['abc', 'منتجات', 'أهمية'] },
  { label: 'أعمار الذمم', description: 'تحليل أعمار المستحقات', path: '/analytics/aging', keywords: ['aging', 'ذمم', 'أعمار'] },

  { label: 'مفتش المؤشرات', description: 'هوية المؤشر وسياق الحساب والمصدر', path: '/metrics', keywords: ['metrics', 'metric inspector', 'kpi', 'مؤشرات', 'مفتش'] },
  { label: 'مجموعات البدائل', description: 'ربط الأصناف البديلة ضمن مجموعات قابلة للإدارة', path: '/alternative-groups', keywords: ['alternative groups', 'substitutes', 'بدائل', 'مجموعات'] },
  { label: 'الذكاء', description: 'التوصيات والتنبؤات والسيناريوهات', path: '/intelligence', keywords: ['ai', 'intelligence', 'forecast', 'سيناريو', 'تنبؤ'] },
  { label: 'التوصيات', description: 'مراجعة التوصيات والإجراءات المقترحة', path: '/intelligence/recommendations', keywords: ['recommendations', 'actions', 'توصيات', 'إجراءات'] },
  { label: 'التنبؤات', description: 'استعراض التنبؤات المتاحة من المصدر', path: '/intelligence/forecasts', keywords: ['forecasts', 'forecast', 'تنبؤات', 'توقعات'] },
  { label: 'السيناريوهات', description: 'حراسة حقائق السيناريو قبل القرار', path: '/intelligence/scenarios', keywords: ['scenarios', 'scenario truth', 'سيناريوهات'] },
  { label: 'Upwork Demo Mode', description: 'مطابقة متطلبات الوظائف مع قدرات المنتج الحقيقية', path: '/proposal-demo', keywords: ['upwork', 'proposal', 'job fit', 'demo', 'proposal demo', 'وظيفة', 'عرض', 'ديمو'] },
  { label: 'العملاء', description: 'إدارة وتحليل العملاء', path: '/customers', keywords: ['customers', 'clients', 'عملاء'] },
  { label: 'المنتجات', description: 'المنتجات والأصناف', path: '/products', keywords: ['products', 'sku', 'منتجات', 'أصناف'] },
  { label: 'المخزون', description: 'المخزون والحركة', path: '/inventory', keywords: ['inventory', 'stock', 'مخزون'] },
  { label: 'الإعدادات', description: 'إعدادات النظام', path: '/settings', keywords: ['settings', 'config', 'إعدادات'] },
  { label: 'ملفي الشخصي', description: 'اسم العرض والهوية داخل التطبيق', path: '/settings/profile', keywords: ['profile', 'account', 'ملف شخصي', 'حساب'] },
];

interface CommandPaletteProps { open: boolean; onClose: () => void; }

const RECENT_COMMANDS_KEY = 'aghbari.commandPalette.recent';
const RECENT_LIMIT = 5;

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteId = `command-palette-${useId().replace(/:/g, '')}`;
  const inputId = `${paletteId}-input`;
  const resultsId = `${paletteId}-results`;
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);

  const recentCommands = useMemo(
    () => recentPaths.map(path => COMMANDS.find(item => item.path === path)).filter((item): item is CommandItem => Boolean(item)),
    [recentPaths],
  );

  const contextScore = useCallback((path: string) => {
    const current = location.pathname;
    if (path === current) return 100;
    if (path !== '/' && current.startsWith(path)) return 80;
    const currentRoot = current.split('/').filter(Boolean)[0];
    const itemRoot = path.split('/').filter(Boolean)[0];
    if (currentRoot && currentRoot === itemRoot) return 45;
    return 0;
  }, [location.pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matches = COMMANDS.filter(item =>
      !q || [item.label, item.description, ...item.keywords].join(' ').toLowerCase().includes(q),
    );

    const recentRank = new Map(recentPaths.map((path, index) => [path, index]));
    return [...matches].sort((a, b) => {
      if (!q) {
        const aRecent = recentRank.get(a.path);
        const bRecent = recentRank.get(b.path);
        if (aRecent !== undefined || bRecent !== undefined) {
          if (aRecent === undefined) return 1;
          if (bRecent === undefined) return -1;
          if (aRecent !== bRecent) return aRecent - bRecent;
        }
      }

      const contextDelta = contextScore(b.path) - contextScore(a.path);
      if (contextDelta !== 0) return contextDelta;

      if (q) {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        const aPrefix = Number(aLabel.startsWith(q));
        const bPrefix = Number(bLabel.startsWith(q));
        if (aPrefix !== bPrefix) return bPrefix - aPrefix;
      }

      return a.label.localeCompare(b.label, 'ar');
    });
  }, [contextScore, query, recentPaths]);
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
  const activeItemId = filtered[active] ? `${resultsId}-option-${active}` : undefined;

  return (
    <div id={paletteId} className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/45 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={`${paletteId}-title`}>
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl" dir="rtl">
        <div className="border-b border-ink-100 px-4 py-3">
          <h2 id={`${paletteId}-title`} className="sr-only">لوحة الأوامر</h2>
          <div className="flex items-center gap-3"><Search size={19} className="text-ink-400" /><input id={inputId} ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} placeholder="ابحث عن صفحة أو إجراء..." aria-label="البحث في لوحة الأوامر" aria-controls={resultsId} aria-activedescendant={activeItemId} role="combobox" aria-autocomplete="list" aria-expanded="true" className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400" /><kbd className="hidden rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[10px] text-ink-400 sm:inline-flex">Esc</kbd></div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!query.trim() && recentCommands.length > 0 && (
            <div className="mb-2">
              <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">الوصول السريع</div>
              <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-1">
                {recentCommands.map((item) => {
                  const index = filtered.findIndex(row => row.path === item.path);
                  return (
                    <button key={item.path} type="button" onMouseEnter={() => setActive(Math.max(index, 0))} onClick={() => openCommand(item)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-primary-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary-700"><Command size={15}/></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.label}</span>
                        <span className="block truncate text-[11px] text-primary-700/65">{item.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {!query.trim() && (
            <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-wide text-ink-400">مرتبط بما تعمل عليه الآن</div>
          )}
          <div id={resultsId} role="listbox" aria-label="نتائج لوحة الأوامر">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-400">لا توجد نتائج مطابقة</div>
          ) : (
            filtered.map((item, index) => {
              const isCurrent = contextScore(item.path) >= 45;
              return (
                <button key={item.path} id={`${resultsId}-option-${index}`} role="option" aria-selected={index === active} type="button" onMouseEnter={() => setActive(index)} onClick={() => openCommand(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${index === active ? 'bg-primary-50 text-primary-900' : 'hover:bg-ink-50'}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index === active ? 'bg-primary-100 text-primary-700' : 'bg-ink-100 text-ink-500'}`}><Command size={17}/></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      {!query.trim() && isCurrent && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[9px] font-bold text-primary-700">في هذه المساحة</span>}
                    </span>
                    <span className="block truncate text-xs text-ink-400">{item.description}</span>
                  </span>
                  {index === active && <ArrowRight size={16} className="shrink-0 text-primary-500" />}
                </button>
              );
            })
          )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/70 px-4 py-2 text-[11px] text-ink-400"><span>↑↓ للتنقل</span><span>Enter للفتح</span><span>Esc للإغلاق</span></div>
      </div>
    </div>
  );
}
