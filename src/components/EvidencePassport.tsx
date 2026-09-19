import { CheckCircle2, Clock3, Database, FileCheck2, ShieldCheck } from 'lucide-react';

export type EvidencePassportState = 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA' | 'BLOCKED';

export interface EvidencePassportProps {
  source: string;
  formula?: string | null;
  period?: string | null;
  tenant?: string | null;
  asOf?: string | null;
  freshness?: string | null;
  currency?: string | null;
  evidenceState: EvidencePassportState;
  confidence?: number | string | null;
  evidenceRefs?: string[];
  missingEvidence?: string[];
}

const labels: Record<EvidencePassportState, string> = {
  CONFIRMED: 'مؤكد من المصدر',
  CALCULATED: 'محسوب من المصدر',
  INSUFFICIENT_DATA: 'بيانات غير كافية',
  BLOCKED: 'محجوب حتى يتوفر سياق موثق',
};

export function EvidencePassport({
  source, formula, period, tenant, asOf, freshness, currency, evidenceState, confidence, evidenceRefs = [], missingEvidence = [],
}: EvidencePassportProps) {
  const Icon = evidenceState === 'BLOCKED' ? ShieldCheck : evidenceState === 'INSUFFICIENT_DATA' ? Clock3 : CheckCircle2;
  const tone = evidenceState === 'CONFIRMED' ? 'border-success-200 bg-success-50'
    : evidenceState === 'CALCULATED' ? 'border-primary-200 bg-primary-50'
    : evidenceState === 'INSUFFICIENT_DATA' ? 'border-warning-200 bg-warning-50'
    : 'border-amber-200 bg-amber-50';

  const rows = [
    ['المصدر', source],
    ['الصيغة/التعريف', formula || 'غير متاح'],
    ['الفترة', period || 'غير متاحة'],
    ['الشركة/الـTenant', tenant || 'غير متاح'],
    ['As-of', asOf || 'غير متاح'],
    ['Freshness', freshness || 'غير متاحة'],
    ['العملة', currency || 'غير محددة'],
    ['الثقة', confidence == null ? 'غير متاحة' : String(confidence)],
  ];

  return (
    <section className={`rounded-2xl border p-4 ${tone}`} aria-label="جواز الحقيقة">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-ink-900"><Icon size={17} /> جواز الحقيقة</div>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black text-ink-700">{labels[evidenceState]}</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(([label, value]) => <div key={label} className="rounded-xl border border-ink-100 bg-white/75 p-3"><div className="text-[10px] font-bold text-ink-400">{label}</div><div className="mt-1 text-xs font-bold text-ink-800 break-words">{value}</div></div>)}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-ink-100 bg-white/75 p-3"><div className="flex items-center gap-2 text-[10px] font-black text-ink-700"><Database size={13}/> Evidence refs</div><div className="mt-2 flex flex-wrap gap-1.5">{evidenceRefs.length ? evidenceRefs.map(ref => <span key={ref} className="rounded-full bg-ink-100 px-2 py-1 text-[10px] font-mono text-ink-700">{ref}</span>) : <span className="text-xs text-ink-500">لا توجد مراجع دليل مثبتة.</span>}</div></div>
        <div className="rounded-xl border border-ink-100 bg-white/75 p-3"><div className="flex items-center gap-2 text-[10px] font-black text-ink-700"><FileCheck2 size={13}/> ما يحتاج إلى إثبات إضافي</div><div className="mt-2 space-y-1">{missingEvidence.length ? missingEvidence.map(item => <div key={item} className="text-xs text-ink-600">• {item}</div>) : <div className="text-xs text-success-700">لا توجد فجوات معلنة.</div>}</div></div>
      </div>
    </section>
  );
}
