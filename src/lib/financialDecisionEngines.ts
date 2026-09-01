export type CashAction = 'COLLECT_NOW' | 'COLLECT_SOON' | 'MONITOR' | 'HOLD_PAYMENT' | 'PAY_NOW' | 'PAY_SOON';

export interface ReceivablePriorityInput { id: string; amount: number; overdueDays: number; customerScore?: number; lastPaymentDays?: number; }
export interface ReceivablePriority { id: string; amount: number; priority: CashAction; urgency: number; reason: string; }
export interface PaymentPriorityInput { id: string; amount: number; overdueDays: number; dependencyRisk?: number; deliveryRisk?: number; }
export interface PaymentPriority { id: string; amount: number; priority: CashAction; urgency: number; reason: string; }
export interface ReserveProtection { openingCash: number; minimumReserve: number; committedOutflow: number; collectibleInflow: number; protectedReserve: number; availableForPayments: number; blockedAmount: number; valid: boolean; }

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));
const nonNegativeFinite = (value: unknown) => Math.max(0, typeof value === 'number' && Number.isFinite(value) ? value : 0);
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function prioritizeReceivables(items: ReceivablePriorityInput[]): ReceivablePriority[] {
  return items.map(item => {
    const amount = nonNegativeFinite(item.amount);
    const overdue = clamp(item.overdueDays * 2);
    const customerRisk = clamp(100 - (item.customerScore ?? 50));
    const paymentStaleness = clamp((item.lastPaymentDays ?? 0) * 0.8);
    const urgency = Math.round(overdue * 0.5 + customerRisk * 0.3 + paymentStaleness * 0.2);
    const priority: CashAction = urgency >= 75 ? 'COLLECT_NOW' : urgency >= 50 ? 'COLLECT_SOON' : 'MONITOR';
    return { id: item.id, amount, priority, urgency, reason: urgency >= 75 ? 'تأخر مرتفع أو خطر تحصيل مرتفع.' : urgency >= 50 ? 'يحتاج متابعة تحصيل قريبة.' : 'لا توجد إشارة تحصيل حرجة.' };
  }).sort((a, b) => b.urgency - a.urgency || b.amount - a.amount);
}

export function prioritizeSupplierPayments(items: PaymentPriorityInput[], reserve: ReserveProtection): PaymentPriority[] {
  const available = Math.max(0, reserve.availableForPayments);
  return items.map(item => {
    const amount = nonNegativeFinite(item.amount);
    const dependency = clamp(item.dependencyRisk ?? 0);
    const delivery = clamp(item.deliveryRisk ?? 0);
    const overdue = clamp(item.overdueDays * 2);
    const liquidityPenalty = amount > available ? 25 : 0;
    const urgency = Math.round(overdue * 0.45 + dependency * 0.25 + delivery * 0.2 + liquidityPenalty * 0.1);
    const priority: CashAction = !reserve.valid || reserve.blockedAmount > 0 || amount > available
      ? 'HOLD_PAYMENT'
      : urgency >= 75 ? 'PAY_NOW' : urgency >= 50 ? 'PAY_SOON' : 'MONITOR';
    return { id: item.id, amount, priority, urgency, reason: priority === 'HOLD_PAYMENT' ? 'الدفع سيضغط على الاحتياطي النقدي المحمي.' : urgency >= 75 ? 'أولوية دفع مرتفعة بسبب التأخر أو مخاطر التوريد.' : urgency >= 50 ? 'دفع قريب مطلوب لتقليل خطر التشغيل.' : 'يمكن جدولة الدفع دون ضغط فوري.' };
  }).sort((a, b) => b.urgency - a.urgency || b.amount - a.amount);
}

export function protectCashReserve(input: { openingCash: number; minimumReservePct?: number; committedOutflow: number; collectibleInflow: number }): ReserveProtection {
  const valid = isFiniteNumber(input.openingCash)
    && isFiniteNumber(input.committedOutflow)
    && isFiniteNumber(input.collectibleInflow)
    && input.openingCash >= 0
    && input.committedOutflow >= 0
    && input.collectibleInflow >= 0
    && (input.minimumReservePct === undefined || (isFiniteNumber(input.minimumReservePct) && input.minimumReservePct >= 0 && input.minimumReservePct <= 100));
  const openingCash = nonNegativeFinite(input.openingCash);
  const minimumReservePct = clamp(input.minimumReservePct ?? 20, 0, 100);
  const minimumReserve = openingCash * minimumReservePct / 100;
  const committedOutflow = nonNegativeFinite(input.committedOutflow);
  const collectibleInflow = nonNegativeFinite(input.collectibleInflow);
  const protectedReserve = Math.max(minimumReserve, committedOutflow);
  const availableForPayments = valid ? Math.max(0, openingCash + collectibleInflow - protectedReserve) : 0;
  const blockedAmount = valid ? Math.max(0, protectedReserve - openingCash - collectibleInflow) : 1;
  return { openingCash, minimumReserve, committedOutflow, collectibleInflow, protectedReserve, availableForPayments, blockedAmount, valid };
}
