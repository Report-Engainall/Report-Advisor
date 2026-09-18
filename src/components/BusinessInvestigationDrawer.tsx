import { useEffect, useId, useRef } from 'react';
import { ArrowUpLeft, CheckCircle2, CircleAlert, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export type InvestigationAction = {
  label: string;
  path: string;
  hint: string;
};

export type InvestigationFact = {
  label: string;
  value: string;
};

export type InvestigationEvidence = {
  source: string;
  asOf: string;
  status: string;
  period?: string;
  formula?: string;
};

export type InvestigationTarget = {
  title: string;
  eyebrow: string;
  severity?: 'critical' | 'warning' | 'opportunity' | 'info';
  summary: string;
  facts: InvestigationFact[];
  confirmedReasons: string[];
  missingEvidence: string[];
  actions: InvestigationAction[];
  evidence: InvestigationEvidence;
};

const severityMeta = {
  critical: { label: 'يتطلب تدخلًا', className: 'border-danger-200 bg-danger-50 text-danger-800' },
  warning: { label: 'يحتاج مراجعة', className: 'border-warning-200 bg-warning-50 text-warning-800' },
  opportunity: { label: 'فرصة', className: 'border-success-200 bg-success-50 text-success-800' },
  info: { label: 'للمتابعة', className: 'border-primary-200 bg-primary-50 text-primary-800' },
} as const;

export function BusinessInvestigationDrawer({
  target,
  onClose,
}: {
  target: InvestigationTarget | null;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const drawerId = 'business-investigation-' + useId().replace(/:/g, '');
  const titleId = drawerId + '-title';

  useEffect(() => {
    if (!target) return;
    const previousOverflow = document.body.style.overflow;
    const activeElement = document.activeElement;
    previousFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('button[data-investigation-close="true"]')?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      const previousFocus = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previousFocus?.isConnected) requestAnimationFrame(() => previousFocus.focus());
    };
  }, [target, onClose]);

  if (!target) return null;
  const meta = severityMeta[target.severity ?? 'info'];

  return (
    <div ref={drawerRef} id={drawerId} className="fixed inset-0 z-[120] flex bg-ink-950/45 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق" onClick={onClose} />
      <aside className="relative ms-auto flex h-full w-full max-w-2xl flex-col border-s border-ink-200 bg-[#fbfbfa] shadow-2xl">
        <header className="shrink-0 border-b border-ink-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black tracking-[0.14em] text-primary-700">{target.eyebrow}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 id={titleId} className="text-xl font-black tracking-tight text-ink-950">{target.title}</h2>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${meta.className}`}>{meta.label}</span>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500">{target.summary}</p>
            </div>
            <button type="button" data-investigation-close="true" onClick={onClose} className="rounded-xl border border-ink-200 bg-white p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2" aria-label="إغلاق">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4">
            <section className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <CircleAlert size={16} className="text-primary-700" />
                <h3 className="text-sm font-black text-ink-900">ماذا نعرف الآن؟</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {target.facts.map(fact => (
                  <div key={fact.label} className="rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                    <div className="text-[10px] font-bold text-ink-400">{fact.label}</div>
                    <div className="mt-1.5 text-sm font-black tabular-nums text-ink-900">{fact.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary-700" />
                <h3 className="text-sm font-black text-ink-900">لماذا ظهر هذا؟</h3>
              </div>
              <div className="mt-3 space-y-2.5">
                {target.confirmedReasons.length > 0 ? target.confirmedReasons.map(reason => (
                  <div key={reason} className="flex items-start gap-2 rounded-xl border border-success-100 bg-success-50/60 p-3 text-xs leading-5 text-success-900">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                )) : (
                  <div className="rounded-xl border border-warning-100 bg-warning-50/60 p-3 text-xs leading-5 text-warning-900">
                    السبب الجذري غير مثبت في اللقطة الحالية. لن يتم تقديم تفسير مصنوع؛ نحتاج دليلًا إضافيًا قبل اعتباره سببًا مؤكدًا.
                  </div>
                )}
                {target.missingEvidence.map(item => (
                  <div key={item} className="rounded-xl border border-ink-100 bg-ink-50 p-3 text-xs leading-5 text-ink-600">
                    <span className="font-bold text-ink-800">الدليل المطلوب:</span> {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-primary-200 bg-primary-50/45 p-4">
              <div className="flex items-center gap-2">
                <ArrowUpLeft size={16} className="text-primary-700" />
                <h3 className="text-sm font-black text-primary-950">ماذا نفعل الآن؟</h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-primary-900/70">الإجراءات التالية تربطك بمسار العمل الذي يفحص السبب أو ينفذ الخطوة. لا يُعرض الإجراء على أنه منفذ حتى يثبت من النظام.</p>
              <div className="mt-4 space-y-2">
                {target.actions.map(action => (
                  <Link key={action.path} to={action.path} onClick={onClose} className="flex items-center gap-3 rounded-xl border border-white bg-white p-3 transition hover:border-primary-300 hover:shadow-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black text-ink-900">{action.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-ink-400">{action.hint}</span>
                    </span>
                    <ExternalLink size={15} className="shrink-0 text-primary-600" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-success-700" />
                <h3 className="text-sm font-black text-ink-900">سلسلة الإثبات</h3>
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-2"><span className="text-ink-400">المصدر</span><code className="font-mono text-[11px] text-ink-800">{target.evidence.source}</code></div>
                <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-2"><span className="text-ink-400">حتى</span><span className="font-semibold text-ink-800">{target.evidence.asOf}</span></div>
                {target.evidence.period && <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-2"><span className="text-ink-400">الفترة</span><span className="font-semibold text-ink-800">{target.evidence.period}</span></div>}
                {target.evidence.formula && <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-2"><span className="text-ink-400">التعريف/الصيغة</span><span className="max-w-[70%] text-end font-semibold text-ink-800">{target.evidence.formula}</span></div>}
                <div className="flex items-center justify-between gap-4 py-2"><span className="text-ink-400">حالة الحقيقة</span><span className="rounded-full bg-ink-100 px-2.5 py-1 font-black text-ink-700">{target.evidence.status}</span></div>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
