import { Card, CardBody } from '@/components/ui/Card';
import { TruthRail } from '@/components/ui/States';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';

export function ImportPage() {
  return <div dir="rtl" className="space-y-5 animate-fade-in">
    <TruthRail status="limited" period="الاستيراد يثبت الحالة من المسار الحاكم فقط" />
    <Card className="overflow-hidden border-0 bg-ink-950 text-white">
      <CardBody>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr] items-center">
          <div>
            <div className="text-xs font-semibold text-primary-300">المصدر → الدليل → البيانات</div>
            <h1 className="mt-2 text-2xl font-bold lg:text-3xl">بوابة إدخال البيانات</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-300">ابدأ من المصدر الأصلي، افحصه، راجعه، ثم دع مسار الاستيراد المعتمد يتولى canonicalization والتحقق والالتزام بحدود المستأجر.</p>
          </div>
          <div className="rounded-2xl border border-ink-700 bg-white/5 p-4 text-xs text-ink-200">
            <div className="font-semibold text-white">قواعد الحقيقة</div>
            <div className="mt-2 space-y-1.5">
              <div>• لا كتابة مباشرة من واجهة العرض</div>
              <div>• لا تجاوز لحالة التحقق</div>
              <div>• لا اعتماد دون commit فعلي</div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
    <CanonicalImportPage />
    <FolderBatchImportPanel />
  </div>;
}
