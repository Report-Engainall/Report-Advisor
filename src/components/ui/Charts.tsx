import { lazy, Suspense } from 'react';

interface ChartProps {
  data: object[];
  height?: number;
}

type BarProps = ChartProps & { dataKey?: string; nameKey?: string };

const fallback = (height: number) => (
  <div
    className="flex w-full items-center justify-center rounded-xl bg-ink-50 text-[11px] text-ink-400"
    style={{ height }}
    role="status"
    aria-live="polite"
  >
    جارٍ تحميل الرسم...
  </div>
);

const TrendChartRuntime = lazy(() => import('./ChartsRuntime').then(module => ({ default: module.TrendChart })));
const SimpleBarChartRuntime = lazy(() => import('./ChartsRuntime').then(module => ({ default: module.SimpleBarChart })));
const HorizontalBarChartRuntime = lazy(() => import('./ChartsRuntime').then(module => ({ default: module.HorizontalBarChart })));
const CategoryPieChartRuntime = lazy(() => import('./ChartsRuntime').then(module => ({ default: module.CategoryPieChart })));
const ForecastChartRuntime = lazy(() => import('./ChartsRuntime').then(module => ({ default: module.ForecastChart })));

export function TrendChart({ data, height = 280 }: ChartProps) {
  return <Suspense fallback={fallback(height)}><TrendChartRuntime data={data} height={height} /></Suspense>;
}

export function SimpleBarChart({ data, height = 280, dataKey = 'value', nameKey = 'name' }: BarProps) {
  return <Suspense fallback={fallback(height)}><SimpleBarChartRuntime data={data} height={height} dataKey={dataKey} nameKey={nameKey} /></Suspense>;
}

export function HorizontalBarChart({ data, height = 280, dataKey = 'value', nameKey = 'name' }: BarProps) {
  return <Suspense fallback={fallback(height)}><HorizontalBarChartRuntime data={data} height={height} dataKey={dataKey} nameKey={nameKey} /></Suspense>;
}

export function CategoryPieChart({ data, height = 280 }: ChartProps) {
  return <Suspense fallback={fallback(height)}><CategoryPieChartRuntime data={data} height={height} /></Suspense>;
}

export function ForecastChart({ data, height = 280 }: ChartProps) {
  return <Suspense fallback={fallback(height)}><ForecastChartRuntime data={data} height={height} /></Suspense>;
}