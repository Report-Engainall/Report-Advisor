import { ArrowDown, FileCheck2, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';

export function ImportPage() {
  return (
    <div dir="rtl" className="ag-import-shell space-y-5 animate-fade-in">
      <header className="flex flex-col gap-3 border-b border-ink-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="section-kicker">ط§ظ„طھط´ط؛ظٹظ„ / ط§ظ„ط§ط³طھظٹط±ط§ط¯</div>
          <h1 className="mt-1 text-[22px] font-black tracking-tight text-ink-950">ط§ط³طھظٹط±ط§ط¯ ط§ظ„ط¨ظٹط§ظ†ط§طھ</h1>
          <p className="mt-1 max-w-3xl text-[11px] leading-5 text-ink-500">
            ط­ظˆظ‘ظ„ ط§ظ„ظ…ظ„ظپ ط§ظ„ط£طµظ„ظٹ ط¥ظ„ظ‰ ط¨ظٹط§ظ†ط§طھ ظ…ظˆط«ظˆظ‚ط© ظ…ط¹ ظ…ط±ط§ط¬ط¹ط© ظˆط§ط¶ط­ط© ظ‚ط¨ظ„ ط£ظٹ ط§ط¹طھظ…ط§ط¯ ط£ظˆ ظƒطھط§ط¨ط©.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-ink-500">
          <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-ink-200 bg-white px-2.5 py-1.5">
            <ShieldCheck size={14} className="text-primary-700" /> ظپط­طµ ظ‚ط¨ظ„ ط§ظ„ظƒطھط§ط¨ط©
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-ink-200 bg-white px-2.5 py-1.5">
            <LockKeyhole size={14} className="text-primary-700" /> ط³ظٹط§ظ‚ ط§ظ„ط´ط±ظƒط© ظ…ط­ظ…ظٹ
          </span>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <main className="min-w-0">
          <CanonicalImportPage />
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-3 rounded-[12px] border border-ink-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-black text-ink-950">
              <Sparkles size={17} className="text-primary-700" />
              ظ…ط§ط°ط§ ط³ظٹط­ط¯ط«طں
            </div>

            <div className="mt-4 space-y-3">
              {[
                ['01', 'ظ†ظپظ‡ظ… ط§ظ„ظ…ظ„ظپ', 'ظ†ط­ط¯ط¯ ط§ظ„طµظٹط؛ط© ظˆط§ظ„ط£ط¹ظ…ط¯ط© ظˆط§ظ„ظƒظٹط§ظ†.'],
                ['02', 'ظ†ظپط­طµ ظˆظ†ط·ط§ط¨ظ‚', 'ظ†ط­ط³ط¨ ط§ظ„ط¬ظˆط¯ط© ظˆظ†ظƒط´ظپ ط§ظ„طھظƒط±ط§ط± ظˆط§ظ„ظ…ط´ظƒظ„ط§طھ.'],
                ['03', 'ظ†ط±ط§ط¬ط¹ ظ‚ط¨ظ„ ط§ظ„ظƒطھط§ط¨ط©', 'طھط±ظ‰ ظ…ط§ ط³ظٹظڈط¹طھظ…ط¯ ظˆظ…ط§ ط³ظٹط­طھط§ط¬ ظ…ط±ط§ط¬ط¹ط©.'],
                ['04', 'ظ†ط¹طھظ…ط¯ ط§ظ„ظ†طھظٹط¬ط©', 'ط§ظ„ظƒطھط§ط¨ط© طھطھظ… ط¹ط¨ط± ط§ظ„ظ…ط³ط§ط± ط§ظ„ظ‚ط§ظ†ظˆظ†ظٹ ط§ظ„ظ‚ط§ط¦ظ….'],
              ].map(([n, title, text]) => (
                <div key={n} className="flex gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white text-[9px] font-black text-ink-600">{n}</div>
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
                ظ„ط§ ط§ط¹طھظ…ط§ط¯ ط¨ظ„ط§ طھط­ظ‚ظ‚
              </div>
              <div className="mt-1 text-[11px] leading-5 text-ink-400">
                ط­ط§ظ„ط§طھ ط§ظ„ط±ظپط¶ ظˆط§ظ„ظ…ط±ط§ط¬ط¹ط© ظˆظ†ظ‚طµ ط§ظ„ط¨ظٹط§ظ†ط§طھ طھط¨ظ‚ظ‰ ط¸ط§ظ‡ط±ط© ظˆظ„ط§ طھطھط­ظˆظ„ ط¥ظ„ظ‰ ط£ط±ظ‚ط§ظ… ظ…ط¶ظ„ظ„ط©.
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-ink-400">
              <ArrowDown size={13} />
              ط§ط¨ط¯ط£ ظ…ظ† ظ…ط³ط§ط­ط© ط§ظ„ظ…ظ„ظپ ظپظٹ ط§ظ„ط£ط³ظپظ„
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-ink-200 pt-4">
        <FolderBatchImportPanel />
      </section>
    </div>
  );
}