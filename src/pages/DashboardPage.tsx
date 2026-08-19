import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, ShoppingCart, TrendingUp, Users, Package,
  AlertTriangle, Brain, ArrowLeftRight, Wallet, Receipt,
  Lightbulb, ArrowLeft, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, SeverityBadge, PriorityBadge, ConfidenceBadge, StatusBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';
import {
  fetchDashboardKPIs, fetchMonthlyTrend, fetchTopCustomers, fetchTopProducts,
  fetchCategoryBreakdown, fetchRecommendations, fetchAlerts, fetchAgingBuckets,
  markAlertRead, updateRecommendationStatus,
} from '@/lib/queries';
import { formatCurrency, formatNumber, formatPercent, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket } from '@/lib/queries';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopEntity[]>([]);
  const [topProducts, setTopProducts] = useState<TopEntity[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [k, t, tc, tp, cat, recs, alts, ag] = await Promise.all([
        fetchDashboardKPIs(),
        fetchMonthlyTrend(6),
        fetchTopCustomers(5),
        fetchTopProducts(5),
        fetchCategoryBreakdown(),
        fetchRecommendations(),
        fetchAlerts(),
        fetchAgingBuckets(),
      ]);
      setKpis(k);
      setTrend(t);
      setTopCustomers(tc);
      setTopProducts(tp);
      setCategories(cat);
      setRecommendations(recs);
      setAlerts(alts);
      setAging(ag);
    } catch (e: any) {
      setError(e.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ تحميل لوحة القيادة..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!kpis) return null;

  const totalAging = aging.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">لوحة القيادة</h1>
        <p className="text-sm text-ink-500 mt-1">نظرة شاملة على أداء الأعمال والذكاء التشغيلي</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="إجمالي المبيعات" value={kpis.totalSales} format="currency" icon={<DollarSign size={16} />} status={kpis.status} change={12.5} changeLabel="مقارنة بالشهر السابق" />
        <KPICard label="إجمالي الربح" value={kpis.grossProfit} format="currency" icon={<TrendingUp size={16} />} status={kpis.status} change={8.3} changeLabel="هامش ربح" hint={`هامش: ${kpis.grossMargin.toFixed(1)}%`} />
        <KPICard label="الذمم المدينة" value={kpis.totalReceivables} format="currency" icon={<Receipt size={16} />} status={kpis.status} hint={`متأخرة: ${formatCurrency(kpis.overdueReceivables)}`} />
        <KPICard label="قيمة المخزون" value={kpis.inventoryValue} format="currency" icon={<Package size={16} />} status={kpis.status} />
        <KPICard label="عدد العملاء" value={kpis.totalCustomers} format="number" icon={<Users size={16} />} status="CONFIRMED" />
        <KPICard label="عدد المنتجات" value={kpis.totalProducts} format="number" icon={<Package size={16} />} status="CONFIRMED" />
        <KPICard label="عدد الفواتير" value={kpis.invoiceCount} format="number" icon={<ShoppingCart size={16} />} status="CONFIRMED" />
        <KPICard label="معدل التحصيل" value={kpis.collectionRate} format="percent" icon={<Wallet size={16} />} status={kpis.status} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="اتجاه المبيعات والربح" subtitle="آخر 6 أشهر" action={<Badge variant="primary">شهري</Badge>} />
          <CardBody><TrendChart data={trend} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="توزيع المبيعات حسب الفئة" />
          <CardBody><CategoryPieChart data={categories} /></CardBody>
        </Card>
      </div>

      {/* Attention Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="مركز الانتباه"
            subtitle="التنبيهات والقضايا التي تتطلب إجراء"
            action={<Link to="/intelligence" className="text-xs text-primary-600 hover:text-primary-700 font-medium">عرض الكل</Link>}
          />
          <CardBody>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50/50 hover:bg-ink-50 transition-colors">
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-danger-50 text-danger-600' :
                    alert.severity === 'warning' ? 'bg-warning-50 text-warning-600' : 'bg-primary-50 text-primary-600'
                  }`}>
                    {alert.severity === 'critical' ? <AlertTriangle size={16} /> : <Lightbulb size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-ink-800">{alert.title}</span>
                      <SeverityBadge severity={alert.severity} />
                    </div>
                    {alert.description && <p className="text-xs text-ink-500 truncate">{alert.description}</p>}
                  </div>
                  <span className="text-[11px] text-ink-400 whitespace-nowrap">{relativeTime(alert.created_at)}</span>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-sm text-ink-400 text-center py-4">لا توجد تنبيهات</p>}
            </div>
          </CardBody>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader
            title="التوصيات النشطة"
            subtitle="إجراءات مقترحة لتحسين الأداء"
            action={<Link to="/intelligence/recommendations" className="text-xs text-primary-600 hover:text-primary-700 font-medium">عرض الكل</Link>}
          />
          <CardBody>
            <div className="space-y-3">
              {recommendations.filter(r => r.status === 'new' || r.status === 'accepted').slice(0, 4).map((rec) => (
                <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50/50 hover:bg-ink-50 transition-colors">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0">
                    <Brain size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium text-ink-800">{rec.title}</span>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    {rec.description && <p className="text-xs text-ink-500 line-clamp-1">{rec.description}</p>}
                    {rec.expected_impact && (
                      <div className="text-xs text-success-600 font-medium mt-1">
                        الأثر المتوقع: {formatCurrency(rec.expected_impact)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && <p className="text-sm text-ink-400 text-center py-4">لا توجد توصيات</p>}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top Entities + Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="أفضل العملاء" subtitle="حسب إجمالي المبيعات" />
          <CardBody>
            <HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={220} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="أفضل المنتجات" subtitle="حسب المبيعات" />
          <CardBody>
            <HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={220} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="تحليل أعمار الذمم" subtitle="إجمالي: " />
          <CardBody>
            <div className="space-y-3 mt-2">
              {aging.map((b) => {
                const pct = totalAging > 0 ? (b.amount / totalAging) * 100 : 0;
                const colors = ['bg-success-500', 'bg-primary-500', 'bg-warning-500', 'bg-danger-500'];
                return (
                  <div key={b.bucket}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-ink-600">{b.bucket} يوم</span>
                      <span className="text-xs text-ink-500 tabular-nums">{formatCurrency(b.amount)}</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[aging.indexOf(b) % 4]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-ink-400 mt-0.5">{b.count} فاتورة</div>
                  </div>
                );
              })}
              {totalAging === 0 && <p className="text-sm text-ink-400 text-center py-4">لا توجد ذمم مستحقة</p>}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="إجراءات سريعة" />
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link to="/import" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-ink-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all group">
              <ArrowLeftRight className="text-ink-400 group-hover:text-primary-500" size={20} />
              <span className="text-xs font-medium text-ink-600">استيراد بيانات</span>
            </Link>
            <Link to="/reports" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-ink-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all group">
              <Receipt className="text-ink-400 group-hover:text-primary-500" size={20} />
              <span className="text-xs font-medium text-ink-600">عرض التقارير</span>
            </Link>
            <Link to="/analytics" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-ink-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all group">
              <TrendingUp className="text-ink-400 group-hover:text-primary-500" size={20} />
              <span className="text-xs font-medium text-ink-600">التحليلات</span>
            </Link>
            <Link to="/intelligence" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-ink-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all group">
              <Brain className="text-ink-400 group-hover:text-primary-500" size={20} />
              <span className="text-xs font-medium text-ink-600">المساعد الذكي</span>
            </Link>
            <Link to="/customers" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-ink-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all group">
              <Users className="text-ink-400 group-hover:text-primary-500" size={20} />
              <span className="text-xs font-medium text-ink-600">العملاء</span>
            </Link>
            <Link to="/inventory" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-ink-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all group">
              <Package className="text-ink-400 group-hover:text-primary-500" size={20} />
              <span className="text-xs font-medium text-ink-600">المخزون</span>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
