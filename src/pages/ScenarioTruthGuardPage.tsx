import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState, PageHeader } from '@/components/ui/States';
import { fetchProfitabilitySnapshot } from '@/lib/dashboard-canonical';
import { CanonicalScenarioPage } from '@/pages/CanonicalScenarioPage';

export function ScenarioTruthGuardPage() {
  const [state, setState] = useState<'loading' | 'ready' | 'blocked'>('loading');
  const [reason, setReason] = useState<string | null>(null);
  const [financials, setFinancials] = useState<{ revenue: number; cost: number; currency: string } | null>(null);

  useEffect(() => {
    let active = true;
    void fetchProfitabilitySnapshot()
      .then(snapshot => {
        if (!active) return;
        if (
          snapshot.status === 'CALCULATED' &&
          snapshot.revenue !== null &&
          snapshot.cost !== null &&
          snapshot.currency !== null
        ) {
          setFinancials({ revenue: snapshot.revenue, cost: snapshot.cost, currency: snapshot.currency });
          setState('ready');
          return;
        }
        setReason(snapshot.reasons.join(', ') || 'FINANCIAL_TRUTH_INSUFFICIENT_DATA');
        setState('blocked');
      })
      .catch(error => {
        if (!active) return;
        setReason(error instanceof Error ? error.message : 'FINANCIAL_TRUTH_UNAVAILABLE');
        setState('blocked');
      });
    return () => { active = false; };
  }, []);

  if (state === 'loading') return <LoadingState message="جارٍ التحقق من الحقيقة المالية قبل تشغيل المحاكاة..." />;
  if (state === 'ready' && financials) {
    return (
      <CanonicalScenarioPage
        baseRevenue={financials.revenue}
        baseCost={financials.cost}
        currency={financials.currency}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="محاكاة السيناريوهات" subtitle="تم إيقاف المحاكاة مؤقتًا لحماية الحقيقة المالية" />
      <Card>
        <CardBody>
          <div className="flex items-start gap-4 rounded-xl border border-warning-200 bg-warning-50 p-5" role="alert">
            <AlertTriangle className="mt-0.5 text-warning-600" size={22} />
            <div>
              <h2 className="font-semibold text-ink-900">لا توجد قاعدة مالية موثوقة للمحاكاة</h2>
              <p className="mt-1 text-sm leading-6 text-ink-600">
                لن يتم استخدام أرقام افتراضية أو تخمينية كأساس للسيناريو. صحح اكتمال/اتساق البيانات المالية أولًا ثم أعد المحاولة.
              </p>
              {reason && <p className="mt-2 text-xs font-mono text-ink-500">{reason}</p>}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
