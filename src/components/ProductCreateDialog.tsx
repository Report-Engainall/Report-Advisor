import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';

export interface ProductCreateDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function ProductCreateDialog({ onClose, onCreated }: ProductCreateDialogProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('قطعة');
  const [costPrice, setCostPrice] = useState('0');
  const [sellingPrice, setSellingPrice] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [reorderPoint, setReorderPoint] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSku = sku.trim();
    const normalizedName = name.trim();
    const normalizedUnit = unit.trim();
    const cost = Number(costPrice);
    const selling = Number(sellingPrice);
    const minimum = Number(minStock);
    const reorder = Number(reorderPoint);

    if (!normalizedSku) return setError('رمز SKU مطلوب');
    if (!normalizedName) return setError('اسم المنتج مطلوب');
    if (!normalizedUnit) return setError('الوحدة مطلوبة');
    if (![cost, selling, minimum, reorder].every(Number.isFinite) || cost < 0 || selling < 0 || minimum < 0 || reorder < 0) {
      return setError('قِيَم التكلفة والسعر والمخزون يجب أن تكون أرقامًا غير سالبة');
    }

    setSaving(true);
    setError(null);
    try {
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('TENANT_REQUIRED');
      const { error: rpcError } = await supabase.rpc('import_upsert_product', {
        p_company_id: companyId,
        p_sku: normalizedSku,
        p_name: normalizedName,
        p_unit: normalizedUnit,
        p_cost_price: cost,
        p_selling_price: selling,
        p_min_stock: minimum,
        p_reorder_point: reorder,
        p_is_active: isActive,
        p_null_policy: 'preserve',
      });
      if (rpcError) throw rpcError;
      onCreated();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إنشاء المنتج');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:items-center sm:p-4 safe-bottom" role="dialog" aria-modal="true" aria-labelledby="product-create-title">
      <div className="my-3 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl sm:my-8" dir="rtl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 id="product-create-title" className="text-lg font-bold text-ink-900">منتج جديد</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="rounded-lg p-2 text-ink-500 hover:bg-ink-50"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="max-h-[calc(100dvh-7rem)] space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label htmlFor="product-create-sku" className="mb-1 block text-xs font-medium text-ink-700">SKU *</label><input id="product-create-sku" value={sku} onChange={event => setSku(event.target.value)} className="input w-full" required /></div>
            <div><label htmlFor="product-create-name" className="mb-1 block text-xs font-medium text-ink-700">اسم المنتج *</label><input id="product-create-name" autoFocus value={name} onChange={event => setName(event.target.value)} className="input w-full" required /></div>
            <div><label htmlFor="product-create-unit" className="mb-1 block text-xs font-medium text-ink-700">الوحدة *</label><input id="product-create-unit" value={unit} onChange={event => setUnit(event.target.value)} className="input w-full" required /></div>
            <div><label htmlFor="product-create-cost" className="mb-1 block text-xs font-medium text-ink-700">سعر التكلفة *</label><input id="product-create-cost" value={costPrice} onChange={event => setCostPrice(event.target.value)} className="input w-full" type="number" min="0" step="0.01" required /></div>
            <div><label htmlFor="product-create-selling" className="mb-1 block text-xs font-medium text-ink-700">سعر البيع *</label><input id="product-create-selling" value={sellingPrice} onChange={event => setSellingPrice(event.target.value)} className="input w-full" type="number" min="0" step="0.01" required /></div>
            <div><label htmlFor="product-create-min-stock" className="mb-1 block text-xs font-medium text-ink-700">الحد الأدنى للمخزون *</label><input id="product-create-min-stock" value={minStock} onChange={event => setMinStock(event.target.value)} className="input w-full" type="number" min="0" step="0.01" required /></div>
            <div><label htmlFor="product-create-reorder" className="mb-1 block text-xs font-medium text-ink-700">نقطة إعادة الطلب *</label><input id="product-create-reorder" value={reorderPoint} onChange={event => setReorderPoint(event.target.value)} className="input w-full" type="number" min="0" step="0.01" required /></div>
            <label htmlFor="product-create-active" className="flex items-center gap-2 self-end rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-700"><input id="product-create-active" type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} />المنتج نشط</label>
          </div>
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-lg border border-ink-200 px-4 py-2 text-sm">إلغاء</button><button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ المنتج'}</button></div>
        </form>
      </div>
    </div>
  );
}
