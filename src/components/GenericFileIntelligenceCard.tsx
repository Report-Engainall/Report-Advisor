import { Activity, AlertTriangle, ClipboardCheck, FileSearch, Layers3, ListChecks, ShieldCheck, Sigma } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { BusinessFinding, ReportIntelligence } from '@/lib/report-intelligence/report-smart-insights';

function healthLabel(value: ReportIntelligence['advisorBrief']['health']): string {
  if (value === 'REVIEW_REQUIRED') return 'مراجعة مطلوبة';
  if (value === 'ATTENTION') return 'انتباه';
  return 'مستقر';
}

function severityLabel(value: string): string {
  const labels: Record<string, string> = { critical: 'حرج', high: 'مرتفع', medium: 'متوسط', low: 'منخفض', info: 'معلومة' };
  return labels[value] ?? value;
}

function EvidenceList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-xs text-ink-400">لا يتوفر دليل نصي إضافي لهذا البند.</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={item + ':' + index} className="break-words rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs leading-5 text-ink-700">
          <span className="ml-1 font-black text-primary-700">دليل {index + 1}:</span>{item}
        </li>
      ))}
    </ul>
  );
}

function FindingList({ title, items }: { title: string; items: BusinessFinding[] }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3" aria-label={title}>
      <h3 className="flex items-center gap-2 text-sm font-black text-ink-950"><Layers3 size={16}/>{title} <span className="text-xs font-bold text-ink-400">({items.length})</span></h3>
      {items.map((finding) => (
        <article key={finding.id} className="rounded-xl border border-ink-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-sm font-black leading-6 text-ink-950">{finding.title}</h4>
            <Badge variant={finding.priority === 'high' ? 'warning' : 'neutral'}>{finding.priority === 'high' ? 'أولوية مرتفعة' : finding.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}</Badge>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-ink-700">{finding.statement}</p>
          {(finding.value != null || finding.dimensionValue || finding.dimensionLabel) && (
            <dl className="mt-3 grid gap-2 sm:grid-cols-3">
              {finding.value != null && <div className="rounded-lg bg-ink-50 p-2"><dt className="text-[10px] text-ink-500">القيمة المرصودة</dt><dd className="mt-1 break-words text-xs font-black text-ink-900">{String(finding.value)} {finding.unit ?? ''}</dd></div>}
              {finding.dimensionLabel && <div className="rounded-lg bg-ink-50 p-2"><dt className="text-[10px] text-ink-500">البُعد</dt><dd className="mt-1 break-words text-xs font-black text-ink-900">{finding.dimensionLabel}</dd></div>}
              {finding.dimensionValue && <div className="rounded-lg bg-ink-50 p-2"><dt className="text-[10px] text-ink-500">القيمة المرتبطة</dt><dd className="mt-1 break-words text-xs font-black text-ink-900">{finding.dimensionValue}</dd></div>}
            </dl>
          )}
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div><div className="mb-1 text-[10px] font-black text-ink-500">حدود الاستنتاج</div><p className="text-xs leading-5 text-ink-600">{finding.limitation}</p></div>
            <div><div className="mb-1 text-[10px] font-black text-ink-500">إجراء للمراجعة</div><p className="text-xs leading-5 text-ink-700">{finding.action}</p></div>
          </div>
          <div className="mt-3"><div className="mb-2 text-[10px] font-black text-ink-500">الأدلة</div><EvidenceList items={finding.evidence ?? []}/></div>
        </article>
      ))}
    </section>
  );
}

export function GenericFileIntelligenceCard({
  intelligence,
  format,
  sourcePath,
  sourceHash,
  reportJobId,
}: {
  intelligence: ReportIntelligence;
  format: string;
  sourcePath?: string | null;
  sourceHash?: string | null;
  reportJobId?: string | null;
}) {
  const brief = intelligence.advisorBrief;
  const signals = intelligence.signals ?? [];
  const recommendations = intelligence.recommendations ?? [];
  const findingGroups = [
    { title: 'الحقائق والنتائج المستخرجة', items: intelligence.findings ?? [] },
    { title: 'المخاطر المرصودة', items: intelligence.risks ?? [] },
    { title: 'الفرص المرصودة', items: intelligence.opportunities ?? [] },
  ];
  const evidenceCount = signals.reduce((sum, item) => sum + (item.evidence?.length ?? 0), 0)
    + recommendations.reduce((sum, item) => sum + (item.evidence?.length ?? 0), 0)
    + findingGroups.reduce((sum, group) => sum + group.items.reduce((groupSum, item) => groupSum + (item.evidence?.length ?? 0), 0), 0);

  return (
    <Card className="border-ink-200 bg-white" data-testid="generic-file-intelligence">
      <CardHeader
        title="التحليل العام للمصدر"
        subtitle="طبقة مشتركة لكل الملفات: تستخرج الحقائق والإشارات من المحتوى نفسه، وتحتفظ بالأدلة والحدود حتى عند توفر تحليل متخصص."
        action={<Badge variant={brief.health === 'REVIEW_REQUIRED' ? 'warning' : brief.health === 'ATTENTION' ? 'warning' : 'neutral'}>{healthLabel(brief.health)}</Badge>}
      />
      <CardBody>
        {(sourcePath || sourceHash || reportJobId) && (
          <section className="mb-5 rounded-xl border border-primary-100 bg-primary-50/40 p-3" data-testid="generic-intelligence-source-lineage">
            <div className="mb-2 flex items-center gap-2 text-xs font-black text-primary-900"><ShieldCheck size={14}/> هوية المصدر المرتبط بهذه النتائج</div>
            <dl className="grid gap-2 sm:grid-cols-2">
              {sourcePath && <div className="min-w-0"><dt className="text-[10px] text-ink-500">الملف</dt><dd className="mt-1 break-words text-xs font-bold text-ink-900">{sourcePath}</dd></div>}
              {reportJobId && <div className="min-w-0"><dt className="text-[10px] text-ink-500">معرّف التقرير</dt><dd className="mt-1 break-all font-mono text-[10px] text-ink-800">{reportJobId}</dd></div>}
              {sourceHash && <div className="min-w-0 sm:col-span-2"><dt className="text-[10px] text-ink-500">بصمة SHA-256</dt><dd className="mt-1 break-all font-mono text-[10px] leading-5 text-ink-800">{sourceHash}</dd></div>}
            </dl>
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-2xl border border-ink-200 bg-ink-50/50 p-4">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[.08em] text-primary-700"><FileSearch size={14}/> قراءة محايدة للمصدر</div>
            <h3 className="mt-2 text-base font-black leading-7 text-ink-950">{brief.headline}</h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink-600">{intelligence.summary}</p>
            <div className="mt-4 rounded-xl border border-ink-200 bg-white p-3">
              <div className="flex items-center gap-2 text-xs font-black text-ink-800"><Activity size={14}/> سؤال التحليل</div>
              <p className="mt-1 text-xs leading-5 text-ink-700">{intelligence.businessQuestion}</p>
            </div>
          </section>
          <section className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['الإشارات', signals.length],
                ['التوصيات', recommendations.length],
                ['النتائج', (intelligence.findings ?? []).length],
                ['عناصر الدليل', evidenceCount],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-ink-200 bg-white p-3"><div className="text-[10px] text-ink-500">{label}</div><div className="mt-1 text-lg font-black text-ink-950">{value}</div></div>
              ))}
            </div>
            <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-primary-900"><ListChecks size={15}/> الإجراء المقترح للمراجعة</div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-primary-950">{brief.recommendedAction ?? 'لا توجد توصية كافية من المحتوى الحالي.'}</p>
              {brief.ownerHint && <p className="mt-2 text-xs leading-5 text-primary-900"><b>المالك المبدئي:</b> {brief.ownerHint}</p>}
              {brief.expectedOutcome && <p className="mt-2 text-xs leading-5 text-primary-900"><b>النتيجة المتوقعة غير المعتمدة:</b> {brief.expectedOutcome}</p>}
              {brief.measurement && <p className="mt-2 text-xs leading-5 text-primary-900"><b>القياس المقترح:</b> {brief.measurement}</p>}
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-5 text-amber-950">
              <div className="flex items-center gap-2 font-black"><AlertTriangle size={14}/> حد الإثبات</div>
              <div className="mt-1 whitespace-pre-wrap">{brief.proofRequirement}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-ink-200 bg-white p-3"><div className="text-ink-500">الصيغة</div><div className="mt-1 break-words font-black text-ink-900">{format}</div></div>
              <div className="rounded-xl border border-ink-200 bg-white p-3"><div className="text-ink-500">الحالة</div><div className="mt-1 font-black text-ink-900">{healthLabel(brief.health)}</div></div>
            </div>
          </section>
        </div>

        <section className="mt-6 space-y-3" aria-label="كل إشارات التحليل العام">
          <h3 className="flex items-center gap-2 text-sm font-black text-ink-950"><Activity size={16}/> كل الإشارات ({signals.length})</h3>
          {signals.length ? signals.map((signal) => (
            <article key={signal.id} className="rounded-xl border border-ink-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="text-sm font-black leading-6 text-ink-950">{signal.title}</h4>
                <div className="flex flex-wrap gap-2"><Badge variant={signal.severity === 'critical' || signal.severity === 'high' ? 'warning' : 'neutral'}>{severityLabel(signal.severity)}</Badge><Badge variant="neutral">{signal.priority}</Badge></div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-ink-700">{signal.message}</p>
              {signal.affectedRows != null && <p className="mt-2 text-xs text-ink-500">عدد الصفوف المتأثرة المرصودة: {signal.affectedRows}</p>}
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {signal.soWhat && <div className="rounded-lg bg-ink-50 p-3"><div className="text-[10px] font-black text-ink-500">لماذا تهم؟</div><p className="mt-1 text-xs leading-5 text-ink-700">{signal.soWhat}</p></div>}
                {signal.impact && <div className="rounded-lg bg-ink-50 p-3"><div className="text-[10px] font-black text-ink-500">الأثر المثبت/حدوده</div><p className="mt-1 text-xs leading-5 text-ink-700">{signal.impact}</p></div>}
                {signal.ownerHint && <div className="rounded-lg bg-ink-50 p-3"><div className="text-[10px] font-black text-ink-500">المالك المقترح</div><p className="mt-1 text-xs leading-5 text-ink-700">{signal.ownerHint}</p></div>}
              </div>
              {signal.priorityReason?.length > 0 && <div className="mt-3"><div className="mb-1 text-[10px] font-black text-ink-500">سبب الأولوية كما حُسب</div><EvidenceList items={signal.priorityReason}/></div>}
              {signal.drivers?.length ? <div className="mt-3 space-y-2"><div className="text-[10px] font-black text-ink-500">محركات الإشارة</div>{signal.drivers.map((driver, index) => <div key={driver.dimension + ':' + driver.value + ':' + index} className="rounded-lg border border-ink-100 bg-ink-50/50 p-3"><p className="text-xs font-black text-ink-800">{driver.dimension}: {driver.value}</p><p className="mt-1 text-xs leading-5 text-ink-700">{driver.why}</p><EvidenceList items={driver.proof}/></div>)}</div> : null}
              <div className="mt-3"><div className="mb-1 text-[10px] font-black text-ink-500">كل الأدلة المصدرية ({signal.evidence?.length ?? 0})</div><EvidenceList items={signal.evidence ?? []}/></div>
            </article>
          )) : <p className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-xs text-ink-500">لم يستخرج هذا المصدر إشارات تتجاوز حدود التحليل الحالي؛ لا يتم اختلاق استثناءات.</p>}
        </section>

        <section className="mt-6 space-y-3" aria-label="كل توصيات التحليل العام">
          <h3 className="flex items-center gap-2 text-sm font-black text-ink-950"><ClipboardCheck size={16}/> كل التوصيات ({recommendations.length})</h3>
          {recommendations.length ? recommendations.map((recommendation) => (
            <article key={recommendation.id} className="rounded-xl border border-primary-100 bg-primary-50/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="text-sm font-black leading-6 text-ink-950">{recommendation.title}</h4>
                <Badge variant="neutral">{recommendation.status} · {recommendation.priority}</Badge>
              </div>
              <p className="mt-2 text-xs leading-6 text-ink-700">{recommendation.action}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ['لماذا؟', recommendation.why],
                  ['لماذا الآن؟', recommendation.whyNow],
                  ['المالك', recommendation.ownerHint],
                  ['النتيجة المتوقعة', recommendation.expectedOutcome],
                  ['القياس', recommendation.measurement],
                  ['الأثر', recommendation.impact],
                  ['المخاطر', recommendation.risk],
                  ['العائق', recommendation.blocker],
                  ['حدود التوصية', recommendation.limitation],
                  ['الموعد المقترح', recommendation.deadlineHint],
                ].filter(([, value]) => value != null && String(value).trim()).map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border border-ink-100 bg-white p-3"><div className="text-[10px] font-black text-ink-500">{label}</div><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-ink-700">{value}</p></div>
                ))}
              </div>
              <div className="mt-3"><div className="mb-1 text-[10px] font-black text-ink-500">كل أدلة التوصية ({recommendation.evidence?.length ?? 0})</div><EvidenceList items={recommendation.evidence ?? []}/></div>
            </article>
          )) : <p className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-xs text-ink-500">لا توجد توصية مستخرجة من المحتوى الحالي.</p>}
        </section>

        <div className="mt-6 space-y-6">
          {findingGroups.map((group) => <FindingList key={group.title} title={group.title} items={group.items}/>)}
        </div>

        {intelligence.guidance.inspect.length > 0 && (
          <section className="mt-6 rounded-xl border border-ink-200 bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-ink-900"><Sigma size={15}/> كل عناصر الفحص ({intelligence.guidance.inspect.length})</h3>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {intelligence.guidance.inspect.map((item, index) => <li key={item + ':' + index} className="break-words rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-xs leading-5 text-ink-700">{item}</li>)}
            </ul>
          </section>
        )}

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-primary-100 bg-primary-50/40 p-3 text-xs leading-5 text-primary-950">
          <ShieldCheck size={14} className="mt-0.5 shrink-0"/>
          <div>الأرقام والإشارات والأدلة المعروضة هنا مشتقة من محتوى المصدر المتاح. لا تُعد التوصية قرارًا معتمدًا؛ النتائج المستقبلية والأثر المالي والسببية والمقارنات غير المثبتة تظل غير معتمدة. <span className="font-black">الإثبات المعروض: {evidenceCount} مرجع دليل ضمن الإشارات والتوصيات والنتائج.</span></div>
        </div>
      </CardBody>
    </Card>
  );
}
