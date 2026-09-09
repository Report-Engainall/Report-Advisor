import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';

export const COLORS = ['#047857', '#0f766e', '#b8891c', '#115e59', '#d97706', '#15803d', '#78716c', '#0d9488'];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #dfe8e2',
  borderRadius: '16px',
  fontSize: '12px',
  boxShadow: '0 14px 36px rgba(6, 78, 59, 0.12)',
  direction: 'rtl' as const,
  padding: '10px 12px',
};

interface ChartProps { data: object[]; height?: number; }

function formatValue(value: unknown): string {
  if (typeof value === 'number') return value.toLocaleString('en-US');
  if (typeof value === 'string') return value;
  return '';
}

const tooltipFormatter = (value: unknown): [string, string] => [formatValue(value), ''];
const axisTick = { fontSize: 11, fill: '#7c8b84' };
const gridProps = { strokeDasharray: '4 6', stroke: '#e8eee9', vertical: false };

export function TrendChart({ data, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 14, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.26} /><stop offset="100%" stopColor="#059669" stopOpacity={0.01} /></linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b8891c" stopOpacity={0.24} /><stop offset="100%" stopColor="#b8891c" stopOpacity={0.01} /></linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} width={48} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} cursor={{ stroke: '#b8c9bf', strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey="sales" stroke="#047857" strokeWidth={2.8} fill="url(#colorSales)" name="المبيعات" activeDot={{ r: 5, strokeWidth: 2 }} />
        <Area type="monotone" dataKey="profit" stroke="#b8891c" strokeWidth={2.4} fill="url(#colorProfit)" name="الربح" activeDot={{ r: 5, strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, height = 300, dataKey = 'value', nameKey = 'name' }: ChartProps & { dataKey?: string; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 14, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={nameKey} tick={axisTick} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} width={48} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} cursor={{ fill: '#ecfdf5', opacity: 0.7 }} />
        <Bar dataKey={dataKey} fill="#047857" radius={[10, 10, 3, 3]} name="القيمة" maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({ data, height = 300, dataKey = 'value', nameKey = 'name' }: ChartProps & { dataKey?: string; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 6, right: 12, left: 12, bottom: 6 }}>
        <CartesianGrid {...gridProps} horizontal={false} />
        <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
        <YAxis type="category" dataKey={nameKey} tick={axisTick} axisLine={false} tickLine={false} width={112} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} cursor={{ fill: '#ecfdf5', opacity: 0.7 }} />
        <Bar dataKey={dataKey} fill="#0f766e" radius={[0, 9, 9, 0]} name="القيمة" maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="sales" nameKey="name" cx="50%" cy="46%" outerRadius={92} innerRadius={58} paddingAngle={3} stroke="#fff" strokeWidth={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Sans Arabic', paddingTop: '8px' }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart({ data, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 14, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} width={48} />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} cursor={{ stroke: '#b8c9bf', strokeDasharray: '4 4' }} />
        <Line type="monotone" dataKey="forecast_value" stroke="#047857" strokeWidth={3} name="التنبؤ" dot={{ r: 4, fill: '#047857' }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="upper_bound" stroke="#0f766e" strokeWidth={1.6} strokeDasharray="5 5" name="الحد الأعلى" dot={false} />
        <Line type="monotone" dataKey="lower_bound" stroke="#b8891c" strokeWidth={1.6} strokeDasharray="5 5" name="الحد الأدنى" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
