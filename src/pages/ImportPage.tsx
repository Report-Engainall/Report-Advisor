import { ArrowDown, FileCheck2, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';

export function ImportPage() {
  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 border-b border-ink-200/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 text-[11px] font-black tracking-[0.08em] text-primary-700">التشغيل / الاستيراد</div>
          <h1 className="text-2xl font-black tracking-tight text-ink-950 sm:text-3xl">استيراد البيانات</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-500">
            حوّل الملف الأصلي إلى بيانات موثوقة مع مراجعة واضحة قبل أي اعتماد أو كتابة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5">
            <ShieldCheck size={14} className="text-primary-700" /> فحص قبل الكتابة
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5">
            <LockKeyhole size={14} className="text-primary-700" /> سياق الشركة محمي
          </span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_250px]">
        <main className="min-w-0">
          <CanonicalImportPage />
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-5 rounded-3xl border border-ink-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm font-black text-ink-950">
              <Sparkles size={17} className="text-primary-700" />
              ماذا سيحدث؟
            </div>

            <div className="mt-5 space-y-4">
              {[
                ['01', 'نفهم الملف', 'نحدد الصيغة والأعمدة والكيان.'],
                ['02', 'نفحص ونطابق', 'نحسب الجودة ونكشف التكرار والمشكلات.'],
                ['03', 'نراجع قبل الكتابة', 'ترى ما سيُعتمد وما سيحتاج مراجعة.'],
                ['04', 'نعتمد النتيجة', 'الكتابة تتم عبر المسار القانوني القائم.'],
              ].map(([n, title, text]) => (
                <div key={n} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-black text-primary-800">{n}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-ink-900">{title}</div>
                    <div className="mt-1 text-[11px] leading-5 text-ink-400">{text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-ink-100 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-ink-700">
                <FileCheck2 size={14} className="text-primary-700" />
                لا اعتماد بلا تحقق
              </div>
              <div className="mt-1 text-[11px] leading-5 text-ink-400">
                حالات الرفض والمراجعة ونقص البيانات تبقى ظاهرة ولا تتحول إلى أرقام مضللة.
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-ink-400">
              <ArrowDown size={13} />
              ابدأ من مساحة الملف في الأسفل
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-ink-200/70 pt-6">
        <FolderBatchImportPanel />
      </section>
    </div>
  );
}
