import { type ReactNode, useId } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export const COLORS = ['#147e74', '#e0a21a', '#3a9a8d', '#c8870b', '#dc2626', '#0f655d', '#f6ca57', '#5cb6a8'];

const tooltipStyle = {
  backgroundColor: '#062f2d',
  border: '1px solid rgba(191,235,226,.20)',
  borderRadius: '12px',
  fontSize: '11px',
  boxShadow: '0 18px 34px -22px rgba(5,46,43,.72)',
  color: '#f4fffc',
  direction: 'rtl' as const,
  padding: '10px 12px',
};

interface ChartProps {
  data: object[];
  height?: number;
  ariaLabel?: string;
  emptyMessage?: string;
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString('en-US') : 'غير متاح';
  if (typeof value === 'string') return value;
  return '';
}

const tooltipFormatter = (value: unknown): [string, string] => [formatValue(value), ''];

function ChartFrame({
  data,
  height,
  ariaLabel,
  emptyMessage = 'لا توجد بيانات كافية لبناء هذا الرسم من اللقطة الحالية.',
  children,
}: ChartProps & { children: ReactNode }) {
  if (data.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="ag-chart-frame ag-chart-empty flex items-center justify-center rounded-[14px] border border-dashed border-ink-200 bg-ink-50/55 px-5 text-center text-[11px] leading-5 text-ink-500" data-chart-state="empty"
        style={{ minHeight: height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="ag-chart-frame ag-chart-ready overflow-hidden rounded-[14px] border border-ink-100 bg-white/80" data-chart-state="ready"
      style={{ minHeight: height }}
    >
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChart({
  data,
  height = 280,
  ariaLabel = 'اتجاه المبيعات والربح عبر الفترة الحالية',
  emptyMessage,
}: ChartProps) {
  const gradientId = useId().replace(/:/g, '');
  const salesGradientId = `ag-sales-${gradientId}`;
  const profitGradientId = `ag-profit-${gradientId}`;
  return (
    <ChartFrame data={data} height={height} ariaLabel={ariaLabel} emptyMessage={emptyMessage}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={salesGradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#147e74" stopOpacity={0.15} /><stop offset="95%" stopColor="#147e74" stopOpacity={0} /></linearGradient>
          <linearGradient id={profitGradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3a9a8d" stopOpacity={0.15} /><stop offset="95%" stopColor="#3a9a8d" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4efec" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6f918a' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6f918a' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
        <Area type="monotone" dataKey="sales" stroke="#147e74" strokeWidth={2} fill={`url(#${salesGradientId})`} name="المبيعات" />
        <Area type="monotone" dataKey="profit" stroke="#3a9a8d" strokeWidth={2} fill={`url(#${profitGradientId})`} name="الربح" />
      </AreaChart>
    </ChartFrame>
  );
}

export function SimpleBarChart({
  data,
  height = 280,
  dataKey = 'value',
  nameKey = 'name',
  ariaLabel = 'رسم أعمدة للمؤشر الحالي',
  emptyMessage,
}: ChartProps & { dataKey?: string; nameKey?: string }) {
  return (
    <ChartFrame data={data} height={height} ariaLabel={ariaLabel} emptyMessage={emptyMessage}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4efec" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 11, fill: '#6f918a' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6f918a' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
        <Bar dataKey={dataKey} fill="#147e74" radius={[6, 6, 0, 0]} name="القيمة" />
      </BarChart>
    </ChartFrame>
  );
}

export function HorizontalBarChart({
  data,
  height = 280,
  dataKey = 'value',
  nameKey = 'name',
  ariaLabel = 'رسم أفقي لترتيب القيم الحالية',
  emptyMessage,
}: ChartProps & { dataKey?: string; nameKey?: string }) {
  return (
    <ChartFrame data={data} height={height} ariaLabel={ariaLabel} emptyMessage={emptyMessage}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4efec" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#6f918a' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
        <YAxis type="category" dataKey={nameKey} tick={{ fontSize: 11, fill: '#58766f' }} axisLine={false} tickLine={false} width={100} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
        <Bar dataKey={dataKey} fill="#e0a21a" radius={[0, 6, 6, 0]} name="القيمة" />
      </BarChart>
    </ChartFrame>
  );
}

export function CategoryPieChart({
  data,
  height = 280,
  ariaLabel = 'توزيع الفئات في اللقطة الحالية',
  emptyMessage,
}: ChartProps) {
  return (
    <ChartFrame data={data} height={height} ariaLabel={ariaLabel} emptyMessage={emptyMessage}>
      <PieChart>
        <Pie data={data} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Sans Arabic' }} />
      </PieChart>
    </ChartFrame>
  );
}

export function ForecastChart({
  data,
  height = 280,
  ariaLabel = 'التنبؤ مع الحدود العليا والدنيا للقيمة الحالية',
  emptyMessage = 'لا يمكن عرض التنبؤ قبل توفر حد أدنى من البيانات المقبولة.',
}: ChartProps) {
  return (
    <ChartFrame data={data} height={height} ariaLabel={ariaLabel} emptyMessage={emptyMessage}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4efec" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6f918a' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6f918a' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
        <Line type="monotone" dataKey="forecast_value" stroke="#147e74" strokeWidth={2} name="التنبؤ" dot={{ r: 4 }} />
        <Line type="monotone" dataKey="upper_bound" stroke="#e0a21a" strokeWidth={1} strokeDasharray="5 5" name="الحد الأعلى" dot={false} />
        <Line type="monotone" dataKey="lower_bound" stroke="#c8870b" strokeWidth={1} strokeDasharray="5 5" name="الحد الأدنى" dot={false} />
      </LineChart>
    </ChartFrame>
  );
}