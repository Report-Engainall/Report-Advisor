import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardPage } from '@/pages/DashboardPage';
import { ImportPage } from '@/pages/ImportPage';
import {
  ReportsCenterPage, SalesReportPage, PurchasesReportPage,
  InventoryReportPage, ReceivablesReportPage, ProfitabilityReportPage,
} from '@/pages/ReportsPage';
import {
  AnalyticsCenterPage, RFMAnalysisPage, ABCAnalysisPage, AgingAnalysisPage,
} from '@/pages/AnalyticsPage';
import {
  IntelligenceCenterPage, RecommendationsPage, ForecastsPage, ScenariosPage,
} from '@/pages/IntelligencePage';
import {
  CustomersPage, ProductsPage, InventoryPage, DataQualityPage, SettingsPage,
} from '@/pages/EntityPages';
import { fetchAlerts, markAlertRead } from '@/lib/queries';
import type { Alert } from '@/lib/types';
import { Menu, X } from 'lucide-react';

function AppShell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadAlerts = useCallback(async () => {
    const data = await fetchAlerts();
    setAlerts(data);
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const handleMarkAlert = useCallback(async (id: string) => {
    await markAlertRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  }, []);

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar alertCount={alerts.filter(a => !a.is_read).length} />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative animate-slide-in">
            <Sidebar alertCount={alerts.filter(a => !a.is_read).length} onNavigate={() => setSidebarOpen(false)} />
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 text-ink-400 hover:text-ink-600">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header alerts={alerts} onMarkAlertRead={handleMarkAlert} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
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
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
