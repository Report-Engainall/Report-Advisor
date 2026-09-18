import { CheckCircle2, CircleDashed, ShieldAlert } from 'lucide-react';
import type { DashboardKPIs } from '@/lib/dashboard-canonical';
import { buildDecisionCoverage } from '@/lib/decision-coverage';

export function DecisionCoverageCard({ kpis }: { kpis: DashboardKPIs | null }) {
  const coverage = buildDecisionCoverage(kpis);
  const Icon = coverage.state === 'FULL' ? CheckCircle2 : coverage.state === 'PARTIAL' ? CircleDashed : ShieldAlert;
  const tone = coverage.state === 'FULL' ? 'border-success-200 bg-success-50' : coverage.state === 'PARTIAL' ? 'border-warning-200 bg-warning-50' : 'border-amber-200 bg-amber-50';
  return <section className={`rounded-3xl border p-5 ${tone}`} aria-label="تغطية القرار">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-[10px] font-black tracking-[.12em] text-ink-500">DECISION COVERAGE</div>
        <h2 className="mt-1 text-lg font-black text-ink-950">كم قرارًا يمكن إثباته الآن؟</h2>
        <p className="mt-1 text-xs leading-6 text-ink-600">النسبة مشتقة من الحقول الكانونية المتاحة فقط، وليست تقييمًا لجودة الفريق أو القرار نفسه.</p>
      </div>
      <Icon size={22} className="text-primary-700"/>
    </div>
    <div className="mt-4 flex items-end gap-2"><span className="text-4xl font-black text-ink-950">{coverage.percent == null ? '—' : coverage.percent + '%'}</span><span className="mb-1 text-xs text-ink-500">{coverage.covered}/{coverage.total} مجالات</span></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {coverage.domains.map(domain => <div key={domain.id} className={`rounded-xl border p-3 ${domain.covered ? 'border-success-200 bg-white/80' : 'border-ink-100 bg-white/60'}`}><div className="text-xs font-black">{domain.label}</div><div className="mt-1 text-[10px] text-ink-500">{domain.covered ? 'مغطى من المصدر' : 'دليل ناقص: ' + domain.requiredEvidence.join('، ')}</div></div>)}
    </div>
  </section>;
}
