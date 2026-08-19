import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardPage } from '@/pages/DashboardPage';
import { fetchAlerts, markAlertRead } from '@/lib/queries';
import type { Alert } from '@/lib/types';
import { X } from 'lucide-react';

const BusinessCockpitPage = lazy(() => import('@/pages/BusinessCockpitPage').then(m => ({ default: m.BusinessCockpitPage })));
const InventoryIntelligencePage = lazy(() => import('@/pages/InventoryIntelligencePage').then(m => ({ default: m.InventoryIntelligencePage })));
const ImportPage = lazy(() => import('@/pages/ImportPage').then(m => ({ default: m.ImportPage })));
const ReportsCenterPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsCenterPage })));
const SalesReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.SalesReportPage })));
const PurchasesReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.PurchasesReportPage })));
const InventoryReportPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.InventoryReportPage })));
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

function AppShell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loadAlerts = useCallback(async () => setAlerts(await fetchAlerts()), []);
  useEffect(() => { loadAlerts(); }, [loadAlerts]);
  const handleMarkAlert = useCallback(async (id: string) => {
    await markAlertRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  }, []);

  return (
    <div className="flex min-h-screen bg-ink-50">
      <div className="hidden lg:block"><Sidebar alertCount={alerts.filter(a => !a.is_read).length} /></div>
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-50 flex"><div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} /><div className="relative animate-slide-in"><Sidebar alertCount={alerts.filter(a => !a.is_read).length} onNavigate={() => setSidebarOpen(false)} /><button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 text-ink-400 hover:text-ink-600"><X size={20} /></button></div></div>}
      <div className="flex-1 flex flex-col min-w-0">
        <Header alerts={alerts} onMarkAlertRead={handleMarkAlert} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" /></div>}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/cockpit" element={<BusinessCockpitPage />} />
              <Route path="/inventory/intelligence" element={<InventoryIntelligencePage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/data-quality" element={<DataQualityPage />} />
              <Route path="/reports" element={<ReportsCenterPage />} />
              <Route path="/reports/sales" element={<SalesReportPage />} />
              <Route path="/reports/purchases" element={<PurchasesReportPage />} />
              <Route path="/reports/inventory" element={<InventoryReportPage />} />
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
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
export default function App() { return <BrowserRouter><AppShell /></BrowserRouter>; }
