import { useEffect, useRef } from 'react';
import { CheckCircle2, CircleAlert, Clock3, Database, FileCheck2, X } from 'lucide-react';

export type EvidenceDrawerStatus = 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA' | 'BLOCKED' | 'REVIEW_REQUIRED';

export interface EvidenceDrawerData {
  value: string;
  status: EvidenceDrawerStatus;
  source: string;
  period: string;
  asOf: string;
  tenant?: string;
  freshness?: string;
  formula?: string;
  evidence?: string;
  confidence?: string;
  nextAction?: string;
  blockReason?: string;
}

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: EvidenceDrawerData;
}

const statusMeta: Record<EvidenceDrawerStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  CONFIRMED: { label: 'موثّق من المصدر', className: 'bg-success-50 text-success-700 ring-success-100', icon: CheckCircle2 },
  CALCULATED: { label: 'محسوب من المصدر', className: 'bg-primary-50 text-primary-700 ring-primary-100', icon: CheckCircle2 },
  INSUFFICIENT_DATA: { label: 'بيانات غير كافية', className: 'bg-warning-50 text-warning-800 ring-warning-100', icon: CircleAlert },
  BLOCKED: { label: 'محجوب', className: 'bg-danger-50 text-danger-700 ring-danger-100', icon: CircleAlert },
  REVIEW_REQUIRED: { label: 'مراجعة مطلوبة', className: 'bg-warning-50 text-warning-800 ring-warning-100', icon: CircleAlert },
};

function Detail({ label, value, muted = false }: { label: string; value?: string; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/70 p-3.5">
      <div className="text-[10px] font-black tracking-wide text-ink-400">{label}</div>
      <div className={`mt-1.5 break-words text-sm font-semibold ${muted ? 'text-ink-400' : 'text-ink-800'}`}>
        {value?.trim() || 'غير متاح من المصدر الحالي'}
      </div>
    </div>
  );
}

export function EvidenceDrawer({ open, onClose, title, data }: EvidenceDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const meta = statusMeta[data.status];
  const StatusIcon = meta.icon;

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-ink-950/45 backdrop-blur-[2px] sm:items-center sm:p-4" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="إغلاق لوحة الدليل" onClick={onClose} />
      <aside
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-ink-200 bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="section-kicker">سلسلة الحقيقة</div>
              <h2 id="evidence-drawer-title" className="mt-1 text-lg font-black tracking-tight text-ink-950">{title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${meta.className}`}>
                  <StatusIcon size={13} />
                  {meta.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-semibold text-ink-500 ring-1 ring-inset ring-ink-100">
                  <Clock3 size={12} />
                  حتى {data.asOf || 'غير متاح'}
                </span>
              </div>
            </div>
            <button ref={closeButtonRef} type="button" onClick={onClose} className="icon-button shrink-0" aria-label="إغلاق لوحة الدليل">
              <X size={17} />
            </button>
          </div>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <section className="rounded-2xl border border-ink-200 bg-ink-950 p-5 text-white">
            <div className="text-[10px] font-black tracking-wide text-ink-300">النتيجة الحالية</div>
            <div className="mt-2 break-words text-2xl font-black tabular-nums">{data.value}</div>
            <div className="mt-2 text-xs leading-5 text-ink-300">
              هذه القيمة مرتبطة بسياق المصدر والفترة الموضحين أدناه، ولا تعني وجود دليل مستقل عندما لا يورده المصدر.
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Database size={16} className="text-primary-700" />
              <h3 className="text-sm font-black text-ink-900">السياق ومصدر الحقيقة</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="المصدر" value={data.source} />
              <Detail label="الفترة" value={data.period} />
              <Detail label="الشركة / المستأجر" value={data.tenant} />
              <Detail label="الحداثة / as-of" value={data.freshness || data.asOf} />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <FileCheck2 size={16} className="text-primary-700" />
              <h3 className="text-sm font-black text-ink-900">الدليل والحساب</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="التعريف / الصيغة" value={data.formula} muted={!data.formula} />
              <Detail label="مرجع الدليل" value={data.evidence} muted={!data.evidence} />
              <Detail label="الثقة" value={data.confidence} muted={!data.confidence} />
              <Detail label="الإجراء التالي" value={data.nextAction} muted={!data.nextAction} />
            </div>
          </section>

          {(data.blockReason || data.status === 'INSUFFICIENT_DATA' || data.status === 'REVIEW_REQUIRED' || data.status === 'BLOCKED') && (
            <section className="rounded-2xl border border-warning-200 bg-warning-50/70 p-4">
              <div className="text-xs font-black text-warning-900">حدود الاستخدام</div>
              <p className="mt-1.5 text-xs leading-6 text-warning-800">
                {data.blockReason || 'لا توجد بيانات كافية لإثبات هذه النتيجة على مستوى أعلى من الحالة الحالية.'}
              </p>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
