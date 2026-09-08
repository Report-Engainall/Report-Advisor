import { AlertTriangle, CheckCircle2, Copy, ShieldAlert, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { RowResolution } from '@/lib/file-engine/universal-intelligence';

type Decision = 'include' | 'exclude';

interface Props {
  resolutions: RowResolution[];
  decisions?: Record<string, Decision>;
  onDecision?: (decisionKey: string, decision: Decision) => void;
}

const decisionKey = (row: RowResolution, index: number) => `${row.fingerprint}:${index}`;

export function ImportResolutionReviewPanel({ resolutions, decisions = {}, onDecision }: Props) {
  const counts = resolutions.reduce((acc, row) => { acc[row.outcome] += 1; return acc; }, { new: 0, skip_exact: 0, candidate_duplicate: 0, conflict: 0 } as Record<RowResolution['outcome'], number>);
  const blocked = counts.skip_exact + counts.candidate_duplicate + counts.conflict;
  const unresolved = resolutions.reduce((count, row, index) => count + (row.outcome !== 'new' && !decisions[decisionKey(row, index)] ? 1 : 0), 0);
  if (!resolutions.length) return null;
  return <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-card-hover backdrop-blur-sm lg:p-6" dir="rtl">
    <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />
    <div className="relative flex flex-wrap items-start justify-between gap-4">
      <div><div className="flex items-center gap-2"><ShieldAlert size={19} className="text-primary-600"/><h2 className="text-lg font-black text-ink-900">بوابة قرار الاستيراد</h2></div><p className="mt-1 text-xs leading-6 text-ink-500">القرار محسوب قبل الكتابة؛ التكرار والتعارض لا يمران إلى قاعدة البيانات بصمت.</p></div>
      <Badge variant={unresolved ? 'warning' : 'success'}>{unresolved ? `${unresolved} صف يحتاج استبعادًا صريحًا` : blocked ? 'تم حسم الصفوف غير الجديدة' : 'كل الصفوف جديدة'}</Badge>
    </div>
    <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={15}/> جديد</div><div className="mt-2 text-3xl font-black text-emerald-800">{counts.new}</div><div className="mt-1 text-[11px] text-emerald-700">قابل للكتابة بعد اجتياز الحارس</div></div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Copy size={15}/> مطابق</div><div className="mt-2 text-3xl font-black text-slate-800">{counts.skip_exact}</div><div className="mt-1 text-[11px] text-slate-600">لا يُدمج ولا يُكتب</div></div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4"><div className="flex items-center gap-2 text-xs font-bold text-amber-700"><Copy size={15}/> تكرار محتمل</div><div className="mt-2 text-3xl font-black text-amber-800">{counts.candidate_duplicate}</div><div className="mt-1 text-[11px] text-amber-700">يحتاج استبعادًا صريحًا</div></div>
      <div className="rounded-2xl border border-red-100 bg-red-50/80 p-4"><div className="flex items-center gap-2 text-xs font-bold text-red-700"><AlertTriangle size={15}/> تعارض</div><div className="mt-2 text-3xl font-black text-red-800">{counts.conflict}</div><div className="mt-1 text-[11px] text-red-700">محجوب عن الكتابة دائمًا</div></div>
    </div>
    {blocked > 0 && <div className="relative mt-4 space-y-3">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-6 text-amber-900">الصفوف غير الجديدة لا يمكن تحويلها إلى كتابة. احسم كل صف باستبعاده صراحةً؛ القرار هنا لا يمنح صلاحية الكتابة، والحارس الخادمي يظل صاحب القرار النهائي.</div>
      <div className="space-y-2">
        {resolutions.map((row, index) => {
          if (row.outcome === 'new') return null;
          const key = decisionKey(row, index);
          const decision = decisions[key];
          const label = row.outcome === 'skip_exact' ? 'مطابق' : row.outcome === 'candidate_duplicate' ? 'تكرار محتمل' : 'تعارض';
          return <div key={key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white/80 p-3">
            <div className="min-w-0"><div className="flex items-center gap-2"><Badge variant={row.outcome === 'conflict' ? 'danger' : row.outcome === 'candidate_duplicate' ? 'warning' : 'neutral'}>{label}</Badge><span className="truncate font-mono text-[10px] text-ink-400">{row.fingerprint.slice(0, 18)}</span></div><div className="mt-1 text-xs text-ink-500">هذا الصف لن يُكتب ما لم يكن قرار الاستبعاد مسجلًا.</div></div>
            <button type="button" onClick={() => onDecision?.(key, 'exclude')} disabled={!onDecision || decision === 'exclude'} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 disabled:cursor-default disabled:opacity-60"><XCircle size={14}/>{decision === 'exclude' ? 'تم الاستبعاد' : 'استبعاد الصف'}</button>
          </div>;
        })}
      </div>
    </div>}
  </section>;
}
