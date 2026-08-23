import { Component, type ErrorInfo, type ReactNode, useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/CommandPalette';
import { DashboardPage } from '@/pages/DashboardPage';
import { fetchAlerts, markAlertRead } from '@/lib/queries';
import type { Alert } from '@/lib/types';
import { AlertTriangle, Home, RefreshCw, X } from 'lucide-react';

const ImportPage = lazy(() => import('@/pages/ImportPage').then(m => ({ default: m.ImportPage })));
const ReportsCenterPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsCenterPage })));
const SalesReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.SalesReportPage })));
const PurchasesReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.PurchasesReportPage })));
const InventoryReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.InventoryReportPage })));
const InventoryIntelligencePage = lazy(() => import('@/pages/InventoryIntelligencePage').then(m => ({ default: m.InventoryIntelligencePage })));
const DemandVelocityPage = lazy(() => import('@/pages/DemandVelocityPage').then(m => ({ default: m.DemandVelocityPage })));
const ReceivablesReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReceivablesReportPage })));
const ProfitabilityReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ProfitabilityReportPage })));
const AnalyticsCenterPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsCenterPage })));
const RFMAnalysisPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.RFMAnalysisPage })));
const ABCAnalysisPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.ABCAnalysisPage })));
const AgingAnalysisPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AgingAnalysisPage })));
const IntelligenceCenterPage = lazy(() => import('@/pages/IntelligencePage').then(m => ({ default: m.IntelligenceCenterPage })));
const RecommendationsPage = lazy(() => import('@/pages/IntelligencePage').then(m => ({ default: m.RecommendationsPage })));
const ForecastsPage = lazy(() => import('@/pages/IntelligencePage').then(m => ({ default: m.ForecastsPage })));
const ScenariosPage = lazy(() => import('@/pages/IntelligencePage').then(m => ({ default: m.ScenariosPage })));
const CustomersPage = lazy(() => import('@/pages/EntityPages').then(m => ({ default: m.CustomersPage })));
const ProductsPage = lazy(() => import('@/pages/EntityPages').then(m => ({ default: m.ProductsPage })));
const InventoryPage = lazy(() => import('@/pages/EntityPages').then(m => ({ default: m.InventoryPage })));
const DataQualityPage = lazy(() => import('@/pages/EntityPages').then(m => ({ default: m.DataQualityPage })));
const SettingsPage = lazy(() => import('@/pages/EntityPages').then(m => ({ default: m.SettingsPage })));
const ExecutiveCommandCenterPage = lazy(() => import('@/pages/ExecutiveCommandCenterPage').then(m => ({ default: m.ExecutiveCommandCenterPage })));
const AlternativeGroupsPage = lazy(() => import('@/pages/AlternativeGroupsPage').then(m => ({ default: m.AlternativeGroupsPage })));

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div dir="rtl" className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>
          <h1 className="text-xl font-bold text-ink-900">حدث خطأ غير متوقع</h1>
          <p className="mt-2 text-sm leading-6 text-ink-500">تعذر عرض هذه الشاشة. يمكنك المحاولة مرة أخرى أو العودة إلى لوحة القيادة.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" onClick={this.handleRetry} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              <RefreshCw size={16} /> المحاولة مرة أخرى
            </button>
            <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
              <Home size={16} /> لوحة القيادة
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

function NotFoundPage() {
  return (
    <div dir="rtl" className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-8 shadow-sm text-center">
        <div className="text-5xl font-black text-primary-600">404</div>
        <h1 className="mt-3 text-xl font-bold text-ink-900">الصفحة غير موجودة</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">الرابط الذي طلبته غير موجود أو تم نقله.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">العودة للرئيسية</Link>
      </div>
    </div>
  );
}

function AppShell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();

  const loadAlerts = useCallback(async () => {
    try {
      setAlerts(await fetchAlerts());
    } catch (error) {
      console.error('[AppShell] Failed to load alerts', error);
      setAlerts([]);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(value => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleMarkAlert = useCallback(async (id: string) => {
    try {
      await markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (error) {
      console.error('[AppShell] Failed to mark alert as read', error);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-ink-50">
      <div className="hidden lg:block"><Sidebar alertCount={alerts.filter(a => !a.is_read).length} /></div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative animate-slide-in">
            <Sidebar alertCount={alerts.filter(a => !a.is_read).length} onNavigate={() => setSidebarOpen(false)} />
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 text-ink-400 hover:text-ink-600" aria-label="إغلاق القائمة"><X size={20} /></button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          alerts={alerts}
          onMarkAlertRead={handleMarkAlert}
          onMenuClick={() => setSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          <Suspense fallback={<div className="flex items-center justify-center py-20" role="status" aria-live="polite"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" /><span className="sr-only">جارٍ تحميل الصفحة</span></div>}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/command-center" element={<ExecutiveCommandCenterPage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/data-quality" element={<DataQualityPage />} />
              <Route path="/reports" element={<ReportsCenterPage />} />
              <Route path="/reports/sales" element={<SalesReportPage />} />
              <Route path="/reports/purchases" element={<PurchasesReportPage />} />
              <Route path="/reports/inventory" element={<InventoryReportPage />} />
              <Route path="/reports/inventory-intelligence" element={<InventoryIntelligencePage />} />
              <Route path="/reports/demand-velocity" element={<DemandVelocityPage />} />
              <Route path="/reports/receivables" element={<ReceivablesReportPage />} />
              <Route path="/reports/profitability" element={<ProfitabilityReportPage />} />
              <Route path="/analytics" element={<AnalyticsCenterPage />} />
              <Route path="/analytics/rfm" element={<RFMAnalysisPage />} />
              <Route path="/analytics/abc" element={<ABCAnalysisPage />} />
              <Route path="/analytics/aging" element={<AgingAnalysisPage />} />
              <Route path="/intelligence" element={<IntelligenceCenterPage />} />
              <Route path="/intelligence/recommendations" element={<RecommendationsPage />} />
              <Route path="/intelligence/forecasts" element={<ForecastsPage />} />
              <Route path="/intelligence/scenarios" element={<ScenariosPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/alternative-groups" element={<AlternativeGroupsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AppErrorBoundary><AppShell /></AppErrorBoundary></BrowserRouter>;
}
