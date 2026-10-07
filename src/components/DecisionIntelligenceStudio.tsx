import { useMemo, useState } from 'react';
import { Activity, BrainCircuit, Check, CircleAlert, Database, GitBranch, Gauge, Play, Scale, Sparkles, Target, TriangleAlert } from 'lucide-react';
import {
  assessDataQuality, buildAIBoundary, buildBusinessOntology, buildLearningSignal,
  buildProvenanceGraph, calculateRegisteredMetrics, deriveUnknownGaps, runWhatIfScenario,
  type KernelRow,
} from '@/lib/decision-intelligence-kernel';
import type { DuckDbQueryResult } from '@/lib/duckdb-browser';
import { IntelligenceClosurePanel } from '@/components/IntelligenceClosurePanel';

type Props = {
  rows: KernelRow[];
  specialty?: string | null;
  sourceHash?: string | null;
  reportJobId?: string | null;
  archetypeId?: string | null;
  recommendation?: string | null;
};
type Tab = 'control' | 'whatif' | 'gaps' | 'proof' | 'learning' | 'engine' | 'closure';

const contractFor = (specialty?: string | null) => {
  if (specialty === 'inventory') return { id: 'inventory', requiredFields: ['currentStock'], numericFields: ['currentStock', 'salesQty'], minimumRows: 3, uniqueKey: ['productCode', 'warehouse'] };
  if (specialty === 'receivables') return { id: 'receivables', requiredFields: ['balance'], numericFields: ['balance', 'paidAmount'], minimumRows: 3 };
  if (specialty === 'profitability') return { id: 'profitability', requiredFields: ['netAmount', 'profit'], numericFields: ['netAmount', 'profit', 'cost'], minimumRows: 3 };
  if (specialty === 'sales') return { id: 'sales', requiredFields: [], numericFields: ['netAmount', 'salesAmount', 'quantity'], minimumRows: 3 };
  if (specialty === 'purchases') return { id: 'purchases', requiredFields: [], numericFields: ['netAmount', 'quantity'], minimumRows: 3 };
  return { id: 'generic', requiredFields: [], numericFields: [], minimumRows: 1 };
};

const tone = (state: string) =>
  state === 'TRUSTED' || state === 'CALCULATED' ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' :
  state === 'REVIEW' || state === 'PENDING_EVIDENCE' ? 'border-amber-300/20 bg-amber-300/10 text-amber-100' :
  state === 'BLOCKED' || state === 'GAP_DETECTED' || state === 'INSUFFICIENT_DATA' ? 'border-rose-300/20 bg-rose-300/10 text-rose-100' :
  'border-white/10 bg-white/5 text-slate-200';

const fmt = (v: number | null) => v == null ? 'غير متاح' : v.toLocaleString('ar-YE', { maximumFractionDigits: 2 });

export function DecisionIntelligenceStudio(props: Props) {
  const { rows, specialty, sourceHash = null, reportJobId = null, archetypeId = null, recommendation = null } = props;
  const [tab, setTab] = useState<Tab>('control');
  const [demand, setDemand] = useState(1);
  const [stockDelta, setStockDelta] = useState(0);
  const [cost, setCost] = useState(1);
  const [price, setPrice] = useState(1);
  const [learningMessage, setLearningMessage] = useState<string | null>(null);
  const [duckdb, setDuckdb] = useState<DuckDbQueryResult | null>(null);
  const [duckBusy, setDuckBusy] = useState(false);
  const [duckError, setDuckError] = useState<string | null>(null);

  const contract = useMemo(() => contractFor(specialty), [specialty]);
  const quality = useMemo(() => assessDataQuality(rows, contract), [rows, contract]);
  const metrics = useMemo(() => calculateRegisteredMetrics(rows), [rows]);
  const gaps = useMemo(() => deriveUnknownGaps(rows, { recommendation: recommendation ?? undefined, outcomeRequired: true }), [rows, recommendation]);
  const ontology = useMemo(() => buildBusinessOntology(rows), [rows]);
  const provenance = useMemo(() => buildProvenanceGraph({ sourceHash, reportJobId, archetypeId, signal: recommendation ? 'الإشارة المصدرية' : null, recommendation }), [sourceHash, reportJobId, archetypeId, recommendation]);
  const aiBoundary = useMemo(() => buildAIBoundary(), []);
  const scenario = useMemo(() => runWhatIfScenario(rows, { demandMultiplier: demand, stockDelta, costMultiplier: cost, sellingPriceMultiplier: price }), [rows, demand, stockDelta, cost, price]);
  const learn = (feedback: 'ACCEPT' | 'REJECT' | 'EDIT') => {
    const result = buildLearningSignal({
      scope: sourceHash ? 'report:' + sourceHash : 'report:anonymous',
      feedback,
      lesson: feedback === 'ACCEPT' ? 'المستخدم قبل الصياغة.' : feedback === 'REJECT' ? 'المستخدم رفض الصياغة.' : 'المستخدم طلب تحرير الصياغة.',
    });
    setLearningMessage(result.persistedLocally ? 'تم حفظ التصحيح محليًا.' : 'تعذر الحفظ محليًا؛ لم يتم الادعاء بأنه وصل للخادم.');
  };

  const runDuck = async () => {
    setDuckBusy(true); setDuckError(null);
    try {
      const { analyzeRowsWithDuckDb } = await import('@/lib/duckdb-browser');
      const numeric = ['currentStock', 'salesQty', 'netAmount', 'profit', 'balance', 'paidAmount']
        .filter((key) => rows.some((row) => row[key] !== undefined));
      const select = ['COUNT(*) AS row_count', ...numeric.slice(0, 3).map((key) => 'SUM(TRY_CAST("' + key + '" AS DOUBLE)) AS "' + key + '_sum"')].join(', ');
      setDuckdb(await analyzeRowsWithDuckDb(rows, { query: 'SELECT ' + select + ' FROM source_rows' }));
    } catch (error) {
      setDuckError(error instanceof Error ? error.message : 'DUCKDB_EXECUTION_FAILED');
    } finally {
      setDuckBusy(false);
    }
  };

  const tabs: Array<[Tab, string, typeof Activity]> = [
    ['control', 'المشهد', Activity], ['whatif', 'ماذا لو؟', Target], ['gaps', 'فجوات القرار', TriangleAlert],
    ['proof', 'سلسلة الدليل', GitBranch], ['learning', 'التعلّم', BrainCircuit], ['engine', 'محركات الحساب', Database], ['closure', 'الإغلاق الذكي', Scale],
  ];

  return <section dir="rtl" className="overflow-hidden rounded-[26px] border border-slate-700/70 bg-[#090e18] text-white shadow-[0_30px_90px_-42px_rgba(15,23,42,.95)]">
    <header className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,.14),transparent_38%),linear-gradient(135deg,#0b1220,#0b1018)] p-5 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.12em] text-emerald-300"><Sparkles size={15}/> DECISION INTELLIGENCE STUDIO <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 tracking-normal text-slate-300">Evidence-first</span></div>
          <h2 className="mt-2 text-xl font-black lg:text-2xl">محرك القرار تحت الشاشة — الحساب، الفجوة، السيناريو، والدليل</h2>
          <p className="mt-2 max-w-4xl text-[11px] leading-6 text-slate-300">طبقة تشغيل موحّدة تجعل المعادلات والجودة والفجوات وWhat‑if والتسلسل الاستدلالي قابلة لإعادة التشغيل.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[['الجودة', quality.score + '%'], ['السجلات', rows.length.toLocaleString('ar-YE')], ['المقاييس', metrics.length.toLocaleString('ar-YE')], ['الفجوات', gaps.length.toLocaleString('ar-YE')]].map(([label, value]) =>
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[.04] px-3 py-2.5"><div className="text-[8px] text-slate-500">{label}</div><div className="mt-1 text-sm font-black">{value}</div></div>
          )}
        </div>
      </div>
      <nav className="mt-5 flex gap-1 overflow-x-auto pb-1">
        {tabs.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setTab(id)}
          className={tab === id ? 'shrink-0 rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3.5 py-2 text-[10px] font-black text-emerald-100' : 'shrink-0 rounded-xl px-3.5 py-2 text-[10px] font-bold text-slate-400 hover:bg-white/5 hover:text-white'}>
          <Icon size={13} className="ml-1 inline"/> {label}
        </button>)}
      </nav>
    </header>
    <div className="p-5 lg:p-6">
      {tab === 'control' && <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="flex items-center justify-between"><div><div className="text-[9px] font-black tracking-[.12em] text-emerald-300">CONTROL DECK</div><div className="mt-1 text-base font-black">ما نعرفه الآن وما يسمح به الدليل</div></div><span className={'rounded-full border px-2.5 py-1 text-[9px] font-black ' + tone(quality.state)}>{quality.state}</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[9px] text-slate-500">جودة العقد</div><div className="mt-1 text-lg font-black">{quality.score}%</div><div className="mt-1 text-[9px] leading-5 text-slate-400">{quality.reasons[0] || 'لا توجد فجوة جودة حرجة.'}</div></div>
            <div className="rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[9px] text-slate-500">Business Ontology</div><div className="mt-1 text-lg font-black">{ontology.length}</div><div className="mt-1 text-[9px] text-slate-400">كيانات ومقاييس مستخرجة من المصدر.</div></div>
          </div>
          <div className="mt-4 space-y-2">
            {metrics.slice(0, 6).map((metric) => <div key={metric.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.02] px-3 py-2.5">
              <div className="min-w-0"><div className="text-[10px] font-black">{metric.label}</div><div className="mt-0.5 truncate text-[8px] text-slate-500">{metric.formula}</div></div>
              <div className="text-right"><div className="text-sm font-black">{fmt(metric.value)}</div><span className={'mt-1 inline-flex rounded-full border px-2 py-0.5 text-[8px] font-black ' + tone(metric.state)}>{metric.state}</span></div>
            </div>)}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.055] p-4">
          <div className="flex items-center gap-2 text-amber-200"><Gauge size={16}/><span className="text-[10px] font-black tracking-[.12em]">DECISION READINESS</span></div>
          <div className="mt-2 text-xl font-black">{quality.state === 'TRUSTED' && gaps.length === 0 ? 'قابل للدخول في القرار' : 'يدخل القرار مع حدود واضحة'}</div>
          <p className="mt-2 text-[10px] leading-6 text-amber-50/80">الفجوة لا تتحول إلى صفر، والتوقع لا يتحول إلى حقيقة. النتيجة تبقى مربوطة بالمصدر وتُراجع قبل الاعتماد.</p>
          <div className="mt-4 flex flex-wrap gap-2">{['Truth','Evidence','Signal','Recommendation','Decision'].map((step, i) => <span key={step} className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1.5 text-[8px] font-black text-slate-200">{i + 1}. {step}</span>)}</div>
        </div>
      </div>}

      {tab === 'whatif' && <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="flex items-center justify-between"><div><div className="text-[9px] font-black tracking-[.12em] text-cyan-300">WHAT-IF LAB</div><div className="mt-1 text-base font-black">اختبر السيناريو قبل أن تلمس الواقع</div></div><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[8px] font-black text-cyan-100">{scenario.state}</span></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              { label: 'الطلب', value: demand, setter: setDemand, min: 0.5, max: 2, step: 0.05, suffix: '×' },
              { label: 'الرصيد', value: stockDelta, setter: setStockDelta, min: -100, max: 100, step: 1, suffix: '' },
              { label: 'التكلفة', value: cost, setter: setCost, min: 0.75, max: 1.5, step: 0.01, suffix: '×' },
              { label: 'سعر البيع', value: price, setter: setPrice, min: 0.75, max: 1.5, step: 0.01, suffix: '×' },
            ].map(({ label, value, setter, min, max, step, suffix }) => <label key={label} className="rounded-xl border border-white/10 bg-black/10 p-3">
              <div className="flex items-center justify-between text-[9px] font-black"><span>{label}</span><span className="text-cyan-200">{Number(value).toLocaleString('ar-YE',{maximumFractionDigits:2})}{suffix}</span></div>
              <input type="range" min={Number(min)} max={Number(max)} step={Number(step)} value={Number(value)} onChange={(e) => (setter as (n:number)=>void)(Number(e.target.value))} className="mt-3 w-full accent-emerald-400"/>
            </label>)}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="text-[8px] text-slate-500">تغطية الأساس</div><div className="mt-1 text-lg font-black">{fmt(scenario.baseline.coverage)}</div></div>
            <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] p-3"><div className="text-[8px] text-cyan-200/70">تغطية السيناريو</div><div className="mt-1 text-lg font-black">{fmt(scenario.scenario.coverage)}</div></div>
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[.06] p-3"><div className="text-[8px] text-amber-200/70">فرق التغطية</div><div className="mt-1 text-lg font-black">{fmt(scenario.delta.coverage)}</div></div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-[9px] leading-5 text-slate-400">{scenario.proofBoundary}</div>
        </div>
        <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[.045] p-4"><div className="flex items-center gap-2 text-rose-200"><CircleAlert size={16}/><span className="text-[9px] font-black tracking-[.12em]">BOUNDARY</span></div><div className="mt-2 text-base font-black">السيناريو ليس تنفيذًا</div><p className="mt-2 text-[10px] leading-6 text-rose-50/75">هذه الحسابات لا تكتب إلى المخزون أو السعر أو القرار. هي مساحة تفكير قبل التنفيذ فقط.</p><div className="mt-4 space-y-2">{scenario.changedDrivers.length ? scenario.changedDrivers.map((item)=><div key={item} className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-[9px] font-bold">{item}</div>) : <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-[9px] text-slate-400">حرّك متغيرًا لرؤية الأثر الحسابي.</div>}</div></div>
      </div>}
      {tab === 'gaps' && <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="text-[9px] font-black tracking-[.12em] text-amber-300">UNKNOWN / DATA GAP ENGINE</div>
          <div className="mt-1 text-lg font-black">ما الذي ينقص القرار، وليس ما الذي يمكننا اختراعه؟</div>
          <div className="mt-4 space-y-2">{gaps.length ? gaps.map((gap) => <article key={gap.id} className="rounded-xl border border-amber-300/15 bg-amber-300/[.045] p-3">
            <div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-amber-300/10 p-1.5 text-amber-200"><TriangleAlert size={14}/></div>
              <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[11px] font-black">{gap.title}</h3><span className={'rounded-full border px-2 py-0.5 text-[8px] font-black ' + tone(gap.state)}>{gap.state}</span></div>
              <div className="mt-1 text-[9px] text-slate-400">مطلوب لـ: {gap.requiredFor}</div><div className="mt-2 text-[9px] leading-5 text-amber-100">{gap.action}</div></div>
            </div>
          </article>) : <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[.045] p-4 text-[10px] text-emerald-100">لا توجد فجوة قرار محددة في النطاق الحالي.</div>}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="text-[9px] font-black tracking-[.12em] text-slate-400">DATA CONTRACT</div><div className="mt-2 text-base font-black">{contract.id}</div>
          <div className="mt-3 grid gap-2">{[
            ['الحد الأدنى للصفوف', contract.minimumRows.toLocaleString('ar-YE')],
            ['الحقول المطلوبة', contract.requiredFields.join('، ') || 'لا يوجد'],
            ['المفاتيح الفريدة', contract.uniqueKey?.join(' + ') || 'غير مفروضة'],
            ['التسوية', 'متاحة عند ربط مصدر ثانٍ'],
          ].map(([label,value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="text-[8px] text-slate-500">{label}</div><div className="mt-1 text-[10px] font-bold">{value}</div></div>)}</div>
        </div>
      </div>}

      {tab === 'proof' && <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="text-[9px] font-black tracking-[.12em] text-emerald-300">PROVENANCE GRAPH</div><div className="mt-1 text-lg font-black">من المصدر إلى التوصية دون قفزة منطقية</div>
          <div className="mt-5 grid gap-2 md:grid-cols-4">{provenance.nodes.map((node) => <div key={node.id} className="rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[8px] text-slate-500">{node.kind}</div><div className="mt-1 text-[10px] font-black">{node.label}</div><div className="mt-1 text-[8px] text-slate-500">ثقة البنية {node.confidence}%</div></div>)}</div>
          <div className="mt-4 space-y-2">{provenance.edges.map((edge) => <div key={edge.from + edge.to} className="flex items-center gap-2 text-[9px] text-slate-400"><GitBranch size={12}/>{edge.label}</div>)}</div>
        </div>
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.045] p-4">
          <div className="flex items-center gap-2 text-emerald-200"><Scale size={16}/><span className="text-[9px] font-black tracking-[.12em]">TRUST BOUNDARY</span></div>
          <div className="mt-2 text-lg font-black">الحساب لا يساوي الحقيقة</div>
          <div className="mt-3 space-y-2 text-[9px] leading-5 text-slate-300">
            <div><b className="text-white">Source Hash:</b> {sourceHash || 'غير متاح'}</div>
            <div><b className="text-white">Report Job:</b> {reportJobId || 'غير متاح'}</div>
            <div><b className="text-white">Archetype:</b> {archetypeId || 'غير محدد'}</div>
            <div><b className="text-white">الدليل:</b> الإثبات النهائي يعتمد على المصدر الكانوني وEvidence Passport، لا على هذه الطبقة البصرية.</div>
          </div>
        </div>
      </div>}

      {tab === 'learning' && <div className="grid gap-4 lg:grid-cols-[1fr_.85fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="text-[9px] font-black tracking-[.12em] text-cyan-300">ACTIVE LEARNING</div><div className="mt-1 text-lg font-black">تصحيح المستخدم يصبح إشارة تعلم، وليس حقيقة تلقائية</div>
          <p className="mt-2 text-[10px] leading-6 text-slate-400">التصحيح لا يغير المصدر ولا يرفع الثقة ولا يعتمد القرار.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => learn('ACCEPT')} className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[9px] font-black text-emerald-100"><Check size={13} className="ml-1 inline"/> اعتماد الصياغة</button>
            <button type="button" onClick={() => learn('EDIT')} className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[9px] font-black text-cyan-100">تحريرها</button>
            <button type="button" onClick={() => learn('REJECT')} className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-[9px] font-black text-rose-100">رفضها</button>
          </div>
          {learningMessage && <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3 text-[9px] text-slate-300">{learningMessage}</div>}
        </div>
        <div className="rounded-2xl border border-violet-300/15 bg-violet-300/[.045] p-4">
          <div className="flex items-center gap-2 text-violet-200"><BrainCircuit size={16}/><span className="text-[9px] font-black tracking-[.12em]">AI BOUNDARY</span></div>
          <div className="mt-3 space-y-3">{[
            ['الحساب', aiBoundary.computation], ['الحقيقة', aiBoundary.truth], ['LLM', aiBoundary.llm], ['القاعدة', aiBoundary.rule],
          ].map(([label,value]) => <div key={label}><div className="text-[8px] font-black text-violet-200">{label}</div><div className="mt-1 text-[9px] leading-5 text-slate-300">{value}</div></div>)}</div>
        </div>
      </div>}
      {tab === 'closure' && <IntelligenceClosurePanel rows={rows} sourceHash={sourceHash} reportJobId={reportJobId} recommendation={recommendation} qualityScore={quality.score} gaps={gaps} />}
      {tab === 'engine' && <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-[9px] font-black tracking-[.12em] text-sky-300">DUCKDB + APACHE ARROW</div><div className="mt-1 text-lg font-black">محرك OLAP فعلي عند الحاجة</div></div>
            <button type="button" onClick={() => void runDuck()} disabled={duckBusy} className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-[9px] font-black text-sky-100 disabled:opacity-50">
              {duckBusy ? <Activity size={13} className="animate-pulse"/> : <Play size={13}/>} {duckBusy ? 'يجري الحساب…' : 'شغّل استعلامًا حقيقيًا'}
            </button>
          </div>
          <p className="mt-2 text-[10px] leading-6 text-slate-400">الصفوف الكانونية تتحول إلى Arrow داخل المتصفح، ثم تُحلل في DuckDB-Wasm. لا تُكتب النتيجة إلى سجلات الأعمال.</p>
          {duckError && <div className="mt-3 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-[9px] text-rose-100">{duckError}</div>}
          {duckdb && <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-300/15 bg-sky-300/[.05] p-3"><div className="text-[8px] text-sky-200/70">المحرك</div><div className="mt-1 text-sm font-black">{duckdb.engine}</div></div>
            <div className="rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[8px] text-slate-500">الأعمدة</div><div className="mt-1 text-sm font-black">{duckdb.columns.length}</div></div>
            <div className="rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[8px] text-slate-500">الزمن</div><div className="mt-1 text-sm font-black">{duckdb.durationMs} ms</div></div>
          </div>}
          {duckdb?.rows?.[0] && <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-left text-[9px] text-sky-100">{JSON.stringify(duckdb.rows[0], null, 2)}</pre>}
        </div>
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.045] p-4">
          <div className="text-[9px] font-black tracking-[.12em] text-emerald-300">CALCULATION REGISTRY</div>
          <div className="mt-1 text-lg font-black">كل معادلة لها اسم وحدود</div>
          <div className="mt-4 space-y-2">{metrics.map((metric) => <div key={metric.id} className="rounded-xl border border-white/10 bg-black/10 p-3"><div className="text-[9px] font-black">{metric.id}</div><div className="mt-1 text-[9px] text-slate-400">{metric.formula}</div></div>)}</div>
        </div>
      </div>}
    </div>
    <footer className="border-t border-white/10 px-5 py-3 text-[8px] leading-5 text-slate-500 lg:px-6">
      {ontology.length} ontology nodes · {provenance.edges.length} provenance edges · {metrics.length} registered calculations · {gaps.length} explicit gaps · AI boundary enforced
    </footer>
  </section>;
}
