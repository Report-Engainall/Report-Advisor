import { Bookmark, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

export interface SavedViewBarProps<T extends Record<string, string | number | boolean | null>> {
  value: T; onChange: (value: T) => void; names: string[]; activeName: string | null; storageReady: boolean;
  save: (name: string, value: T) => boolean; load: (name: string) => T | null; remove: (name: string) => void; reset: () => void; resetValue: T;
  labels?: { save?: string; reset?: string; placeholder?: string }; className?: string;
}

export function SavedViewBar<T extends Record<string, string | number | boolean | null>>({ value, onChange, names, activeName, storageReady, save, load, remove, reset, resetValue, labels = {}, className = '' }: SavedViewBarProps<T>) {
  const [name, setName] = useState(''); const selected = activeName ?? '';
  return <div dir="rtl" className={`flex flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center ${className}`}>
    <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-ink-600"><Bookmark size={15} className="shrink-0 text-primary-600"/><span className="shrink-0">العروض المحفوظة</span></div>
    <select value={selected} onChange={event => { const picked = event.target.value; if (!picked) { reset(); onChange(resetValue); return; } const next = load(picked); if (next) onChange(next); }} className="input min-w-0 flex-1 py-2 text-xs" aria-label="العرض المحفوظ" disabled={!storageReady && names.length === 0}>
      <option value="">العرض الحالي</option>{names.map(item => <option key={item} value={item}>{item}</option>)}
    </select>
    <div className="flex flex-1 items-center gap-2"><input value={name} onChange={event => setName(event.target.value)} className="input min-w-0 flex-1 py-2 text-xs" placeholder={labels.placeholder ?? 'اسم العرض'} aria-label="اسم العرض المحفوظ" disabled={!storageReady} />
      <button type="button" onClick={() => { if (save(name, value)) setName(''); }} className="btn-secondary shrink-0 px-3 text-xs" disabled={!storageReady || !name.trim()}><Save size={14}/> {labels.save ?? 'حفظ'}</button></div>
    <div className="flex items-center gap-2">{activeName && <button type="button" onClick={() => remove(activeName)} className="btn-secondary px-3 text-xs text-danger-600" aria-label={`حذف العرض ${activeName}`}><Trash2 size={14}/> حذف</button>}
      <button type="button" onClick={() => { reset(); onChange(resetValue); setName(''); }} className="btn-secondary shrink-0 px-3 text-xs"><RotateCcw size={14}/> {labels.reset ?? 'إعادة ضبط'}</button></div>
  </div>;
}