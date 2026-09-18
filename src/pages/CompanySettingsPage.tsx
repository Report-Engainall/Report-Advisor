import { useEffect, useState, useCallback } from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { WORKSPACE_MODE_KEY, readWorkspaceMode, type WorkspaceMode } from '@/lib/workspace-mode';
import { SectorIntelligencePack } from '@/components/SectorIntelligencePack';


interface CompanySettings {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  currency: string | null;
  timezone: string | null;
  industry: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export function CompanySettingsPage() {
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(readWorkspaceMode);


  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('تعذر تحديد الشركة الحالية بشكل موثوق');

      const { data, error: queryError } = await supabase
        .from('companies')
        .select('id,name,legal_name,tax_id,currency,timezone,industry,phone,email,address')
        .eq('id', companyId)
        .single();
      if (queryError) throw queryError;
      if (!data) throw new Error('بيانات الشركة الحالية غير متاحة');
      setCompany(data as CompanySettings);
    } catch (cause) {
      setCompany(null);
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل إعدادات الشركة');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!company) return <ErrorState message="بيانات الشركة غير متاحة" onRetry={load} />;

  const setMode = (mode: WorkspaceMode) => {
    setWorkspaceMode(mode);
    window.localStorage.setItem(WORKSPACE_MODE_KEY, mode);
    window.dispatchEvent(new Event('report-advisor:workspace-mode'));
  };

  const field = (value: string | null) => value?.trim() || 'غير متوفر';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="الإعدادات" subtitle="إعدادات الشركة الحالية من المصدر الموثوق" />
      <Card>
        <CardHeader title="تخصيص مساحة العمل" />
        <CardBody>
          <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <SlidersHorizontal className="mt-0.5 text-primary-600" size={20} />
            <div><div className="text-sm font-bold text-ink-900">أظهر ما يحتاجه فريقك فقط</div><div className="mt-1 text-xs leading-5 text-ink-500">هذا تخصيص بصري لمساحة العمل على هذا الجهاز؛ لا يغيّر الصلاحيات أو عزل المستأجرين.</div></div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <button type="button" onClick={() => setMode('essential')} className={workspaceMode === 'essential' ? 'rounded-2xl border border-primary-500 bg-primary-50 p-4 text-right' : 'rounded-2xl border border-ink-100 bg-white p-4 text-right hover:bg-ink-50'}><div className="flex items-center justify-between gap-2"><span className="font-bold text-ink-900">أساسية</span>{workspaceMode === 'essential' && <Check size={18} className="text-primary-600" />}</div><div className="mt-2 text-xs leading-5 text-ink-500">المهام اليومية: القيادة، الاستيراد، التقارير، التحصيل، المخزون، العملاء والقرارات.</div></button>
            <button type="button" onClick={() => setMode('advanced')} className={workspaceMode === 'advanced' ? 'rounded-2xl border border-primary-500 bg-primary-50 p-4 text-right' : 'rounded-2xl border border-ink-100 bg-white p-4 text-right hover:bg-ink-50'}><div className="flex items-center justify-between gap-2"><span className="font-bold text-ink-900">متقدمة</span>{workspaceMode === 'advanced' && <Check size={18} className="text-primary-600" />}</div><div className="mt-2 text-xs leading-5 text-ink-500">تضيف التحليلات المتخصصة، الطلب، الربحية، المقاييس والسيناريوهات.</div></button>
            <button type="button" onClick={() => setMode('expert')} className={workspaceMode === 'expert' ? 'rounded-2xl border border-primary-500 bg-primary-50 p-4 text-right' : 'rounded-2xl border border-ink-100 bg-white p-4 text-right hover:bg-ink-50'}><div className="flex items-center justify-between gap-2"><span className="font-bold text-ink-900">خبيرة</span>{workspaceMode === 'expert' && <Check size={18} className="text-primary-600" />}</div><div className="mt-2 text-xs leading-5 text-ink-500">تُظهر كامل المساحة بما فيها العرض التجاري والمساحات المتخصصة.</div></button>
          </div>
        </CardBody>
      </Card>
      <SectorIntelligencePack industry={company.industry} />
      <Card>
        <CardHeader title="معلومات الشركة" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div className="text-xs text-ink-500">اسم الشركة</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.name)}</div></div>
            <div><div className="text-xs text-ink-500">الاسم القانوني</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.legal_name)}</div></div>
            <div><div className="text-xs text-ink-500">السجل الضريبي</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.tax_id)}</div></div>
            <div><div className="text-xs text-ink-500">العملة</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.currency)}</div></div>
            <div><div className="text-xs text-ink-500">المنطقة الزمنية</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.timezone)}</div></div>
            <div><div className="text-xs text-ink-500">القطاع</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.industry)}</div></div>
            <div><div className="text-xs text-ink-500">الهاتف</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.phone)}</div></div>
            <div><div className="text-xs text-ink-500">البريد الإلكتروني</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.email)}</div></div>
            <div className="md:col-span-2"><div className="text-xs text-ink-500">العنوان</div><div className="text-sm font-medium text-ink-800 mt-1">{field(company.address)}</div></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
