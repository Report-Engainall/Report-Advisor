import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, ShoppingCart, TrendingUp, Users, Package,
  AlertTriangle, Brain, ArrowLeftRight, Wallet, Receipt,
  Lightbulb, RefreshCw, CalendarRange, CheckCircle2,
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, SeverityBadge, PriorityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';
import {
  fetchDashboardKPIs, fetchMonthlyTrend, fetchTopCustomers, fetchTopProducts,
  fetchCategoryBreakdown, fetchRecommendations, fetchAlerts, fetchAgingBuckets,
} from '@/lib/queries';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket } from '@/lib/queries';
import { Link } from 'react-router-dom';

const TREND_RANGES = [
  { value: 3, label: '3 أشهر' },
  { value: 6, label: '6 أشهر' },
  { value: 12, label: '12 شهرًا' },
] as const;

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopEntity[]>([]);
  const [topProducts, setTopProducts] = useState<TopEntity[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [trendMonths, setTrendMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const [k, t, tc, tp, cat, recs, alts, ag] = await Promise.all([
        fetchDashboardKPIs(),
        fetchMonthlyTrend(trendMonths),
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trendMonths]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ تحميل لوحة القيادة..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!kpis) return null;

  const totalAging = aging.reduce((sum, bucket) => sum + bucket.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink-900">لوحة القيادة</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-1 text-[11px] font-medium text-success-700">
              <CheckCircle2 size={13} /> بيانات مؤكدة
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">نظرة تنفيذية على الأداء والذمم والمخزون والأولويات</p>
        </div>