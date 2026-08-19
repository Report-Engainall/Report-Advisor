import { useMemo, useState } from 'react';
import { Activity, Database, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { profileDataset, type DatasetProfile } from '@/lib/free-toolbox';

const demoRows = [
  {الصنف:'A-100',المبيعات:120,الكمية:40,العميل:'عميل 1'},
  {الصنف:'A-101',المبيعات:90,الكمية:20,العميل:'عميل 2'},
  {الصنف:'A-102',المبيعات:15,الكمية:80,العميل:'عميل 3'},
  {الصنف:'A-103',المبيعات:210,الكمية:12,العميل:'عميل 1'},
];

export function DataLabPage(){
  const [rows,setRows]=useState<Record<string,unknown>[]>(demoRows);
  const profile=useMemo<DatasetProfile>(()=>profileDataset(rows),[rows]);
  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;const text=await file.text();try{const parsed=JSON.parse(text);if(Array.isArray(parsed)&&parsed.every(x=>x&&typeof x==='object'))setRows(parsed);}catch{/* Keep lab dependency-free; Excel/PDF ingestion remains in Import Center. */}};
  const cards=[['الاكتمال',`${(profile.completeness*100).toFixed(1)}%`,ShieldCheck],['الصفوف',profile.rows.toLocaleString('ar'),Database],['الأعمدة',profile.columns.toLocaleString('ar'),Activity],['التكرارات',profile.duplicateRows.toLocaleString('ar'),FileSearch]] as const;
  return <div dir="rtl" className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-primary-600 text-sm font-semibold"><Sparkles size={17}/> Data Intelligence Lab</div><h1 className="text-2xl font-bold text-ink-900 mt-1">مختبر البيانات المحلي</h1><p className="text-sm text-ink-500 mt-1">تحليل وصفي، جودة بيانات، شذوذ واتجاهات دون اشتراك خارجي.</p></div><label className="btn-secondary cursor-pointer"><input type="file" accept=".json" className="hidden" onChange={handleFile}/>تحميل JSON للتجربة</label></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs text-ink-500">{label}</span><Icon size={18} className="text-primary-500"/></div><div className="text-2xl font-bold text-ink-900 mt-2">{value}</div></div>)}</div>
    <div className="grid lg:grid-cols-3 gap-4"><section className="lg:col-span-2 rounded-2xl border border-ink-100 bg-white overflow-hidden"><div className="p-4 border-b border-ink-100"><h2 className="font-semibold text-ink-900">ملف الأعمدة</h2></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-ink-50 text-ink-500"><tr><th className="p-3 text-right">العمود</th><th className="p-3">النوع</th><th className="p-3">القيم</th><th className="p-3">الفريدة</th><th className="p-3">الشذوذ</th></tr></thead><tbody>{profile.columns.map(c=><tr key={c.name} className="border-t border-ink-100"><td className="p-3 font-medium">{c.name}</td><td className="p-3">{c.type}</td><td className="p-3">{c.count-c.nulls}</td><td className="p-3">{c.unique}</td><td className="p-3">{c.anomalies}</td></tr>)}</tbody></table></div></section><section className="rounded-2xl border border-ink-100 bg-white p-4"><h2 className="font-semibold text-ink-900">إنذارات الجودة</h2><div className="mt-3 space-y-2">{profile.warnings.length?<>{profile.warnings.map(w=><div key={w} className="rounded-xl bg-warning-50 border border-warning-100 p-3 text-sm text-ink-700">{w}</div>)}</>:<div className="rounded-xl bg-success-50 border border-success-100 p-3 text-sm">لا توجد إنذارات في العينة الحالية.</div>}</div></section></div>
  </div>;
}
