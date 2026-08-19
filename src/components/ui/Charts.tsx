import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  direction: 'rtl' as const,
};

interface ChartProps {
  data: any[];
  height?: number;
}

export function TrendChart({ data, height = 280 }: ChartProps & { dataKeys?: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [Number(value).toLocaleString('en-US'), '']} />
        <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} fill="url(#colorSales)" name="المبيعات" />
        <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fill="url(#colorProfit)" name="الربح" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, height = 280, dataKey = 'value', nameKey = 'name' }: ChartProps & { dataKey?: string; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [Number(value).toLocaleString('en-US'), '']} />
        <Bar dataKey={dataKey} fill="#2563eb" radius={[6, 6, 0, 0]} name="القيمة" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({ data, height = 280, dataKey = 'value', nameKey = 'name' }: ChartProps & { dataKey?: string; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <YAxis type="category" dataKey={nameKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [Number(value).toLocaleString('en-US'), '']} />
        <Bar dataKey={dataKey} fill="#06b6d4" radius={[0, 6, 6, 0]} name="القيمة" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data, height = 280 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [Number(value).toLocaleString('en-US'), '']} />
        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Sans Arabic' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart({ data, height = 280 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [Number(value).toLocaleString('en-US'), '']} />
        <Line type="monotone" dataKey="forecast_value" stroke="#2563eb" strokeWidth={2} name="التنبؤ" dot={{ r: 4 }} />
        <Line type="monotone" dataKey="upper_bound" stroke="#06b6d4" strokeWidth={1} strokeDasharray="5 5" name="الحد الأعلى" dot={false} />
        <Line type="monotone" dataKey="lower_bound" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="الحد الأدنى" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export { COLORS };
